import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { buildApp } from '@/app/build-app';
import { registerCorePlugins } from '@/app/register-core-plugins';
import { resetDatabase } from './utils/reset-db';
import { oauth2Mock } from '@tests/utils/providers-mocks';
import type { FastifyTypedInstance } from '@/types';

describe('routesAuth', () => {
  let app: FastifyTypedInstance;

  beforeAll(async () => {
    app = await buildApp({
      setupProviders: (app) =>
        registerCorePlugins(app, {
          oauth2Google: oauth2Mock,
        }),
    });

    await app.ready();
  });

  beforeEach(async () => {
    await resetDatabase(app.prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /v1/auth/google/callback → cria/atualiza usuário, seta cookie e redireciona', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/v1/auth/google/callback?code=fake-code&state=xyz',
    });

    expect(res.statusCode).toBe(302);
    expect(res.headers['set-cookie']).toBeDefined();

    const location = res.headers['location'];
    expect(location).toMatch(/\/home$/);

    const created = await app.prisma.user.findFirst({
      where: { googleSub: 'fake-sub' },
      select: { id: true, email: true, name: true, emailVerified: true, picture: true },
    });
    expect(created).toEqual({
      id: created?.id,
      email: 'fake@test.com',
      name: 'Mock User',
      emailVerified: true,
      picture: 'https://example.com/pic.png',
    });
  });

  it('GET /v1/me → com token válido retorna o usuário', async () => {
    const user = await app.prisma.user.create({
      data: {
        googleSub: 'sub-42',
        email: 'ada@lovelace.dev',
        emailVerified: true,
        name: 'Ada Lovelace',
        picture: null,
      },
      select: { id: true, email: true, name: true, picture: true },
    });

    const token = app.jwt.sign(
      { email: user.email ?? undefined, name: user.name ?? undefined },
      { sub: user.id },
    );

    const res = await app.inject({
      method: 'GET',
      url: '/v1/me',
      cookies: { token },
    });

    expect(res.statusCode).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      id: user.id,
      name: 'Ada Lovelace',
      email: 'ada@lovelace.dev',
      picture: null,
    });
  });

  it('GET /v1/me → sem token retorna 401', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/v1/me',
    });
    expect(res.statusCode).toBe(401);
    const body = await res.json();
    expect(body).toEqual({
      action: 'Please log in or provide valid credentials.',
      message: 'Unauthorized access.',
      name: 'UnauthorizedError',
      statusCode: 401,
    });
  });

  it('POST /v1/auth/logout → limpa cookie e retorna 204', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/auth/logout',
    });

    expect(res.statusCode).toBe(204);

    const setCookie = res.headers['set-cookie'] || [];
    const header = Array.isArray(setCookie) ? setCookie.join(';') : String(setCookie);
    expect(header).toMatch(/token=;/);
  });

  it('GET /v1/auth/google/callback → query inválida retorna 400', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/v1/auth/google/callback',
    });

    expect(res.statusCode).toBe(400);
    const json = await res.json();
    expect(json).toEqual({
      action: 'Check the request parameters and try again.',
      message: 'Invalid request.',
      name: 'BadRequestError',
      statusCode: 400,
    });
  });
});
