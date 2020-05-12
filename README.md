# loopback4-kafkajs-extension

## The documentation is still updated.

This module contains a component adding a KafkaJS to LoopBack
applications. Thanks to the excellent loopback architecture, you can
use Kafka anywhere in your application.
This extension provides you with a consumer, producer, admin,
serializers. The basic concepts are described below:

## Stability: ⚠️Experimental⚠️

> Experimental package provides early access to advanced or experimental
> functionality to get community feedback. Such modules are published to npm
> using `0.x.y` versions. Their APIs and functionality may be subject to
> breaking changes in future releases.

## Installation

```sh
npm install --save loopback4-kafkajs-extension
or
yarn add loopback4-kafkajs-extension
```

## Basic use

The component should be loaded in the constructor of your custom Application
class.

Start by importing the component class:

```ts
import {KafkaComponent} from 'loopback4-kafkajs-extension';
```

In the constructor, add the component to your application:

```ts
this.component(KafkaComponent);
```

Initialize kafka config:
```ts
this.bind(KafkaBindings.KAFKA_CLIENT_CONFIG).to({
  clientId: 'my-app-1',
  brokers: ['localhost:9092', 'localhost:9092'],
  logLevel: logLevel.ERROR,
});
```

Full Kafka client config options(https://kafka.js.org/docs/configuration):
```ts
brokers: string[]
ssl?: tls.ConnectionOptions | boolean
sasl?: SASLOptions
clientId?: string
connectionTimeout?: number
authenticationTimeout?: number
reauthenticationThreshold?: number
requestTimeout?: number
enforceRequestTimeout?: boolean
retry?: RetryOptions
socketFactory?: ISocketFactory
logLevel?: logLevel
logCreator?: logCreator
```

## Entities
- Client
- Admin
- Producer
- Consumers(supports multiple consumers)
- Serializers(Buffer, JSON)

## Decorators
Full list of decorators
```text
@kafka.consumer(name: string) - provides bound consumer by name

@kafka.producer() - provides bound producer

@kafka.admin() - provides bound admin client

// common (producer & consumer & admin)
@kafka.controller(config: KafkaControllerMetadata) - mark controller as possibility to listen events. Tag @bind({tags: KafkaTags.KAFKA_CONTROLLER_TAG}) also must be provided

// All decorators below(except subscribe) are described here(https://kafka.js.org/docs/instrumentation-events#a-name-list-list-of-available-events)

@kafka.connect(entity: EntityName)

@kafka.disconnect(entity: EntityName)

@kafka.request(entity: EntityName)

@kafka.requestTimeout(entity: EntityName)

@kafka.requestQueueSize(entity: EntityName)

// consumer only
@kafka.heartbeat()

@kafka.commitOffsets()

@kafka.groupJoin()

@kafka.fetch()

@kafka.startBatchProcess()

@kafka.endBatchProcess()

@kafka.crash()

@kafka.stop()

@kafka.subscribe(...topics: Topic[]) - give the possibility to subscribe and listen topic and consume messages(string | RegExp | { topic: string | Regexp, fromBeginning: boolean })
```

## Admin
The admin client hosts all the cluster operations, such as createTopics, createPartitions, etc.

For initialization Kafka admin the config should be provided as

```ts
this.bind(KafkaBindings.KAFKA_ADMIN_CONFIG).to({/*your config here*/});
```

### Admin use
In service

```ts
import {kafka, Admin} from 'loopback4-kafkajs-extension';

export interface TopicResolverServiceInterface {
  createTopics(): Promise<boolean>;
}

export class TopicResolverService implements TopicResolverServiceInterface {
  constructor(
    @kafka.admin() private admin: Admin,
  ) {}

  async createTopics() {
    return this.admin.createTopics({
      waitForLeaders: true,
      topics: ['withdraw', 'deposit', 'card-ban'].map(topic => ({ topic })),
    })
  }
}
```

Full possible admin options: 

## Producer
To publish messages to Kafka you have to create a producer.

For initialization Kafka producer the config should be provided as

```ts
this.bind(KafkaBindings.KAFKA_PRODUCER_CONFIG).to({/*your config here*/});
```

## Consumers
Consumer groups allow a group of machines or processes to coordinate
access to a list of topics, distributing the load among the
consumers. When a consumer fails the load is automatically
distributed to other members of the group. Consumer groups must
have unique group ids within the cluster, from a Kafka broker perspective.

For initialization Kafka consumers you should create Controller and add the tag as in the example

```ts
import {bind} from '@loopback/context';
import {kafka,KafkaTags} from 'loopback4-kafkajs-extension';

@kafka.controller({
  entity: 'consumer',
  config: {groupId: 'withdraw'},
  runner: {asBatch: true},
})
@bind({tags: KafkaTags.KAFKA_CONTROLLER_TAG})
export class WithdrawConsumerController {
  ...
}
```

The extension will gather all consumers controllers by tag and initialize consumers by @kafka.controller config
<b>Important notice</b>: Each controller must have only one groupId and one runner.

List of consumer options(https://kafka.js.org/docs/consuming#a-name-options-a-options)

The runner can be used in eachMessage and eachBatch modes:
- eachMessage - consumes one message at a time
```ts
@kafka.subscribe('card-ban')
async handleCardBanMessage(payload: EachMessagePayload): Promise<void> {
  const jsonSerializer = await this.serializerService.getSerializer('json');

  console.log(
    'CardOperationConsumerController handleCardBanMessage payload',
    jsonSerializer.decodeMessagePayload(payload),
  );
}
```
- eachBatch - consumes batch messages
```ts
@kafka.subscribe('deposit')
handleDepositMessage({ batch, resolveOffset, heartbeat, isRunning, isStale }: EachBatchPayload) {
  console.log(batch);
}
```

## Serializers
By default two serializers are available:
- JSON
- Buffer

### Serializers use
```ts
@inject(KafkaBindings.KAFKA_SERIALIZER_SERVICE)
private serializerService: KafkaSerializerService,

...

const jsonSerializer = await this.serializerService.getSerializer('json');
```

## Tests(In progress)

Run `npm test` from the root folder.

## Thankfulness

Thanks KafkaJS team(https://github.com/tulios/kafkajs/graphs/contributors) for providing best package for communication with Kafka.
