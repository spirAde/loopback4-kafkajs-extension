import {bind} from '@loopback/context';
import {KafkaBindings} from '../keys';
import {Serializer} from '../types';

@bind(KafkaBindings.asSerializer)
export class JsonSerializer implements Serializer {
  type = 'json';

  encode(data: unknown): Buffer {
    return Buffer.from(JSON.stringify(data));
  }

  decode(data: Buffer): unknown {
    return JSON.parse(data.toString());
  }
}
