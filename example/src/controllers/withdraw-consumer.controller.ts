import {bind, inject} from '@loopback/context';
import {
  Producer,
  kafka,
  EachBatchPayload,
  KafkaTags,
  KafkaBindings,
  KafkaSerializerService,
} from 'loopback4-kafkajs-extension';
import {SuspiciousActivityServiceBindings} from '../keys';
import {SuspiciousActivityService} from '../services';
import {WithdrawInfo} from '../types';

@kafka.controller({
  entity: 'consumer',
  config: {groupId: 'withdraw'},
  runner: {asBatch: true},
})
@bind({tags: KafkaTags.KAFKA_CONTROLLER_TAG})
export class WithdrawConsumerController {
  constructor(
    @kafka.producer()
    private producer: Producer,
    @inject(SuspiciousActivityServiceBindings.SUSPICIOUS_ACTIVITY_SERVICE)
    private suspiciousActivityService: SuspiciousActivityService,
    @inject(KafkaBindings.KAFKA_SERIALIZER_SERVICE)
    private serializerService: KafkaSerializerService,
  ) {}

  @kafka.subscribe({
    topic: 'withdraw',
    fromBeginning: false,
  })
  async handleWithdrawMessage({batch}: EachBatchPayload) {
    console.log('WithdrawConsumerController handleWithdrawMessage');

    const jsonSerializer = await this.serializerService.getSerializer('json');

    for await (const message of batch.messages) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      const data: WithdrawInfo = jsonSerializer.decode(message.value);

      if (this.suspiciousActivityService.detect(data.amount)) {
        await this.producer.send(
          jsonSerializer.encodeProducerRecord({
            topic: 'card-ban',
            messages: [
              {key: data.cardId.toString(), value: data.cardId.toString()},
            ],
          }),
        );
      }
    }
  }
}
