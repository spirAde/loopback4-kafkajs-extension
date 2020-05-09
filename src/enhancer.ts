import {
  Entity,
  EventName,
  EnhancedEntity,
  ProducerConfig,
  ConsumerConfig,
  AdminConfig,
  Kafka,
  Consumer,
  EnhancedConsumer,
  Producer,
  EnhancedProducer,
  Admin,
  EnhancedAdmin,
} from './types';

function proxyInvokeListener(
  listener: () => void,
  eventName: EventName,
  removeFn: (eventName: EventName) => void,
) {
  Object.defineProperty(listener, 'name', {value: eventName});

  const handler = {
    apply: function (target: () => void) {
      removeFn(target.name as EventName);
    },
  };

  return new Proxy(listener, handler);
}

export function enhancer(entity: Consumer): EnhancedConsumer;
export function enhancer(entity: Producer): EnhancedProducer;
export function enhancer(entity: Admin): EnhancedAdmin;
export function enhancer(entity: Entity): EnhancedEntity {
  return {
    ...entity,
    isConnected: false,
    listeners: new Map(),
    addListener(eventName, fn) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      const listener = this.on(eventName, fn);

      if (listener) {
        this.listeners.set(eventName, listener);
      }

      return proxyInvokeListener(
        listener,
        eventName,
        this.removeListener.bind(this),
      );
    },
    removeListener(eventName) {
      if (!this.listeners.has(eventName)) {
        console.warn(`Listener ${eventName} is not found in listeners`);
        return;
      }

      const listener = this.listeners.get(eventName);

      if (typeof listener === 'function') {
        listener();
        this.listeners.delete(eventName);
      }
    },
    async connect() {
      await entity.connect();
      this.isConnected = true;
    },
    async disconnect() {
      await entity.disconnect();
      this.isConnected = false;
    },
  };
}

export function senderEnhancer(
  producer: EnhancedProducer,
  config: ProducerConfig,
): EnhancedProducer {
  return {
    ...producer,
    send(record) {
      return producer.send(
        record.compression
          ? record
          : {...record, compression: config.compression},
      );
    },
    sendBatch(batch) {
      return producer.sendBatch(
        batch.compression ? batch : {...batch, compression: config.compression},
      );
    },
  };
}

export function createConsumer(kafka: Kafka, config: ConsumerConfig) {
  return enhancer(kafka.consumer(config));
}

export function createProducer(kafka: Kafka, config: ProducerConfig) {
  return senderEnhancer(enhancer(kafka.producer(config)), config);
}

export function createAdmin(kafka: Kafka, config: AdminConfig) {
  return enhancer(kafka.admin(config));
}
