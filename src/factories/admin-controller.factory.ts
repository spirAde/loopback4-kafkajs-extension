import {Admin, AdminEvents} from '../types';
import {BaseFactory} from './base.factory';

export class AdminControllerFactory extends BaseFactory {
  async create(admin: Admin) {
    this.controller = await this.context.get<{[method: string]: Function}>(
      `controllers.${this.controllerClass.name}`,
    );

    this.registerEventMethods(admin, AdminEvents.CONNECT);
    this.registerEventMethods(admin, AdminEvents.DISCONNECT);
    this.registerEventMethods(admin, AdminEvents.REQUEST);
    this.registerEventMethods(admin, AdminEvents.REQUEST_TIMEOUT);
    this.registerEventMethods(admin, AdminEvents.REQUEST_QUEUE_SIZE);

    return this.controller;
  }
}
