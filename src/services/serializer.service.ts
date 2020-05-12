import {Getter} from '@loopback/context';
import {extensionPoint, extensions} from '@loopback/core';
import {KafkaBindings} from '../keys';
import {Serializer} from '../types';
import {SerializerSatellite} from './serializer-satellite';

@extensionPoint(KafkaBindings.KAFKA_SERIALIZER_EXTENSION_POINT_NAME)
export class KafkaSerializerService {
  serializer: Serializer;

  constructor(
    @extensions()
    private getSerializers: Getter<Serializer[]>,
  ) {}

  async findSerializer(type: string): Promise<Serializer | never> {
    const serializers = await this.getSerializers();
    const serializer = serializers.find(instance => instance.type === type);

    if (serializer) {
      return serializer;
    }

    throw KafkaSerializerService.serializerNotFoundError(type);
  }

  async getSerializer(type: string): Promise<SerializerSatellite> {
    const serializer = await this.findSerializer(type);
    return new SerializerSatellite(serializer);
  }

  private static serializerNotFoundError(type: string) {
    return new Error(
      `Serializer ${type} isn't found, make sure the serializer has been connected`,
    );
  }
}
