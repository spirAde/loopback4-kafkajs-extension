import {BindingKey} from '@loopback/context';
import {SuspiciousActivityService} from './services';

export namespace SuspiciousActivityServiceBindings {
  export const SUSPICIOUS_ACTIVITY_SERVICE = BindingKey.create<
    SuspiciousActivityService
  >('services.suspiciousActivity');

  export const SUSPICIOUS_ACTIVITY_CONFIG = BindingKey.create<{limit: number}>(
    'services.suspiciousActivity.config',
  );
}
