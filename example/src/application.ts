import path from 'path';
import {BootMixin, ControllerDefaults} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import {
  KafkaBindings,
  KafkaComponent,
  logLevel,
} from 'loopback4-kafkajs-extension';
import {Sequence} from './sequence';
import {SuspiciousActivityService} from './services';
import {SuspiciousActivityServiceBindings} from './keys';

const pkg = require('../package.json');

export class ExampleApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    this.projectRoot = __dirname;

    this.api({
      openapi: '3.0.0',
      info: {title: pkg.name, version: pkg.version},
      paths: {},
      servers: [{url: '/'}],
    });

    this.bindKafka();
    this.bindServices();

    this.component(KafkaComponent);

    this.sequence(Sequence);

    this.static('/', path.join(this.projectRoot, '../public'));

    this.bootOptions = {
      controllers: ControllerDefaults,
    };
  }

  bindServices(): void {
    this.bind(
      SuspiciousActivityServiceBindings.SUSPICIOUS_ACTIVITY_SERVICE,
    ).toClass(SuspiciousActivityService);

    this.configure(SuspiciousActivityServiceBindings.SUSPICIOUS_ACTIVITY_CONFIG).to({
      limit: 10000,
    });
  }

  bindKafka() {
    this.configure(KafkaBindings.KAFKA_CLIENT_CONFIG).to({
      clientId: 'my-app-1',
      brokers: ['localhost:9092', 'localhost:9092'],
      logLevel: logLevel.ERROR,
    });

    this.configure(KafkaBindings.KAFKA_ADMIN_CONFIG).to({});
    this.configure(KafkaBindings.KAFKA_PRODUCER_CONFIG).to({});
  }
}
