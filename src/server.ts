import { env } from '@/config/env';
import { buildApp } from '@/app/build-app';
import { registerCorePlugins } from '@/app/register-core-plugins';

const server = buildApp({
  setupProviders: (app) => registerCorePlugins(app),
});

server.log.info(`Server is running at http://${env.HOST}:${env.PORT} in ${env.NODE_ENV} mode`);
await server.listen({ port: env.PORT, host: env.HOST });
