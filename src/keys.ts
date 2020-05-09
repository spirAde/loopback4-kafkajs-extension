import {BindingKey} from '@loopback/context';
import {
  KafkaConfig,
  ProducerConfig,
  AdminConfig,
  Kafka,
  Producer,
  Consumer,
  Admin,
} from './types';
import {withPrefix} from './utils';

export namespace KafkaBindings {
  export const KAFKA_CLIENT_CONFIG = BindingKey.create<KafkaConfig>(
    withPrefix('client-config'),
  );
  export const KAFKA_PRODUCER_CONFIG = BindingKey.create<ProducerConfig>(
    withPrefix('producer-config'),
  );
  export const KAFKA_ADMIN_CONFIG = BindingKey.create<AdminConfig>(
    withPrefix('admin-config'),
  );

  export const KAFKA_SERVICE = BindingKey.create<{
    client: Kafka;
    producer: Producer;
    consumer: Consumer;
    admin: Admin;
  }>(withPrefix('service'));
}

export namespace KafkaTags {
  export const KAFKA_CONTROLLER_TAG = withPrefix('controller');
}
