import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createTestServer } from '@tests/setup/test-server';

let baseURL: string;
let app: FastifyInstance;

describe('[e2e] error wrapper', () => {
  beforeAll(async () => {
    const server = await createTestServer((app) => {
      app.get('/v1/boom', () => {
        throw new Error('Erro desconhecido');
      });
    });
    app = server.app;
    baseURL = server.baseURL;
  });

  afterAll(async () => {
    await app.close();
  });

  it('deve responder 404 com JSON do NotFoundError para rotas inexistentes', async () => {
    const res = await fetch(`${baseURL}/v1/rota-inexistente`);
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json).toEqual({
      name: 'NotFoundError',
      statusCode: 404,
      action: 'Check if the resource exists.',
      message: 'Route not found: GET /v1/rota-inexistente.',
    });
  });

  it('deve envelopar erros desconhecidos como InternalServerError (500)', async () => {
    const res = await fetch(`${baseURL}/v1/boom`);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json).toMatchObject({
      name: 'InternalServerError',
      statusCode: 500,
      action: 'Try again later or contact support if the problem persists.',
      message: 'Internal server error.',
    });
  });
});
