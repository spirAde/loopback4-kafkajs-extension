import {Context, invokeMethod, MetadataInspector} from '@loopback/context';
import {ControllerClass} from '@loopback/core';
import {EnhancedEntity, EventName, EventPayload} from '../types';
import {withPrefix} from '../utils';

export class BaseFactory {
  protected controller: {[method: string]: Function};

  constructor(
    protected context: Context,
    protected controllerClass: ControllerClass,
  ) {}

  protected registerEventMethods(entity: EnhancedEntity, event: EventName) {
    const subscribeMethods =
      MetadataInspector.getAllMethodMetadata(
        withPrefix(event.toString()),
        this.controllerClass.prototype,
      ) ?? {};

    for (const method of Object.getOwnPropertyNames(subscribeMethods)) {
      entity.addListener(event, (data: EventPayload) =>
        invokeMethod(this.controller, method, this.context, [data]),
      );
    }
  }
}
