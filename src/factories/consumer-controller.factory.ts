import {invokeMethod, MetadataInspector} from '@loopback/context';
import {
  EnhancedConsumer,
  ConsumerEvents,
  ConsumerSubscribeTopic,
  EachBatchPayload,
  EachMessagePayload,
  MetadataMap,
} from '../types';
import {withPrefix, normalizeTopic} from '../utils';
import {BaseFactory} from './base.factory';

export class ConsumerControllerFactory extends BaseFactory {
  async create(consumer: EnhancedConsumer) {
    this.controller = await this.context.get<{[method: string]: Function}>(
      `controllers.${this.controllerClass.name}`,
    );

    await this.registerSubscribeMethods(consumer);

    this.registerEventMethods(consumer, ConsumerEvents.HEARTBEAT);
    this.registerEventMethods(consumer, ConsumerEvents.COMMIT_OFFSETS);
    this.registerEventMethods(consumer, ConsumerEvents.GROUP_JOIN);
    this.registerEventMethods(consumer, ConsumerEvents.FETCH);
    this.registerEventMethods(consumer, ConsumerEvents.START_BATCH_PROCESS);
    this.registerEventMethods(consumer, ConsumerEvents.END_BATCH_PROCESS);
    this.registerEventMethods(consumer, ConsumerEvents.STOP);
    this.registerEventMethods(consumer, ConsumerEvents.CONNECT);
    this.registerEventMethods(consumer, ConsumerEvents.DISCONNECT);
    this.registerEventMethods(consumer, ConsumerEvents.REQUEST);
    this.registerEventMethods(consumer, ConsumerEvents.REQUEST_TIMEOUT);
    this.registerEventMethods(consumer, ConsumerEvents.REQUEST_QUEUE_SIZE);

    return this.controller;
  }

  protected multipleSubscriptionMethodsError(
    methods: MetadataMap<ConsumerSubscribeTopic>,
  ) {
    const methodNames = Object.keys(methods).join(', ');

    return new Error(
      `${methodNames} cannot be applied more than once on ${this.controllerClass.name}.
      Each controller must consume only one runner and consumer group and any topics count`,
    );
  }

  private async registerSubscribeMethods(consumer: EnhancedConsumer) {
    const subscribeMethods =
      MetadataInspector.getAllMethodMetadata<ConsumerSubscribeTopic>(
        withPrefix(ConsumerEvents.SUBSCRIBE),
        this.controllerClass.prototype,
      ) ?? {};

    const methodNames = Object.keys(subscribeMethods);

    if (!methodNames.length) {
      return;
    }

    if (methodNames.length > 1) {
      throw this.multipleSubscriptionMethodsError(subscribeMethods);
    }

    const [method, metadata] = Object.entries(subscribeMethods)[0];
    const {runner = {}, topics = []} = metadata;

    for await (const topic of topics) {
      await consumer.subscribe(normalizeTopic(topic));
    }

    const {asBatch = false, ...config} = runner;
    const runnerFn = asBatch ? 'eachBatch' : 'eachMessage';

    await consumer.run({
      ...config,
      [runnerFn]: async (data: EachBatchPayload | EachMessagePayload) => {
        await invokeMethod(this.controller, method, this.context, [data]);
      },
    });
  }
}
