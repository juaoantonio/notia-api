import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest';
import type { FastifyTypedInstance } from '@/types';
import { buildApp } from '@/app/build-app';
import { registerCorePlugins } from '@/app/register-core-plugins';
import { resetDatabase } from '@tests/utils/reset-db';
import { seedAndSignIn } from '@tests/utils/auth';
import type { Prisma } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { oauth2Mock } from '@tests/utils/providers-mocks';

describe('busca paginada de pastas', () => {
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

  it('deve buscar pastas com paginação sem parâmetros default', async () => {
    const foldersData: Prisma.FolderCreateManyInput[] = Array.from({ length: 25 }, (_, i) => ({
      name: `Folder ${i + 1}`,
      ownerId: auth.user.id,
      description: faker.lorem.paragraph(),
    }));
    await app.prisma.folder.createMany({ data: foldersData });

    const res = await app.inject({
      method: 'GET',
      url: '/v1/folders',
      cookies: auth.cookies,
    });

    expect(res.statusCode).toBe(200);
    const body = await res.json();
    expect(body.meta).toEqual({
      page: 1,
      limit: 10,
      count: 10,
      total: 25,
      totalPages: 3,
      hasPrev: false,
      hasNext: true,
      prevPage: null,
      nextPage: 2,
    });
    expect(body.data).toHaveLength(10);
  });

  describe('filtros', () => {
    it('deve filtrar por nome parcialmente em ordem ascendente', async () => {
      await app.prisma.folder.createMany({
        data: [
          { name: 'Work 1', ownerId: auth.user.id, description: faker.lorem.paragraph() },
          { name: 'Personal Stuff', ownerId: auth.user.id, description: faker.lorem.paragraph() },
          { name: 'Work 2', ownerId: auth.user.id, description: faker.lorem.paragraph() },
        ],
      });

      const res = await app.inject({
        method: 'GET',
        url: '/v1/folders?name=Work&orderBy=name&orderDirection=asc',
        cookies: auth.cookies,
      });

      expect(res.statusCode).toBe(200);
      const body = await res.json();
      expect(body.data).toHaveLength(2);
      expect(body.data[0].name).toEqual('Work 1');
      expect(body.data[1].name).toEqual('Work 2');
    });

    it('deve filtrar por nome parcialmente em ordem descendente', async () => {
      await app.prisma.folder.createMany({
        data: [
          { name: 'Work 1', ownerId: auth.user.id, description: faker.lorem.paragraph() },
          { name: 'Personal Stuff', ownerId: auth.user.id, description: faker.lorem.paragraph() },
          { name: 'Work 2', ownerId: auth.user.id, description: faker.lorem.paragraph() },
        ],
      });

      const res = await app.inject({
        method: 'GET',
        url: '/v1/folders?name=Work&orderBy=name&orderDirection=desc',

        cookies: auth.cookies,
      });

      expect(res.statusCode).toBe(200);
      const body = await res.json();
      expect(body.data).toHaveLength(2);
      expect(body.data[1].name).toEqual('Work 1');
      expect(body.data[0].name).toEqual('Work 2');
    });

    it('deve filtrar por pastas publicas', async () => {
      await app.prisma.folder.createMany({
        data: [
          {
            name: 'Public Folder',
            ownerId: auth.user.id,
            isPublic: true,
            description: faker.lorem.paragraph(),
          },
          {
            name: 'Private Folder',
            ownerId: auth.user.id,
            isPublic: false,
            description: faker.lorem.paragraph(),
          },
        ],
      });

      const res = await app.inject({
        method: 'GET',
        url: '/v1/folders?isPublic=true',
        cookies: auth.cookies,
      });

      expect(res.statusCode).toBe(200);
      const body = await res.json();
      expect(body.data).toHaveLength(1);
      expect(body.data[0].name).toBe('Public Folder');
    });

    it('deve filtrar por pastas privadas', async () => {
      await app.prisma.folder.createMany({
        data: [
          {
            name: 'Public Folder',
            ownerId: auth.user.id,
            isPublic: true,
            description: faker.lorem.paragraph(),
          },
          {
            name: 'Private Folder',
            ownerId: auth.user.id,
            isPublic: false,
            description: faker.lorem.paragraph(),
          },
        ],
      });

      const res = await app.inject({
        method: 'GET',
        url: '/v1/folders',
        query: { isPublic: 'false' },
        cookies: auth.cookies,
      });

      expect(res.statusCode).toBe(200);
      const body = await res.json();
      expect(body.data).toHaveLength(1);
      expect(body.data[0].name).toBe('Private Folder');
    });

    it('deve filtrar por pastas favoritas', async () => {
      await app.prisma.folder.createMany({
        data: [
          {
            name: 'Favorite Folder',
            ownerId: auth.user.id,
            isFavorite: true,
            description: faker.lorem.paragraph(),
          },
          {
            name: 'Regular Folder',
            ownerId: auth.user.id,
            isFavorite: false,
            description: faker.lorem.paragraph(),
          },
        ],
      });

      const res = await app.inject({
        method: 'GET',
        url: '/v1/folders?isFavorite=true',
        cookies: auth.cookies,
      });

      expect(res.statusCode).toBe(200);
      const body = await res.json();
      expect(body.data).toHaveLength(1);
      expect(body.data[0].name).toBe('Favorite Folder');
    });

    it('deve filtrar por pastas não favoritas', async () => {
      await app.prisma.folder.createMany({
        data: [
          {
            name: 'Favorite Folder',
            ownerId: auth.user.id,
            isFavorite: true,
            description: faker.lorem.paragraph(),
          },
          {
            name: 'Regular Folder',
            ownerId: auth.user.id,
            isFavorite: false,
            description: faker.lorem.paragraph(),
          },
        ],
      });

      const res = await app.inject({
        method: 'GET',
        url: '/v1/folders',
        query: { isFavorite: 'false' },
        cookies: auth.cookies,
      });

      expect(res.statusCode).toBe(200);
      const body = await res.json();
      expect(body.data).toHaveLength(1);
      expect(body.data[0].name).toBe('Regular Folder');
    });
  });
});
