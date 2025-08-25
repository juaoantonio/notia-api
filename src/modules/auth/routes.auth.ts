import { CallbackQuerySchema } from './schemas.auth';
import type { FastifyTypedInstance, FastifyTypedPluginAsync } from '@/types';
import type { GoogleProfile } from '@/modules/auth/types.auth';
import { env } from '@config/env';
import { StatusCodes } from 'http-status-codes';
import type { Prisma } from '@prisma/client';
import { BadRequestError, NotFoundError, UnauthorizedError } from '@/errors/client.errors';

const routesAuth: FastifyTypedPluginAsync = async (app: FastifyTypedInstance) => {
  app.get('/auth/google/callback', async (req, reply) => {
    const parsed = CallbackQuerySchema.safeParse(req.query);
    if (!parsed.success) throw new BadRequestError();

    const { token } = await app.GoogleOAuth2.getAccessTokenFromAuthorizationCodeFlow(req);
    const profile = (await app.GoogleOAuth2.userinfo(token.access_token)) as GoogleProfile;

    const updateData: Prisma.UserUpdateInput = {
      ...(profile.email !== undefined ? { email: profile.email ?? null } : {}),
      ...(profile.email_verified !== undefined ? { emailVerified: profile.email_verified } : {}),
      ...(profile.name !== undefined ? { name: profile.name } : {}),
      ...(profile.picture !== undefined ? { picture: profile.picture } : {}),
    };

    const user = await app.prisma.user.upsert({
      where: { googleSub: profile.sub },
      update: updateData,
      create: {
        googleSub: profile.sub,
        email: profile.email ?? null,
        emailVerified: profile.email_verified ?? false,
        name: profile.name ?? null,
        picture: profile.picture ?? null,
      },
      select: { id: true, email: true, name: true },
    });

    const jwt = await reply.jwtSign(
      { email: user.email ?? undefined, name: user.name ?? undefined },
      { sub: user.id },
    );

    reply.setCookie('token', jwt, {
      httpOnly: true,
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return reply.redirect(`${env.FRONTEND_URL}/home`);
  });

  app.get(
    '/me',
    {
      onRequest: [app.authenticate],
    },
    async (request) => {
      const user = await app.prisma.user.findUnique({
        where: {
          id: request.user.id,
        },
        select: {
          id: true,
          name: true,
          picture: true,
          email: true,
        },
      });
      if (!user) {
        throw new UnauthorizedError();
      }
      return user;
    },
  );

  app.post('/auth/logout', async (_request, reply) => {
    reply.clearCookie('token');
    return reply.code(StatusCodes.NO_CONTENT).send();
  });

  app.get('/auth/dev-login', async (_request, reply) => {
    if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
      throw new NotFoundError();
    }

    const user = await app.prisma.user.findUnique({
      where: { email: 'demo@notia.app' },
    });

    if (!user) {
      throw new UnauthorizedError();
    }

    const jwt = await reply.jwtSign(
      { email: user.email ?? undefined, name: user.name ?? undefined },
      { sub: user.id },
    );

    reply.setCookie('token', jwt, {
      httpOnly: true,
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return reply.redirect(`${env.FRONTEND_URL}/home`);
  });
};

export default routesAuth;
