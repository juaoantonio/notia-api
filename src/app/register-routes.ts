import type { FastifyInstance, FastifyRegisterOptions } from 'fastify';
import routesAuth from '@/modules/auth/routes.auth';
import routesLink from '@/modules/link/routes.link';

export const registerRoutes = (
  app: FastifyInstance,
  opts: FastifyRegisterOptions<unknown> = {},
) => {
  app.register(async (scope) => {
    scope.register(routesAuth);
    scope.register(routesLink);
  }, opts);
};
