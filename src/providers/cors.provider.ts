import { fastifyPlugin } from 'fastify-plugin';
import { fastifyCors } from '@fastify/cors';
import { env } from '@config/env';
import type { FastifyTypedInstance } from '@/types';

export default fastifyPlugin(
  async (app: FastifyTypedInstance) => {
    await app.register(fastifyCors, {
      origin: env.CORS_ORIGIN,
      credentials: true,
      // Ex.: mover validação para outro hook (opcional)
      // hook: 'preHandler',
    });
  },
  { name: 'cors' },
);
