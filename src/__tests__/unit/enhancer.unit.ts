import {expect, sinon} from '@loopback/testlab';
import {
  CompressionTypes,
  EnhancedAdmin,
  EnhancedConsumer,
  EnhancedProducer,
  Kafka,
  ProducerBatch,
  ProducerConfig,
  ProducerRecord,
} from '../../types';
import {
  createAdmin,
  createConsumer,
  createProducer,
  enhancer,
  senderEnhancer,
} from '../../enhancer';

describe('Enhancer', () => {
  const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092', 'localhost:9092'],
  });

  describe('createConsumer', () => {
    const consumer = createConsumer(kafka, {
      groupId: 'custom',
    });

    it('should initialize consumer', async () => {
      const group = await consumer.describeGroup();

      expect(group.groupId).to.equal('custom');
    });

    testEnhancedEntityProperties(
      'should return enhanced kafka consumer',
      consumer,
    );
  });

  describe('createProducer', () => {
    const producer = createProducer(kafka, {});

    testEnhancedEntityProperties(
      'should return enhanced kafka producer',
      producer,
    );
  });

  describe('createAdmin', () => {
    const admin = createAdmin(kafka, {});

    testEnhancedEntityProperties('should return enhanced kafka admin', admin);
  });

  describe('enhancer', () => {
    const producer = createProducer(kafka, {});

    describe('addListener', () => {
      it('should add listener', () => {
        producer.addListener(producer.events.CONNECT, () => {});

        expect(producer.listeners.has(producer.events.CONNECT)).to.be.true();
      });

      it('should invoke listener', async () => {
        const connectSpy = sinon.spy();

        producer.addListener(producer.events.CONNECT, connectSpy);

        await producer.connect();

        expect(connectSpy.called).to.true();
      });
    });

    describe('removeListener', () => {
      it('should remove listener if function called directly', () => {
        const listener = producer.addListener(
          producer.events.REQUEST,
          () => {},
        );

        listener();

        expect(producer.listeners.has(producer.events.REQUEST)).to.be.false();
      });

      it('should remove listener by event name', () => {
        producer.addListener(producer.events.REQUEST, () => {});
        producer.removeListener(producer.events.REQUEST);

        expect(producer.listeners.has(producer.events.REQUEST)).to.false();
      });

      it('should return warning if listener is not found in listeners', () => {
        const stubbed = sinon.stub(console, 'warn');
        producer.removeListener(producer.events.REQUEST_QUEUE_SIZE);

        expect(stubbed.called).to.be.true();
      });
    });

    describe('connect', () => {
      it('should set isConnected as true', async () => {
        await producer.connect();
        expect(producer.isConnected).to.be.true();
      });
    });

    describe('disconnect', () => {
      it('should set isConnected as true', async () => {
        await producer.disconnect();
        expect(producer.isConnected).to.be.false();
      });
    });
  });

  describe('senderEnhancer', () => {
    const config: ProducerConfig = {
      compression: CompressionTypes.GZIP,
    };

    const record: ProducerRecord = {
      topic: 'topic-a',
      messages: [
        {key: 'key1', value: 'hello world'},
        {key: 'key2', value: 'hey hey!'},
      ],
    };

    const batch: ProducerBatch = {
      topicMessages: [
        {
          topic: 'topic-a',
          messages: [{key: 'key', value: 'hello topic-a'}],
        },
        {
          topic: 'topic-b',
          messages: [{key: 'key', value: 'hello topic-b'}],
        },
      ],
    };

    testSendMethod('should send data with global compression', record, {
      ...record,
      compression: CompressionTypes.GZIP,
    });

    testSendMethod(
      'should send data with local compression',
      {...record, compression: CompressionTypes.LZ4},
      {
        ...record,
        compression: CompressionTypes.LZ4,
      },
    );

    testSendBatchMethod(
      'should sendBatch data with global compression',
      batch,
      {
        ...batch,
        compression: CompressionTypes.GZIP,
      },
    );

    testSendBatchMethod(
      'shouldBatch send data with local compression',
      {...batch, compression: CompressionTypes.LZ4},
      {
        ...batch,
        compression: CompressionTypes.LZ4,
      },
    );

    function testSendMethod(
      testName: string,
      // eslint-disable-next-line no-shadow
      record: ProducerRecord,
      expected: ProducerRecord,
    ) {
      it(testName, async () => {
        const producer = enhancer(kafka.producer(config));
        const stub = sinon.stub(producer, 'send');
        const enhancedProducer = senderEnhancer(producer, config);

        await enhancedProducer.send(record);

        expect(stub.calledWith(expected)).to.be.true();
      });
    }

    function testSendBatchMethod(
      testName: string,
      // eslint-disable-next-line no-shadow
      batch: ProducerBatch,
      expected: ProducerBatch,
    ) {
      it(testName, async () => {
        const producer = enhancer(kafka.producer(config));
        const stub = sinon.stub(producer, 'sendBatch');
        const enhancedProducer = senderEnhancer(producer, config);

        await enhancedProducer.sendBatch(batch);

        expect(stub.calledWith(expected)).to.be.true();
      });
    }
  });

  function testEnhancedEntityProperties(
    testName: string,
    entity: EnhancedConsumer | EnhancedProducer | EnhancedAdmin,
  ) {
    const properties = [
      'isConnected',
      'listeners',
      'addListener',
      'removeListener',
    ];

    it(testName, () => {
      const methods = Object.keys(entity);
      expect(
        properties.every(property => methods.includes(property)),
      ).to.true();
    });
  }
});
