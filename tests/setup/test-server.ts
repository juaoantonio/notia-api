import type { FastifyInstance } from 'fastify';
import { buildApp } from '@/app';

export type TestServer = { app: FastifyInstance; baseURL: string; close: () => Promise<void> };

export async function createTestServer(
  configure?: (app: FastifyInstance) => void | Promise<void>,
): Promise<TestServer> {
  const app = buildApp();
  if (configure) configure(app);

  await app.listen({ port: 0, host: '127.0.0.1' });
  const address = app.server.address();
  if (!address || typeof address === 'string')
    throw new Error('Failed to acquire ephemeral address');

  return { app, baseURL: `http://127.0.0.1:${address.port}`, close: () => app.close() };
}
