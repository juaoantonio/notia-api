import { fastifyPlugin } from 'fastify-plugin';
import { fastifyCookie } from '@fastify/cookie';
import { env } from '@config/env';
import type { FastifyTypedInstance } from '@/types';

export default fastifyPlugin(
  async (app: FastifyTypedInstance) => {
    await app.register(fastifyCookie, {
      secret: env.COOKIE_SECRET ?? 'dev-secret',
      parseOptions: {
        httpOnly: true,
        sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: env.NODE_ENV === 'production',
        path: '/',
      },
    });
  },
  { name: 'cookie' },
);
