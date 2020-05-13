import {expect} from '@loopback/testlab';
import {SerializerSatellite} from '../../../services/serializer-satellite';
import {JsonStrictSerializer} from '../../fixtures/serializers/json-strict.serializer';
import {KafkaMessage} from 'kafkajs';

describe('SerializerSatellite', () => {
  const serializer = new JsonStrictSerializer();
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  const jsonStrictSerializer = new SerializerSatellite(serializer);

  describe('encode', () => {
    testEncodeFn('should encode string type', '"foo"', 'foo');
    testEncodeFn('should encode number type', '1', 1);

    function testEncodeFn(testName: string, expected: unknown, data: unknown) {
      it(testName, () => {
        expect(jsonStrictSerializer.encode(data)).to.equal(expected);
      });
    }
  });

  describe('decode', () => {
    testDecodeFn('should decode json to string type', 'foo', '"foo"');
    testDecodeFn('should decode json to number type', 1, '1');

    function testDecodeFn(testName: string, expected: unknown, data: unknown) {
      it(testName, () => {
        expect(jsonStrictSerializer.decode(data)).to.equal(expected);
      });
    }
  });

  describe('decodeMessage', () => {
    const createMessage = (key: unknown, value: unknown) => ({
      timestamp: '1589378175',
      size: 2,
      attributes: 2,
      offset: '13',
      key,
      value,
    });

    testDecodeMessageFn(
      'should decode key and value kafka message object',
      createMessage(1, 1),
      createMessage('1', '1'),
    );

    testDecodeMessageFn(
      'should decode only value kafka message object',
      createMessage(null, 1),
      createMessage(null, '1'),
    );

    function testDecodeMessageFn(
      testName: string,
      expected: Record<string, unknown>,
      data: Record<string, unknown>,
    ) {
      it(testName, () => {
        expect(jsonStrictSerializer.decodeMessage(data)).to.deepEqual(expected);
      });
    }
  });

  describe('encodeProducerRecord', () => {
    const createRecord = (messages: Record<string, unknown>[]) => ({
      topic: 'topicA',
      messages,
    });

    testEncodeProducerRecordFn(
      'should encode producer record',
      createRecord([
        {key: null, value: '1'},
        {key: '2', value: '"foo"'},
      ]),
      createRecord([{value: 1}, {key: 2, value: 'foo'}]),
    );

    function testEncodeProducerRecordFn(
      testName: string,
      expected: Record<string, unknown>,
      data: Record<string, unknown>,
    ) {
      it(testName, () => {
        expect(jsonStrictSerializer.encodeProducerRecord(data)).to.deepEqual(
          expected,
        );
      });
    }
  });

  describe('decodeMessagePayload', () => {
    const createMessagePayload = (message: Record<string, unknown>) => ({
      topic: 'topicA',
      partition: 1,
      message,
    });

    testDecodeMessagePayloadFn(
      'should return payload with decoded message',
      createMessagePayload({
        key: 1,
        value: 1,
      }),
      createMessagePayload({
        key: '1',
        value: '1',
      }),
    );

    function testDecodeMessagePayloadFn(
      testName: string,
      expected: Record<string, unknown>,
      data: Record<string, unknown>,
    ) {
      it(testName, () => {
        expect(jsonStrictSerializer.decodeMessagePayload(data)).to.deepEqual(
          expected,
        );
      });
    }
  });

  describe('encodeProducerBatch', () => {
    const createEmptyBatch = () => ({});

    const createBatch = (messages: Record<string, unknown>[]) => ({
      topicMessages: [
        {
          topic: 'topicA',
          messages,
        },
      ],
    });

    testEncodeProducerBatchFn(
      'should return batch with encoded topic messages',
      createBatch([
        {key: null, value: '1'},
        {key: '2', value: '"foo"'},
      ]),
      createBatch([{value: 1}, {key: 2, value: 'foo'}]),
    );

    testEncodeProducerBatchFn(
      'should return batch without encoded topic messages for empty batch',
      createBatch([]),
      createBatch([]),
    );

    testEncodeProducerBatchFn(
      'should return empty topicMessages for empty batch',
      {topicMessages: []},
      createEmptyBatch(),
    );

    function testEncodeProducerBatchFn(
      testName: string,
      expected: Record<string, unknown>,
      data: Record<string, unknown>,
    ) {
      it(testName, () => {
        expect(jsonStrictSerializer.encodeProducerBatch(data)).to.deepEqual(
          expected,
        );
      });
    }
  });

  describe('decodeBatchPayload', () => {
    const createBatchPayload = (messages: Record<string, unknown>[]) => ({
      batch: {
        topic: 'topicA',
        partition: 2,
        messages: messages,
      },
    });

    testDecodeBatchPayloadFn(
      'should return decoded batch',
      createBatchPayload([{key: 1, value: 1}, {key: null, value: 2}]),
      createBatchPayload([{key: '1', value: '1'}, {value: '2'}]),
    );

    function testDecodeBatchPayloadFn(
      testName: string,
      expected: Record<string, unknown>,
      data: Record<string, unknown>,
    ) {
      it(testName, () => {
        expect(jsonStrictSerializer.decodeBatchPayload(data)).to.deepEqual(
          expected,
        );
      });
    }
  });
});
