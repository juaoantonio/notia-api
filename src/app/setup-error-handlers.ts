import { ClientError, NotFoundError } from '@/errors/client.errors';
import { InternalServerError, ServerError } from '@/errors/server.errors';
import type { FastifyTypedInstance } from '@/types';

export function setupErrorHandlers(app: FastifyTypedInstance) {
  app.setErrorHandler((error: Error, request, reply) => {
    const ctx = {
      reqId: request.id,
      method: request.method,
      path: request.url,
      route: request.routeOptions?.url,
      ip: request.ip,
      userId: request.user?.id ?? null,
    };

    if (error instanceof ClientError) {
      request.log.warn(
        { err: error, ...ctx, statusCode: error.statusCode, name: error.name },
        error.stack || error.message,
      );
      return reply.status(error.statusCode).send(error.toJSON());
    }

    if (error instanceof ServerError) {
      const publicError = new InternalServerError({ statusCode: error.statusCode, cause: error });
      request.log.error(
        { err: error, ...ctx, statusCode: publicError.statusCode, name: error.name },
        error.stack || 'ServerError handled',
      );
      return reply.status(publicError.statusCode).send(publicError.toJSON());
    }

    const unknownPublic = new InternalServerError({ cause: error });
    request.log.error(
      {
        err: error,
        ...ctx,
        statusCode: unknownPublic.statusCode,
        name: error.name ?? 'Error',
      },
      error.stack || 'Unknown error handled',
    );
    return reply.status(unknownPublic.statusCode).send(unknownPublic.toJSON());
  });

  app.setNotFoundHandler((request, reply) => {
    const notFound = new NotFoundError({
      message: `Route not found: ${request.method} ${request.url}.`,
    });
    request.log.info(
      {
        reqId: request.id,
        method: request.method,
        path: request.url,
        route: request.routeOptions?.url,
        ip: request.ip,
      },
      'NotFound handled',
    );
    reply.status(notFound.statusCode).send(notFound.toJSON());
  });
}
