import { fastify } from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { ClientError, NotFoundError } from '@/errors/client.errors';
import { InternalServerError, ServerError } from '@/errors/server.errors';
import cookieProvider from '@/providers/cookie.provider';
import corsProvider from '@/providers/cors.provider';
import jwtProvider from '@/providers/jwt.provider';
import oauth2GoogleProvider from '@/providers/oauth2-google.provider';
import prismaProvider from '@/providers/prisma.provider';
import routesAuth from '@/modules/auth/routes.auth';
import routesLink from '@/modules/link/routes.link';

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

  app.setErrorHandler((error: Error, _req, reply) => {
    if (error instanceof ClientError) return reply.status(error.statusCode).send(error.toJSON());
    if (error instanceof ServerError) {
      const publicError = new InternalServerError({ statusCode: error.statusCode, cause: error });
      console.error(publicError);
      return reply.status(publicError.statusCode).send(publicError.toJSON());
    }
    const unknownError = new InternalServerError({ cause: error });
    console.error(unknownError);
    return reply.status(unknownError.statusCode).send(unknownError.toJSON());
  });

  app.setNotFoundHandler((request, reply) => {
    const notFoundError = new NotFoundError({
      message: `Route not found: ${request.method} ${request.url}.`,
    });
    reply.status(notFoundError.statusCode).send(notFoundError.toJSON());
  });

  app.register(prismaProvider);
  app.register(corsProvider);
  app.register(cookieProvider);
  app.register(jwtProvider);
  app.register(oauth2GoogleProvider);

  app.register(
    (app) => {
      app.register(routesAuth);
      app.register(routesLink);
    },
    {
      prefix: '/v1',
    },
  );

  app.addHook('onRoute', ({ method, url }) => {
    if (['HEAD', 'OPTIONS'].includes(String(method))) return;
    app.log.info(`Registered route: ${String(method)} ${url}`);
  });

  return app;
}
