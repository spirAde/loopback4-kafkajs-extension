import path from 'path';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig, Application} from '@loopback/core';
import {MySequence} from './sequence';

export class TestApplication extends BootMixin(Application) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    this.projectRoot = __dirname;

    this.sequence(MySequence);

    this.static('/', path.join(__dirname, '../public'));

    this.bootOptions = {
      controllers: {
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
}
