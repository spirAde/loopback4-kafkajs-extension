import {
  inject,
  Context,
  ControllerClass,
  CoreBindings,
  Application,
  Binding,
} from '@loopback/core';
import {Provider} from '@loopback/context';
import {
  Kafka,
  EnhancedAdmin,
  EnhancedConsumer,
  EnhancedProducer,
  KafkaConfig,
  KafkaProviderPayload,
  PoolSourceOptions,
  AdminConfig,
  ConsumerConfig,
  ProducerConfig,
  PoolControllers,
  CompressionCodecs,
} from '../types';
import {
  ConsumerControllerFactory,
  ProducerControllerFactory,
  AdminControllerFactory,
} from '../factories';
import {getKafkaControllerMetadata} from '../decorators';
import {KafkaBindings, KafkaTags} from '../keys';
import {createAdmin, createConsumer, createProducer} from '../enhancer';
import {withPrefix} from '../utils';

export class KafkaProvider implements Provider<KafkaProviderPayload> {
  client: Kafka;
  admin: EnhancedAdmin;
  producer: EnhancedProducer;
  consumers: Map<string, EnhancedConsumer>;

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    application: Application,
    @inject(KafkaBindings.KAFKA_CLIENT_CONFIG)
    kafkaConfig: KafkaConfig,
    @inject(KafkaBindings.KAFKA_PRODUCER_CONFIG)
    producerConfig: KafkaConfig,
    @inject(KafkaBindings.KAFKA_ADMIN_CONFIG)
    adminConfig: KafkaConfig,
  ) {
    const pool: PoolControllers = this.parseControllers(application) ?? {};

    this.configureClient(kafkaConfig);
    this.configureAdmin(application, adminConfig, pool.admin);
    this.configureProducer(application, producerConfig, pool.producer);
    this.configureConsumers(application, pool.consumers);
  }

  public value() {
    return {
      client: this.client,
      admin: this.admin,
      producer: this.producer,
      consumers: this.consumers,
    };
  }

  private parseControllers(context: Application) {
    const controllers: ControllerClass[] =
      context
        .findByTag(KafkaTags.KAFKA_CONTROLLER_TAG)
        .map(
          (binding: Readonly<Binding<ControllerClass>>) =>
            binding.valueConstructor!,
        ) ?? [];

    return controllers.reduce(
      (accumulator: PoolControllers, controller: ControllerClass) => {
        const metadata = getKafkaControllerMetadata(controller!);

        if (!metadata) {
          return accumulator;
        }

        if (metadata?.entity === 'admin' || metadata?.entity === 'producer') {
          return {
            ...accumulator,
            [metadata.entity]: {controller},
          };
        }

        return {
          ...accumulator,
          consumers: [
            ...(accumulator.consumers ?? []),
            {
              config: metadata.config,
              runner: metadata.runner,
              controller,
            },
          ],
        };
      },
      {},
    );
  }

  private configureClient(kafkaConfig: KafkaConfig) {
    this.client = new Kafka(kafkaConfig);

    Object.assign(CompressionCodecs, kafkaConfig.codecs);
  }

  private configureAdmin(
    context: Application,
    adminConfig: AdminConfig,
    admin?: PoolSourceOptions<AdminConfig>,
  ) {
    this.admin = createAdmin(this.client, adminConfig);
    this.bindAdmin(context);

    if (admin) {
      this.enhanceAdminController(context, admin).catch(error =>
        console.log(error),
      );
    }
  }

  private configureProducer(
    context: Application,
    producerConfig: ProducerConfig,
    producer?: PoolSourceOptions<ProducerConfig>,
  ) {
    this.producer = createProducer(this.client, producerConfig);
    this.bindProducer(context);

    if (producer) {
      this.enhanceProducerController(context, producer).catch(error =>
        console.log(error),
      );
    }
  }

  private configureConsumers(
    context: Application,
    consumers?: PoolSourceOptions<ConsumerConfig>[],
  ) {
    if (consumers && consumers.length > 0) {
      this.consumers = new Map(
        consumers.map(({config}) => [
          config!.groupId,
          createConsumer(this.client, config!),
        ]),
      );
      this.bindConsumers(context);
      this.enhanceConsumerControllers(context, consumers).catch(error =>
        console.log(error),
      );
    }
  }

  private bindAdmin(context: Application) {
    context.bind(withPrefix('admin')).to(this.admin);
  }

  private bindProducer(context: Application) {
    context.bind(withPrefix('producer')).to(this.producer);
  }

  private bindConsumers(context: Application) {
    this.consumers.forEach((consumer, groupId) => {
      context.bind(withPrefix('consumer', groupId)).to(consumer);
    });
  }

  private async enhanceAdminController(
    context: Context,
    admin: PoolSourceOptions<AdminConfig>,
  ) {
    admin.controller &&
      (await new AdminControllerFactory(context, admin.controller).create(
        this.admin,
      ));
  }

  private async enhanceProducerController(
    context: Context,
    producer: PoolSourceOptions<ProducerConfig>,
  ) {
    producer.controller &&
      (await new ProducerControllerFactory(context, producer.controller).create(
        this.producer,
      ));
  }

  private async enhanceConsumerControllers(
    context: Context,
    consumers: PoolSourceOptions<ConsumerConfig>[],
  ) {
    for (const {config, controller, runner} of consumers) {
      if (!config) {
        throw KafkaProvider.consumerConfigNotFoundError(controller!);
      }

      const consumer = this.consumers.get(config.groupId)!;

      await new ConsumerControllerFactory(context, controller!).create(
        consumer,
        runner,
      );
    }
  }

  private static consumerConfigNotFoundError(controller: ControllerClass) {
    return new Error(
      `${controller} doesn't contain any configuration.
      At least groupId property must be set`,
    );
  }
}
