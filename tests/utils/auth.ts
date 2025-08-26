// tests/utils/auth.ts
import type { Prisma } from '@prisma/client';
import type { FastifyTypedInstance } from '@/types';

type UserOverrides = Partial<
  Pick<Prisma.UserCreateInput, 'googleSub' | 'email' | 'name' | 'picture' | 'emailVerified'>
>;

/**
 * Garante um usuário padrão no banco (id estável por googleSub) e assina um JWT válido.
 * Retorna { user, token, cookies } para usar direto no app.inject().
 */
export async function seedAndSignIn(app: FastifyTypedInstance, overrides: UserOverrides = {}) {
  const defaults: Required<UserOverrides> = {
    googleSub: 'test-sub-default',
    email: 'tester@example.com',
    name: 'Test User',
    picture: null, // Prisma aceita null para picture? ajuste conforme schema
    emailVerified: true,
  };

  const data = { ...defaults, ...overrides };

  // mantém o usuário estável entre testes via upsert
  const user = await app.prisma.user.upsert({
    where: { googleSub: data.googleSub! },
    create: {
      googleSub: data.googleSub!,
      email: data.email!,
      name: data.name!,
      emailVerified: data.emailVerified!,
      picture: data.picture ?? null,
    },
    update: {
      ...(data.email ? { email: data.email } : {}),
      ...(data.name ? { name: data.name } : {}),
      ...(typeof data.picture !== 'undefined' ? { picture: data.picture } : {}),
      ...(typeof data.emailVerified === 'boolean' ? { emailVerified: data.emailVerified } : {}),
    },
    select: { id: true, email: true, name: true, picture: true },
  });

  // usa o jwt REAL registrado no app (nada de mock)
  const token = app.jwt.sign(
    {
      email: user.email ?? undefined,
      name: user.name ?? undefined,
    },
    { sub: user.id },
  );

  return {
    user,
    token,
    // formatação compatível com fastify.inject({ cookies })
    cookies: { token },
    // se preferir usar header manual:
    cookieHeader: `token=${token}; Path=/; HttpOnly; SameSite=Lax`,
  };
}
