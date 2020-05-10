import {ControllerClass} from '@loopback/core';
import {
  Kafka,
  KafkaConfig as KafkaClientConfig,
  ProducerConfig as KafkaProducerConfig,
  ConsumerConfig as KafkaConsumerConfig,
  AdminConfig as KafkaAdminConfig,
  Producer as KafkaProducer,
  Consumer as KafkaConsumer,
  Admin as KafkaAdmin,
  ConsumerRunConfig as KafkaConsumerRunConfig,
  ConsumerSubscribeTopic as KafkaConsumerSubscribeTopic,
  ConnectEvent,
  DisconnectEvent,
  RequestEvent,
  RequestTimeoutEvent,
  RequestQueueSizeEvent,
  ConsumerHeartbeatEvent,
  ConsumerCommitOffsetsEvent,
  ConsumerGroupJoinEvent,
  ConsumerFetchEvent,
  ConsumerStartBatchProcessEvent,
  ConsumerEndBatchProcessEvent,
  ConsumerCrashEvent,
} from 'kafkajs';
export * from 'kafkajs';

export type Entity = Consumer | Producer | Admin;
export type EnhancedEntity = Entity & Enhancer<EventName>;
export type EntityName = 'producer' | 'consumer' | 'admin';

export enum ConsumerEvents {
  HEARTBEAT = 'consumer.heartbeat',
  COMMIT_OFFSETS = 'consumer.commit_offsets',
  GROUP_JOIN = 'consumer.group_join',
  FETCH = 'consumer.fetch',
  START_BATCH_PROCESS = 'consumer.start_batch_process',
  END_BATCH_PROCESS = 'consumer.end_batch_process',
  STOP = 'consumer.stop',
  CRASH = 'consumer.crash',
  SUBSCRIBE = 'consumer.subscribe',
  CONNECT = 'consumer.connect',
  DISCONNECT = 'consumer.disconnect',
  REQUEST = 'consumer.network.request',
  REQUEST_TIMEOUT = 'consumer.network.request_timeout',
  REQUEST_QUEUE_SIZE = 'consumer.network.request_queue_size',
}

export enum ProducerEvents {
  CONNECT = 'producer.connect',
  DISCONNECT = 'producer.disconnect',
  REQUEST = 'producer.network.request',
  REQUEST_TIMEOUT = 'producer.network.request_timeout',
  REQUEST_QUEUE_SIZE = 'producer.network.request_queue_size',
}

export enum AdminEvents {
  CONNECT = 'admin.connect',
  DISCONNECT = 'admin.disconnect',
  REQUEST = 'admin.network.request',
  REQUEST_TIMEOUT = 'admin.network.request_timeout',
  REQUEST_QUEUE_SIZE = 'admin.network.request_queue_size',
}

export type ConsumerEventName =
  | 'consumer.heartbeat'
  | 'consumer.commit_offsets'
  | 'consumer.group_join'
  | 'consumer.fetch'
  | 'consumer.start_batch_process'
  | 'consumer.end_batch_process'
  | 'consumer.stop'
  | 'consumer.crash'
  | 'consumer.connect'
  | 'consumer.disconnect'
  | 'consumer.network.request'
  | 'consumer.network.request_timeout'
  | 'consumer.network.request_queue_size';

export type ProducerEventName =
  | 'producer.connect'
  | 'producer.disconnect'
  | 'producer.network.request'
  | 'producer.network.request_timeout'
  | 'producer.network.request_queue_size';

export type AdminEventName =
  | 'admin.connect'
  | 'admin.disconnect'
  | 'admin.network.request'
  | 'admin.network.request_timeout'
  | 'admin.network.request_queue_size';

export type EventName = ConsumerEventName | ProducerEventName | AdminEventName;
export type EventPayload =
  | ConnectEvent
  | DisconnectEvent
  | RequestEvent
  | RequestTimeoutEvent
  | RequestQueueSizeEvent
  | ConsumerHeartbeatEvent
  | ConsumerCommitOffsetsEvent
  | ConsumerGroupJoinEvent
  | ConsumerFetchEvent
  | ConsumerStartBatchProcessEvent
  | ConsumerEndBatchProcessEvent
  | ConsumerCrashEvent;

export enum CommonEvents {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  REQUEST = 'network.request',
  REQUEST_TIMEOUT = 'network.request_timeout',
  REQUEST_QUEUE_SIZE = 'network.request_queue_size',
}

export enum CompressionTypes {
  GZIP = 1,
  Snappy = 2,
  LZ4 = 3,
  ZSTD = 4,
}

export interface KafkaConfig extends KafkaClientConfig {
  codecs?: Partial<Record<CompressionTypes, unknown>>
}
export interface ConsumerConfig extends KafkaConsumerConfig {}
export interface AdminConfig extends KafkaAdminConfig {}
export interface ProducerConfig extends KafkaProducerConfig {
  compression?: CompressionTypes;
}

export type RunnerConfig = Omit<
  KafkaConsumerRunConfig,
  'eachMessage' | 'eachBatch'
> & {
  asBatch?: boolean;
};

export type TopicName = string | RegExp;
export type NormalizedTopic = KafkaConsumerSubscribeTopic;
export type Topic = TopicName | NormalizedTopic;

export type Enhancer<E> = {
  isConnected: boolean;
  listeners: Map<E, () => void>;
  addListener(eventName: E, fn: (payload: EventPayload) => void): () => void;
  removeListener(eventName: E): void;
};

export type Consumer = KafkaConsumer;
export type EnhancedConsumer = Consumer & Enhancer<ConsumerEventName>;
export type Producer = KafkaProducer;
export type EnhancedProducer = Producer & Enhancer<ProducerEventName>;
export type Admin = KafkaAdmin;
export type EnhancedAdmin = Admin & Enhancer<AdminEventName>;

export interface MetadataMap<T> {
  [methodName: string]: T;
}

export interface KafkaProducerControllerMetadata {
  entity: 'producer';
}

export interface KafkaConsumerControllerMetadata {
  entity: 'consumer';
  config: KafkaConsumerConfig;
  runner?: RunnerConfig;
}

export interface KafkaAdminControllerMetadata {
  entity: 'admin';
}

export type KafkaControllerMetadata =
  | KafkaProducerControllerMetadata
  | KafkaConsumerControllerMetadata
  | KafkaAdminControllerMetadata;

export interface PoolSourceOptions<T> {
  config?: T;
  controller?: ControllerClass;
  runner?: RunnerConfig;
}

export interface PoolControllers {
  admin?: PoolSourceOptions<KafkaAdminConfig>;
  producer?: PoolSourceOptions<ProducerConfig>;
  consumers?: PoolSourceOptions<KafkaConsumerConfig>[];
}

export interface KafkaProviderPayload {
  client: Kafka;
  admin: Admin;
  producer: Producer;
  consumers: Map<string, Consumer>;
}
