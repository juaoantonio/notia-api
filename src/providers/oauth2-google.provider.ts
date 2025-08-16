import { fastifyPlugin } from 'fastify-plugin';
import { fastifyOauth2, type OAuth2Namespace } from '@fastify/oauth2';
import { env } from '@config/env';
import type { FastifyTypedInstance } from '@/types';

declare module 'fastify' {
  interface FastifyInstance {
    GoogleOAuth2: OAuth2Namespace;
  }
}

const googleOAuthPlugin = async (app: FastifyTypedInstance) => {
  await app.register(fastifyOauth2, {
    name: 'GoogleOAuth2',
    scope: ['openid', 'email', 'profile'],
    credentials: {
      client: {
        id: env.GOOGLE_CLIENT_ID,
        secret: env.GOOGLE_CLIENT_SECRET,
      },
    },
    discovery: { issuer: 'https://accounts.google.com' },
    callbackUri: env.GOOGLE_CALLBACK_URL,
    startRedirectPath: '/v1/auth/google/login',
    cookie: { httpOnly: true, sameSite: 'lax', secure: false, path: '/' },
  });
};

export default fastifyPlugin(googleOAuthPlugin, { name: 'oauth2-google' });
