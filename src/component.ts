import {
  Application,
  BindingScope,
  Component,
  CoreBindings,
  createBindingFromClass,
} from '@loopback/core';
import {inject} from '@loopback/context';
import {KafkaProvider} from './providers';
import {KafkaObserver} from './observers';
import {KafkaBindings} from './keys';

export class KafkaComponent implements Component {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) application: Application,
  ) {
    // providersMap property isn't using by the reason
    // of preventing recreation producers and consumers
    application.add(
      createBindingFromClass(KafkaProvider, {
        key: KafkaBindings.KAFKA_SERVICE.toString(),
      }).inScope(BindingScope.SINGLETON),
    );

    application.lifeCycleObserver(KafkaObserver);
  }
}
