import { fastify } from 'fastify';
import autoload from '@fastify/autoload';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { ClientError, NotFoundError } from '@/errors/client.errors';
import { InternalServerError, ServerError } from '@/errors/server.errors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function buildApp() {
  const app = fastify({
    logger: {
      transport: {
        target: '@fastify/one-line-logger',
      },
    },
  });
  app.withTypeProvider<ZodTypeProvider>();
  app.setSerializerCompiler(serializerCompiler);
  app.setValidatorCompiler(validatorCompiler);
  app.setErrorHandler((error: Error, _request, reply) => {
    if (error instanceof ClientError) {
      return reply.status(error.statusCode).send(error.toJSON());
    }

    if (error instanceof ServerError) {
      const publicError = new InternalServerError({
        statusCode: error.statusCode,
        cause: error,
      });

      console.error(publicError);
      reply.status(publicError.statusCode).send(publicError.toJSON());
    }

    const unknownError = new InternalServerError({
      cause: error,
    });
    console.error(unknownError);
    reply.status(unknownError.statusCode).send(unknownError.toJSON());
  });
  app.setNotFoundHandler((request, reply) => {
    const notFoundError = new NotFoundError({
      message: `Route not found: ${request.method} ${request.url}.`,
    });
    reply.status(notFoundError.statusCode).send(notFoundError.toJSON());
  });

  app.register(autoload, {
    dir: join(__dirname, 'providers'),
    encapsulate: false,
  });

  app.register(autoload, {
    dir: join(__dirname, 'modules'),
    options: { prefix: '/v1' },
    dirNameRoutePrefix: false,
  });

  app.addHook('onRoute', ({ method, url }) => {
    if (['HEAD', 'OPTIONS'].includes(String(method))) return;
    app.log.info(`Registered route: ${String(method)} ${url}`);
  });

  return app;
}
