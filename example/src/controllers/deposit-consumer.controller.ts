import {bind} from '@loopback/core';
import {
  Consumer,
  kafka,
  EachBatchPayload,
  KafkaTags,
} from 'loopback4-kafkajs-extension';

@kafka.controller({
  entity: 'consumer',
  config: {groupId: 'deposit'},
  runner: {asBatch: true},
})
@bind({tags: KafkaTags.KAFKA_CONTROLLER_TAG})
export class DepositConsumerController {
  constructor(@kafka.consumer('deposit') private consumer: Consumer) {}

  @kafka.subscribe('deposit')
  handleDepositMessage(batch: EachBatchPayload) {
    console.log(batch);
  }
}
