import { fastify } from 'fastify';
import autoload from '@fastify/autoload';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';

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
