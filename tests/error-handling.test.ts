import { buildApp } from '@/app/build-app';
import { registerCorePlugins } from '@/app/register-core-plugins';
import type { FastifyTypedInstance } from '@/types';
import { z } from 'zod';
import { expect } from 'vitest';

describe('error wrapper', () => {
  let app: FastifyTypedInstance;

  beforeAll(async () => {
    app = buildApp({
      setupProviders: registerCorePlugins,
    });
    app.get('/v1/error-interno', async () => {
      throw new Error('Erro inesperado');
    });
    app.get(
      '/v1/error-cliente-query',
      {
        schema: {
          querystring: z
            .strictObject({
              id: z.uuid(),
              name: z.string().min(3),
              age: z.number().min(0).optional(),
            })
            .describe('Query parameters'),
        },
      },
      async () => {},
    );
    app.post(
      '/v1/error-cliente-body',
      {
        schema: {
          body: z
            .strictObject({
              value: z.string(),
              nestedValue: z.object({
                value1: z.boolean(),
                value2: z.string(),
              }),
            })
            .describe('Request body'),
        },
      },
      async () => {},
    );
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('deve responder 404 com JSON do NotFoundError para rotas inexistentes', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/v1/rota-inexistente',
    });
    expect(res.statusCode).toBe(404);
    const json = await res.json();
    expect(json).toEqual({
      name: 'NotFoundError',
      statusCode: 404,
      action: 'Check if the resource exists.',
      message: 'Route not found: GET /v1/rota-inexistente.',
    });
  });

  it('deve envelopar erros desconhecidos como InternalServerError (500)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/v1/error-interno',
    });
    expect(res.statusCode).toBe(500);
    const json = await res.json();
    expect(json).toMatchObject({
      name: 'InternalServerError',
      statusCode: 500,
      action: 'Try again later or contact support if the problem persists.',
      message: 'Internal server error.',
    });
  });

  it('deve mostrar quais campos falharam na validação do Zod para query como BadRequestError (400)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/v1/error-cliente-query',
      query: { id: 'invalid-uuid', name: 'ab' },
    });
    expect(res.statusCode).toBe(400);
    const json = res.json();
    expect(json).toMatchObject({
      name: 'BadRequestError',
      statusCode: 400,
      action: 'Check the request and try again.',
      message: 'Invalid request querystring.',
      validationErrors: [
        {
          path: ['id'],
          message: 'Invalid UUID',
        },
        {
          path: ['name'],
          message: 'Too small: expected string to have >=3 characters',
        },
      ],
    });
  });

  it('deve mostrar quais campos falharam na validação do Zod para body como BadRequestError (400)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/error-cliente-body',
      body: {
        value: true,
        nestedValue: {
          value1: 'not-a-boolean',
          value2: 123,
        },
      },
    });
    expect(res.statusCode).toBe(400);
    const json = res.json();
    expect(json).toMatchObject({
      name: 'BadRequestError',
      statusCode: 400,
      action: 'Check the request and try again.',
      message: 'Invalid request body.',
      validationErrors: [
        {
          message: 'Invalid input: expected string, received boolean',
          path: ['value'],
        },
        {
          message: 'Invalid input: expected boolean, received string',
          path: ['nestedValue', 'value1'],
        },
        {
          message: 'Invalid input: expected string, received number',
          path: ['nestedValue', 'value2'],
        },
      ],
    });
  });

  it('deve retornar erro de validação se o body não for enviado', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/error-cliente-body',
    });
    expect(res.statusCode).toBe(400);
    const json = res.json();
    expect(json).toMatchObject({
      name: 'BadRequestError',
      statusCode: 400,
      action: 'Check the request and try again.',
      message: 'Invalid request body.',
      validationErrors: [
        {
          message: 'Invalid input: expected object, received null',
          path: ['body'],
        },
      ],
    });
  });
});
