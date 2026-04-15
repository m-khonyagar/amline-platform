import { logger } from '../utils/logger';

export function toErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  logger.error('Request failed', { message });
  return { error: message };
}
