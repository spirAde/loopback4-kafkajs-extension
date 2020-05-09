import {
  MetadataAccessor,
  MethodDecoratorFactory,
  inject,
} from '@loopback/context';
import {MetadataInspector, ClassDecoratorFactory} from '@loopback/metadata';
import {
  EntityName,
  ConsumerEvents,
  ConsumerSubscribeTopic,
  CommonEvents,
  KafkaControllerMetadata,
} from '../types';
import {withPrefix} from '../utils';
import {ControllerClass} from '@loopback/core';

export const KAFKA_CONTROLLER_KEY = MetadataAccessor.create<
  KafkaControllerMetadata,
  ClassDecorator
>(withPrefix('controller'));

export function getKafkaControllerMetadata<T = unknown>(
  target: ControllerClass,
): KafkaControllerMetadata {
  return MetadataInspector.getClassMetadata<KafkaControllerMetadata>(
    KAFKA_CONTROLLER_KEY,
    target,
    {ownMetadataOnly: true},
  )!;
}

export namespace kafka {
  export function consumer(name: string) {
    return inject(withPrefix('consumer', name));
  }

  export function producer() {
    return inject(withPrefix('producer'));
  }

  export function admin() {
    return inject(withPrefix('admin'));
  }

  // common (producer & consumer & admin)
  export function controller(config: KafkaControllerMetadata) {
    return ClassDecoratorFactory.createDecorator<KafkaControllerMetadata>(
      KAFKA_CONTROLLER_KEY,
      config,
    );
  }

  export function connect(entity: EntityName) {
    return MethodDecoratorFactory.createDecorator(
      withPrefix(CommonEvents.CONNECT, entity),
      entity,
    );
  }

  export function disconnect(entity: EntityName) {
    return MethodDecoratorFactory.createDecorator(
      withPrefix(CommonEvents.DISCONNECT, entity),
      entity,
    );
  }

  export function request(entity: EntityName) {
    return MethodDecoratorFactory.createDecorator(
      withPrefix(CommonEvents.REQUEST, entity),
      entity,
    );
  }

  export function requestTimeout(entity: EntityName) {
    return MethodDecoratorFactory.createDecorator(
      withPrefix(CommonEvents.REQUEST_TIMEOUT, entity),
      entity,
    );
  }

  export function requestQueueSize(entity: EntityName) {
    return MethodDecoratorFactory.createDecorator(
      withPrefix(CommonEvents.REQUEST_QUEUE_SIZE, entity),
      entity,
    );
  }

  // consumer only
  export function heartbeat() {
    return MethodDecoratorFactory.createDecorator(
      withPrefix(ConsumerEvents.HEARTBEAT),
      true,
    );
  }

  export function commitOffsets() {
    return MethodDecoratorFactory.createDecorator(
      withPrefix(ConsumerEvents.COMMIT_OFFSETS),
      true,
    );
  }

  export function groupJoin() {
    return MethodDecoratorFactory.createDecorator(
      withPrefix(ConsumerEvents.GROUP_JOIN),
      true,
    );
  }

  export function fetch() {
    return MethodDecoratorFactory.createDecorator(
      withPrefix(ConsumerEvents.FETCH),
      true,
    );
  }

  export function startBatchProcess() {
    return MethodDecoratorFactory.createDecorator(
      withPrefix(ConsumerEvents.START_BATCH_PROCESS),
      true,
    );
  }

  export function endBatchProcess() {
    return MethodDecoratorFactory.createDecorator(
      withPrefix(ConsumerEvents.END_BATCH_PROCESS),
      true,
    );
  }

  export function crash() {
    return MethodDecoratorFactory.createDecorator(
      withPrefix(ConsumerEvents.CRASH),
      true,
    );
  }

  export function stop() {
    return MethodDecoratorFactory.createDecorator(
      withPrefix(ConsumerEvents.STOP),
      true,
    );
  }

  export function subscribe(metadata: ConsumerSubscribeTopic) {
    return MethodDecoratorFactory.createDecorator(
      withPrefix(ConsumerEvents.SUBSCRIBE),
      metadata,
    );
  }
}
