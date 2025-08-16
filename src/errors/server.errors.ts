import { BaseError } from '@/errors/base.errors';

export class ServerError extends BaseError {}

export class InternalServerError extends ServerError {
  constructor({
    action,
    cause,
    statusCode = 500,
  }: {
    action?: string;
    cause?: Error;
    statusCode?: number;
  } = {}) {
    super({
      message: 'Internal server error.',
      statusCode: statusCode,
      name: 'InternalServerError',
      action: action || 'Try again later or contact support if the problem persists.',
      cause: cause,
    });
  }
}
