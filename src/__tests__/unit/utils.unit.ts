import {expect} from '@loopback/testlab';
import {withPrefix, normalizeTopic} from '../../utils';
import {Topic, NormalizedTopic} from '../../types';

describe('Utils', () => {
  describe('withPrefix', () => {
    testExpect(
      'should return string with kafkaPrefix and name',
      'kafka.service',
      'service',
    );

    testExpect(
      'should return string with kafkaPrefix and prefix and name',
      'kafka.controller.consumer',
      'consumer',
      'controller',
    );

    testExpect(
      'should return string with new kafkaPrefix and prefix and name',
      'kafkaJS.controller.consumer',
      'consumer',
      'controller',
      'kafkaJS',
    );

    testExpect(
      'should return string with kafkaPrefix and prefix and name and changed separator',
      'kafkaJS:controller:consumer',
      'consumer',
      'controller',
      'kafkaJS',
      ':',
    );

    function testExpect(
      testName: string,
      expected: string,
      name: string,
      prefix?: string,
      kafkaPrefix?: string,
      separator?: string,
    ) {
      it(testName, () => {
        expect(withPrefix(name, prefix, kafkaPrefix, separator)).to.equal(
          expected,
        );
      });
    }
  });

  describe('normalizeTopic', () => {
    testExpect('should convert string to topic', normalizeTopic('topic-a'), {
      topic: 'topic-a',
    });

    testExpect(
      'should convert regexp to topic',
      normalizeTopic(/topic-(eu|us)-.*/i),
      {
        topic: /topic-(eu|us)-.*/i,
      },
    );

    testExpect(
      "shouldn't convert normalized topic",
      normalizeTopic({topic: 'topic-a', fromBeginning: true}),
      {topic: 'topic-a', fromBeginning: true},
    );

    function testExpect(
      testName: string,
      actual: Topic,
      expected: NormalizedTopic,
    ) {
      it(testName, () => {
        expect(actual).to.deepEqual(expected);
      });
    }
  });
});
