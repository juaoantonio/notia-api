import { buildApp } from '@/app/build-app';

describe('error wrapper', () => {
  let app: ReturnType<typeof buildApp>;
  beforeAll(async () => {
    app = buildApp();
    app.get('/v1/error-interno', async () => {
      throw new Error('Erro inesperado');
    });
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
});
