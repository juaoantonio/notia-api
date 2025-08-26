import type fastify from 'fastify';
import prismaProvider from '@/providers/prisma.provider';
import corsProvider from '@/providers/cors.provider';
import cookieProvider from '@/providers/cookie.provider';
import jwtProvider from '@/providers/jwt.provider';
import oauth2GoogleProvider from '@/providers/oauth2-google.provider';
import type { FastifyTypedInstance } from '@/types';

type CorePlugin = (app: FastifyTypedInstance) => ReturnType<typeof fastify>;

export function registerCorePlugins(app: FastifyTypedInstance) {
  const plugins: CorePlugin[] = [
    (a) => a.register(prismaProvider),
    (a) => a.register(corsProvider),
    (a) => a.register(cookieProvider),
    (a) => a.register(jwtProvider),
    (a) => a.register(oauth2GoogleProvider),
  ];

  for (const plug of plugins) {
    plug(app);
  }
}
