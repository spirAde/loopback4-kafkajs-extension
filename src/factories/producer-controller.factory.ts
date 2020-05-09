import {EnhancedProducer, ProducerEvents} from '../types';
import {BaseFactory} from './base.factory';

export class ProducerControllerFactory extends BaseFactory {
  async create(producer: EnhancedProducer) {
    this.controller = await this.context.get<{[method: string]: Function}>(
      `controllers.${this.controllerClass.name}`,
    );

    this.registerEventMethods(producer, ProducerEvents.CONNECT);
    this.registerEventMethods(producer, ProducerEvents.DISCONNECT);
    this.registerEventMethods(producer, ProducerEvents.REQUEST);
    this.registerEventMethods(producer, ProducerEvents.REQUEST_TIMEOUT);
    this.registerEventMethods(producer, ProducerEvents.REQUEST_QUEUE_SIZE);

    return this.controller;
  }
}
