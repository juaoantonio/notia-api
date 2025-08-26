import { fastify } from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { setupErrorHandlers } from './setup-error-handlers';

import { registerHooks } from './register-hooks';
import { registerRoutes } from '@/app/register-routes';
import { API_PREFIX } from '@/constants';
import type { FastifyTypedInstance } from '@/types';

type BuildAppOpts = {
  setupProviders: (app: FastifyTypedInstance) => void;
  log?: boolean;
};

export function buildApp(opts: BuildAppOpts) {
  const app = fastify({
    logger: opts.log
      ? {
          transport: {
            target: '@fastify/one-line-logger',
          },
        }
      : false,
  });

  app.withTypeProvider<ZodTypeProvider>();
  app.setSerializerCompiler(serializerCompiler);
  app.setValidatorCompiler(validatorCompiler);

  setupErrorHandlers(app);
  registerHooks(app);
  opts.setupProviders(app);
  registerRoutes(app, { prefix: API_PREFIX });

  return app;
}
