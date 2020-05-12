import {bind} from '@loopback/context';
import {KafkaBindings} from '../keys';
import {Serializer} from '../types';

@bind(KafkaBindings.asSerializer)
export class BufferSerializer implements Serializer {
  type = 'buffer';

  encode(data: Buffer | string): Buffer  {
    if (Buffer.isBuffer(data)) {
      return data;
    }

    return Buffer.from(data);
  }

  decode(data: Buffer): unknown {
    return data.toString();
  }
}
