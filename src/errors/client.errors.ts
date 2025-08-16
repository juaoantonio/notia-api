import { StatusCodes } from 'http-status-codes';
import { BaseError } from '@/errors/base.errors';

export class ClientError extends BaseError {}

export class NotFoundError extends ClientError {
  constructor({ message, action }: { message?: string; action?: string } = {}) {
    super({
      message: message || 'Resource not found.',
      statusCode: StatusCodes.NOT_FOUND,
      name: 'NotFoundError',
      action: action || 'Check if the resource exists.',
    });
  }
}

export class UnauthorizedError extends ClientError {
  constructor({ message, action }: { message?: string; action?: string } = {}) {
    super({
      message: message || 'Unauthorized access.',
      statusCode: StatusCodes.UNAUTHORIZED,
      name: 'UnauthorizedError',
      action: action || 'Please log in or provide valid credentials.',
    });
  }
}
