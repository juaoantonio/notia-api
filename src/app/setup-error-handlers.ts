import { ClientError, NotFoundError } from '@/errors/client.errors';
import { InternalServerError, ServerError } from '@/errors/server.errors';
import type { FastifyTypedInstance } from '@/types';

export function setupErrorHandlers(app: FastifyTypedInstance) {
  app.setErrorHandler((error: Error, _req, reply) => {
    if (error instanceof ClientError) {
      return reply.status(error.statusCode).send(error.toJSON());
    }

    if (error instanceof ServerError) {
      const publicError = new InternalServerError({ statusCode: error.statusCode, cause: error });
      // log estruturado via logger do Fastify; console.error apenas se quiser stderr separado
      app.log.error({ err: publicError }, 'ServerError handled');
      return reply.status(publicError.statusCode).send(publicError.toJSON());
    }

    const unknownError = new InternalServerError({ cause: error });
    app.log.error({ err: unknownError }, 'Unknown error handled');
    return reply.status(unknownError.statusCode).send(unknownError.toJSON());
  });

  app.setNotFoundHandler((request, reply) => {
    const notFound = new NotFoundError({
      message: `Route not found: ${request.method} ${request.url}.`,
    });
    reply.status(notFound.statusCode).send(notFound.toJSON());
  });
}
