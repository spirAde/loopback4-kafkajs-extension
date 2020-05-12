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
