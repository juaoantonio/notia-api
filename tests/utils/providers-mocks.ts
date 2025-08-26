import { fastifyPlugin } from 'fastify-plugin';

export const oauth2Mock = fastifyPlugin(async (app) => {
  app.decorate('GoogleOAuth2', {
    // @ts-expect-error Mocking methods
    getAccessTokenFromAuthorizationCodeFlow: async () => ({
      token: { access_token: 'fake-access-token' },
    }),
    userinfo: async () => ({
      sub: 'fake-sub',
      email: 'fake@test.com',
      email_verified: true,
      name: 'Mock User',
      picture: 'https://example.com/pic.png',
    }),
  });
});

export const jwtMock = fastifyPlugin(async (app) => {
  // @ts-expect-error Mocking methods
  app.decorate('jwt', {
    sign: () => 'fake-token',
    verify: async () => ({ id: 'fake-user-id', email: 'fake@test.com' }),
  });

  // O hook authenticate vai usar verify e popular request.user
  app.decorate('authenticate', async (req, reply) => {
    try {
      req.user = await app.jwt.verify(req.cookies.token || '');
    } catch {
      reply.code(401).send({ message: 'Unauthorized' });
    }
  });
});
