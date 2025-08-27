import pino, { type Logger as PinoLogger } from 'pino';
import type { FastifyBaseLogger, FastifyServerOptions } from 'fastify';
import { env } from '@/config/env';
import fs from 'node:fs';
import path from 'node:path';

type LoggerOpts = NonNullable<FastifyServerOptions['logger']>;

export const TEST_LOG_PATH = path.resolve('.logs/test-app.log');
fs.mkdirSync(path.dirname(TEST_LOG_PATH), { recursive: true });

export function createFastifyLoggerCfg(
  disabled?: boolean,
): { logger: false } | { logger: LoggerOpts } | { loggerInstance: FastifyBaseLogger } {
  if (disabled) return { logger: false };

  if (env.NODE_ENV === 'test') {
    const instance: PinoLogger = pino(
      { level: 'trace', base: null },
      pino.destination({ dest: TEST_LOG_PATH, sync: false }),
    );
    return { loggerInstance: instance as unknown as FastifyBaseLogger };
  }

  if (env.NODE_ENV === 'development') {
    const options: LoggerOpts = {
      level: 'debug',
      base: null,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          singleLine: false,
          ignore: 'pid,hostname',
          messageFormat: '[{level}] {msg}',
          errorLikeObjectKeys: ['err', 'error', 'unknownError'],
          errorProps: 'type,message,stack,cause',
        },
      },
    };
    return { logger: options };
  }

  const options: LoggerOpts = {
    level: 'info',
    base: null,
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'res.headers.set-cookie',
        'request.headers.authorization',
        'request.headers.cookie',
        'reply.headers.set-cookie',
      ],
      remove: true,
    },
    formatters: {
      level(label) {
        return { level: label };
      },
    },
  };
  return { logger: options };
}
