import { fastifyAutoload } from '@fastify/autoload';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import { fastify, type FastifyBaseLogger, type FastifyHttpOptions } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import type { Server } from 'node:http';
import path from 'node:path';

type AppOptions = FastifyHttpOptions<Server<never, never>, FastifyBaseLogger>;

export function buildApp(opts?: AppOptions) {
  const app = fastify({
    logger: {
      level: 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
    ...opts,
  });
  app.withTypeProvider<ZodTypeProvider>();

  app.register(fastifyCors, {
    origin: ['http://localhost:8000'],
    credentials: true,
  });
  app.register(fastifyCookie);
  app.register(fastifyAutoload, {
    dir: path.join(import.meta.dirname, 'modules'),
    options: {
      prefix: '/v1',
    },
    indexPattern: /^.*routes(?:\.ts|\.js|\.cjs|\.mjs)$/,
  });
  app.register(fastifyAutoload, {
    dir: path.join(import.meta.dirname, 'providers'),
  });

  app.addHook('onRoute', ({ method, path }) => {
    if (['OPTIONS', 'HEAD'].includes(String(method))) return;
    app.log.info(`${String(method)} - ${path}`);
  });

  return app;
}
