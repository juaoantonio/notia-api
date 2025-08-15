import type { FastifyPluginAsync } from 'fastify';
import { CallbackQuerySchema } from './auth.schemas';
import type { FastifyTypedInstance } from '@/types';
import type { GoogleProfile } from '@/modules/auth/auth.types';
import { env } from '@config/env';
import type { Prisma } from '@/generated/prisma';
import { StatusCodes } from 'http-status-codes';

const authRoutes: FastifyPluginAsync = async (app: FastifyTypedInstance) => {
  app.get('/auth/google/callback', async (req, reply) => {
    const parsed = CallbackQuerySchema.safeParse(req.query);
    if (!parsed.success)
      return reply.code(StatusCodes.BAD_REQUEST).send({ error: 'invalid_query' });

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
    return reply.redirect(env.FRONTEND_URL);
  });
};

export default authRoutes;
