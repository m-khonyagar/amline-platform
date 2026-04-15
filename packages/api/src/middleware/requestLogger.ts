import { logger } from '../utils/logger';

export function logRequest(route: string, method: string) {
  logger.info('Incoming request', { route, method });
}
