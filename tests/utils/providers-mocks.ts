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
