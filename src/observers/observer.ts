import {inject, LifeCycleObserver} from '@loopback/core';
import {KafkaBindings} from '../keys';
import {Producer, Consumer, Admin} from '../types';
import {KafkaProvider} from '../providers';

export class KafkaObserver implements LifeCycleObserver {
  admin: Admin;
  producer: Producer;
  consumers: Map<string, Consumer>;

  constructor(
    @inject(KafkaBindings.KAFKA_SERVICE) private kafka: KafkaProvider,
  ) {
    this.admin = this.kafka.admin;
    this.producer = this.kafka.producer;
    this.consumers = this.kafka.consumers;
  }

  async start() {
    this.admin && await this.admin.connect();
    this.producer && await this.producer.connect();

    const promises: Promise<void>[] = [];

    this.consumers.forEach(consumer => {
      promises.push(consumer.connect());
    });

    await Promise.all(promises);
  }

  async stop() {
    this.admin && await this.admin.disconnect();
    this.producer && await this.producer.disconnect();

    const promises: Promise<void>[] = [];

    this.consumers.forEach(consumer => {
      promises.push(consumer.disconnect());
    });

    await Promise.all(promises);
  }
}
