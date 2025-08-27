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

type ValidationErrorDetails = {
  path: Array<string>;
  message: string;
};

export class BadRequestError extends ClientError {
  public validationErrors: ValidationErrorDetails[];
  constructor({
    message,
    action,
    validationErrors,
  }: { message?: string; action?: string; validationErrors?: ValidationErrorDetails[] } = {}) {
    super({
      message: message || 'Invalid request.',
      statusCode: StatusCodes.BAD_REQUEST,
      name: 'BadRequestError',
      action: action || 'Check the request and try again.',
    });
    this.validationErrors = validationErrors ?? [];
  }

  toJSON() {
    return { ...super.toJSON(), validationErrors: this.validationErrors };
  }
}

export class ForbiddenError extends ClientError {
  constructor({ message, action }: { message?: string; action?: string } = {}) {
    super({
      message: message || 'Forbidden access.',
      statusCode: StatusCodes.FORBIDDEN,
      name: 'ForbiddenError',
      action: action || 'Check your permissions and try again.',
    });
  }
}
