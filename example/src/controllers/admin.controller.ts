import { bind, inject } from '@loopback/core';
import { kafka, KafkaTags, Admin } from 'loopback4-kafkajs-extension';

@kafka.controller({
  entity: 'admin',
})
@bind({ tags: KafkaTags.KAFKA_CONTROLLER_TAG })
export class AdminController {
  constructor(@kafka.admin() private admin: Admin) {}

  @kafka.request('admin')
  handleRequestMessage() {}
}
