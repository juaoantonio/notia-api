import type { PrismaClient } from '@prisma/client';

export async function resetDatabase(prisma: PrismaClient) {
  // lista tabelas do schema public exceto _prisma_migrations
  const rows = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename <> '_prisma_migrations'
  `;

  // TRUNCATE em todas, com RESTART IDENTITY + CASCADE
  for (const { tablename } of rows) {
    // cuidado: usar identifier entre aspas duplas
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE "public"."${tablename}" RESTART IDENTITY CASCADE;`,
    );
  }
}
