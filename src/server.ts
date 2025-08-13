import { buildApp } from './app';
import { env } from './config/env';

const server = buildApp();

try {
  await server.listen({ port: env.PORT, host: env.HOST });
} catch (err) {
  server.log.error(err);
  process.exit(1);
}
