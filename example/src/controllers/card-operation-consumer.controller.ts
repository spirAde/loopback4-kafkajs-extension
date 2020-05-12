import {bind, inject} from '@loopback/context';
import {
  Consumer,
  kafka,
  EachMessagePayload,
  KafkaTags,
  KafkaBindings,
  KafkaSerializerService,
} from 'loopback4-kafkajs-extension';

@kafka.controller({
  entity: 'consumer',
  config: {groupId: 'card'},
})
@bind({tags: KafkaTags.KAFKA_CONTROLLER_TAG})
export class CardOperationConsumerController {
  constructor(
    @kafka.consumer('card') private consumer: Consumer,
    @inject(KafkaBindings.KAFKA_SERIALIZER_SERVICE)
    private serializerService: KafkaSerializerService,
  ) {}

  @kafka.subscribe('card-ban')
  async handleCardBanMessage(payload: EachMessagePayload): Promise<void> {
    const jsonSerializer = await this.serializerService.getSerializer('json');

    console.log(
      'CardOperationConsumerController handleCardBanMessage payload',
      jsonSerializer.decodeMessagePayload(payload),
    );
  }

  @kafka.subscribe(/card-(renewal|expiration)/)
  async handleCardOperationMessage(message: EachMessagePayload): Promise<void> {
    console.log(
      'CardOperationConsumerController handleCardOperationMessage message: topic: %s, key: %s, value: %s',
      message.topic,
      message.message.key.toString(),
      message.message.value.toString(),
    );
  }
}
