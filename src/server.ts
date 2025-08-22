import { buildApp } from './app';
import { env } from '@config/env';

const server = await buildApp();
server.log.info(`Server is running at http://${env.HOST}:${env.PORT} in ${env.NODE_ENV} mode`);
await server.listen({ port: env.PORT, host: env.HOST });
