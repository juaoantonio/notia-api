import { buildApp } from './app';
import { env } from '@config/env';

const server = await buildApp();
await server.listen({ port: env.PORT, host: env.HOST });
