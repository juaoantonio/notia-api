import { buildApp } from '../../src/app';
import type { FastifyInstance } from 'fastify';
import { beforeAll } from 'vitest';

describe('Try to access inexistent route', () => {
  let app: FastifyInstance;

  beforeAll(() => {
    app = buildApp();
  });
  test('should return not found error', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/inexistent-route',
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      name: 'NotFoundError',
      message: 'Route not found: GET /inexistent-route.',
      action: 'Check if the resource exists.',
      statusCode: 404,
    });
  });
});
