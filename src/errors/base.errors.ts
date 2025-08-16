export class BaseError extends Error {
  public statusCode: number;
  public action: string;

  constructor({
    message,
    statusCode,
    name,
    action,
    cause,
  }: {
    message: string;
    statusCode: number;
    name: string;
    action: string;
    cause?: Error | undefined;
  }) {
    super(message, {
      cause,
    });
    this.name = name;
    this.statusCode = statusCode;
    this.action = action;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      action: this.action,
    };
  }
}
