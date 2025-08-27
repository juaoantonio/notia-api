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
import { createFastifyLoggerCfg } from './create-logger';
import { env } from '@/config/env';

type BuildAppOpts = {
  setupProviders: (app: FastifyTypedInstance) => void;
  log?: boolean;
};

export function buildApp(opts: BuildAppOpts) {
  const app = fastify({
    ...createFastifyLoggerCfg(opts.log === false),
    genReqId(req) {
      return (req.headers['x-request-id'] as string) ?? crypto.randomUUID();
    },
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'reqId',
    disableRequestLogging: env.NODE_ENV === 'test',
  });

  app.withTypeProvider<ZodTypeProvider>();
  app.setSerializerCompiler(serializerCompiler);
  app.setValidatorCompiler(validatorCompiler);

  setupErrorHandlers(app);
  registerHooks(app);
  opts.setupProviders(app);
  registerRoutes(app, { prefix: API_PREFIX });

  app.log.debug({ env: env.NODE_ENV }, 'Fastify app initialized');
  return app;
}
