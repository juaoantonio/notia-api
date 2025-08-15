import fp from 'fastify-plugin';
import { PrismaClient } from '@/generated/prisma';
import type { FastifyTypedInstance } from '@/types';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

export default fp(
  async (app: FastifyTypedInstance) => {
    const prisma = new PrismaClient();
    await prisma.$connect();

    app.decorate('prisma', prisma);

    app.addHook('onClose', async (instance) => {
      await instance.prisma.$disconnect();
    });
  },
  { name: 'prisma' },
);
