import { bind } from '@loopback/core';
import { Producer, kafka, KafkaTags } from 'loopback4-kafkajs-extension';

@kafka.controller({
  entity: 'producer',
})
@bind({ tags: KafkaTags.KAFKA_CONTROLLER_TAG })
export class ProducerController {
  constructor(@kafka.producer() private producer: Producer) {}
}
