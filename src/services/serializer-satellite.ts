import {
  EachBatchPayload,
  EachMessagePayload,
  KafkaMessage,
  ProducerBatch,
  ProducerRecord,
  Serializer,
} from '../types';

export class SerializerSatellite {
  serializer: Serializer;

  constructor(serializer: Serializer) {
    this.serializer = serializer;
  }

  encode(data: unknown): Buffer {
    return this.serializer.encode(data);
  }

  decode(data: Buffer) {
    return this.serializer.decode(data);
  }

  decodeMessage(message: KafkaMessage) {
    return {
      ...message,
      key: message.key && this.decode(message.key),
      value: this.decode(message.value),
    };
  }

  encodeProducerRecord(record: ProducerRecord) {
    return {
      ...record,
      messages: record.messages.map(message => ({
        ...message,
        key: message.key ? this.encode(message.key) : null,
        value: this.encode(message.value),
      })),
    };
  }

  decodeMessagePayload(payload: EachMessagePayload) {
    return {
      ...payload,
      message: this.decodeMessage(payload.message),
    };
  }

  encodeProducerBatch(batch: ProducerBatch) {
    return {
      ...batch,
      topicMessages: batch?.topicMessages?.map(this.encodeProducerRecord) ?? [],
    };
  }

  decodeBatchPayload(payload: EachBatchPayload) {
    return {
      ...payload,
      batch: {
        ...payload.batch,
        messages: payload.batch.messages.map(this.decodeMessage),
      },
    };
  }
}
