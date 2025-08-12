import { fastify, type FastifyBaseLogger, type FastifyHttpOptions } from 'fastify';
import type { Server } from 'node:http';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { fastifyAutoload } from '@fastify/autoload';
import path from 'node:path';
import { fastifyCors } from '@fastify/cors';

type AppOptions = FastifyHttpOptions<Server<never, never>, FastifyBaseLogger>;

export function buildApp(opts?: AppOptions) {
  const app = fastify(opts);
  app.withTypeProvider<ZodTypeProvider>();

  // Register plugins
  app.register(fastifyCors, {
    origin: '*',
  });
  app.register(fastifyAutoload, {
    dir: path.join(import.meta.dirname, 'routes'),
    routeParams: true,
    options: {
      prefix: '/v1',
    },
  });

  return app;
}
