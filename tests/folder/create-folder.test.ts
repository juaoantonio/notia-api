import { afterAll, beforeAll, beforeEach, describe, expect } from 'vitest';
import type { FastifyTypedInstance } from '@/types';
import { buildApp } from '@/app/build-app';
import { registerCorePlugins } from '@/app/register-core-plugins';
import { resetDatabase } from '@tests/utils/reset-db';
import { seedAndSignIn } from '@tests/utils/auth';
import { faker } from '@faker-js/faker';
import { oauth2Mock } from '@tests/utils/providers-mocks';

describe('criação de pastas', () => {
  let app: FastifyTypedInstance;
  let auth: Awaited<ReturnType<typeof seedAndSignIn>>;

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
    auth = await seedAndSignIn(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('deve criar uma pasta com todos os campos', async () => {
    const folderData = {
      name: 'Minha Pasta',
      description: faker.lorem.paragraph(),
      isPublic: true,
    };

    const res = await app.inject({
      method: 'POST',
      url: '/v1/folders',
      cookies: auth.cookies,
      payload: folderData,
    });

    expect(res.statusCode).toBe(201);
    const json = res.json();
    expect(json).toEqual({
      id: expect.any(String),
    });
    const folderInDb = await app.prisma.folder.findUnique({
      where: { id: json.id },
    });
    expect(folderInDb).toMatchObject(json);
  });

  it('deve criar uma pasta com apenas o campo obrigatório', async () => {
    const folderData = {
      name: 'Pasta Simples',
    };

    const res = await app.inject({
      method: 'POST',
      url: '/v1/folders',
      cookies: auth.cookies,
      payload: folderData,
    });

    expect(res.statusCode).toBe(201);
    const json = res.json();
    expect(json).toEqual({
      id: expect.any(String),
    });
    const folderInDb = await app.prisma.folder.findUnique({
      where: { id: json.id },
    });
    expect(folderInDb).toMatchObject(json);
  });

  it('não deve criar pasta sem autenticação', async () => {
    const folderData = {
      name: 'Pasta Inválida',
    };

    const res = await app.inject({
      method: 'POST',
      url: '/v1/folders',
      payload: folderData,
    });

    expect(res.statusCode).toBe(401);
  });

  it('não deve criar pasta com dados inválidos', async () => {
    const invalidFolderData = {
      name: '', // Nome vazio
      description: faker.lorem.paragraph(),
      isPublic: 'not-a-boolean',
    };

    const res = await app.inject({
      method: 'POST',
      url: '/v1/folders',
      cookies: auth.cookies,
      payload: invalidFolderData,
    });

    expect(res.statusCode).toBe(400);
    const json = res.json();
    expect(json).toEqual({
      statusCode: 400,
      message: 'Invalid request body.',
      action: 'Check the request and try again.',
      name: 'BadRequestError',
      validationErrors: [
        {
          message: 'Too small: expected string to have >=3 characters',
          path: ['name'],
        },
        {
          message: 'Invalid input: expected boolean, received string',
          path: ['isPublic'],
        },
      ],
    });
  });
});
