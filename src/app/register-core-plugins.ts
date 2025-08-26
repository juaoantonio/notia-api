import prismaProvider from '@/providers/prisma.provider';
import corsProvider from '@/providers/cors.provider';
import cookieProvider from '@/providers/cookie.provider';
import jwtProvider from '@/providers/jwt.provider';
import oauth2GoogleProvider from '@/providers/oauth2-google.provider';
import type { FastifyTypedInstance } from '@/types';

export interface CorePluginOverrides {
  prisma?: typeof prismaProvider;
  cors?: typeof corsProvider;
  cookie?: typeof cookieProvider;
  jwt?: typeof jwtProvider;
  oauth2Google?: typeof oauth2GoogleProvider;
}

export function registerCorePlugins(
  app: FastifyTypedInstance,
  overrides: CorePluginOverrides = {},
) {
  const plugins = {
    prisma: overrides.prisma ?? prismaProvider,
    cors: overrides.cors ?? corsProvider,
    cookie: overrides.cookie ?? cookieProvider,
    jwt: overrides.jwt ?? jwtProvider,
    oauth2Google: overrides.oauth2Google ?? oauth2GoogleProvider,
  };

  app.register(plugins.prisma);
  app.register(plugins.cors);
  app.register(plugins.cookie);
  app.register(plugins.jwt);
  app.register(plugins.oauth2Google);
}
