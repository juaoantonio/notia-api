import type { FastifyInstance, FastifyRegisterOptions } from 'fastify';
import { routesAuth } from '@/modules/auth/routes.auth';
import { routesLink } from '@/modules/link/routes.link';
import { routesFolder } from '@/modules/folder/routes.folder';

export const registerRoutes = (
  app: FastifyInstance,
  opts: FastifyRegisterOptions<unknown> = {},
) => {
  app.register(async (scope) => {
    scope.register(routesAuth);
    scope.register(routesFolder);
    scope.register(routesLink);
  }, opts);
};
