import {inject} from '@loopback/context';
import {SuspiciousActivityServiceBindings} from '../keys';

export interface SuspiciousActivityServiceInterface {
  detect(value: number): boolean;
}

type SuspiciousActivityConfig = {
  limit: number;
};

export class SuspiciousActivityService
  implements SuspiciousActivityServiceInterface {
  constructor(
    @inject(SuspiciousActivityServiceBindings.SUSPICIOUS_ACTIVITY_CONFIG)
    private suspiciousActivityConfig: SuspiciousActivityConfig,
  ) {}

  detect(value: number) {
    return value > this.suspiciousActivityConfig.limit;
  }
}
