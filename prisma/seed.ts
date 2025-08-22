import { EventType, PrismaClient, TagSource } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

/** Deixa o seed reproduzível (pseudo-aleatório) */
faker.seed(20250822);

async function main() {
  console.time('seed');

  // ——————————————————————————————————————————————————————————————
  // 0) Limpeza leve (opcional): só para ambiente de dev
  //    Use TRUNCATE CASCADE se preferir "zerar" tudo rapidamente.
  // ——————————————————————————————————————————————————————————————
  await prisma.$transaction([
    prisma.event.deleteMany(),
    prisma.linkTag.deleteMany(),
    prisma.publicSlug.deleteMany(),
    prisma.link.deleteMany(),
    prisma.folder.deleteMany(),
    prisma.tag.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // ——————————————————————————————————————————————————————————————
  // 1) Usuário único
  // ——————————————————————————————————————————————————————————————
  const user = await prisma.user.create({
    data: {
      googleSub: 'google-oauth2|notia-demo-user-001',
      email: 'demo@notia.app',
      emailVerified: true,
      name: 'Demo User',
      picture:
        'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=256&q=80&auto=format&fit=crop',
    },
  });

  // ——————————————————————————————————————————————————————————————
  // 2) Pool de tags (criadas uma vez; depois só relacionamos)
  // ——————————————————————————————————————————————————————————————
  const tagPool = [
    'javascript',
    'typescript',
    'nodejs',
    'fastify',
    'prisma',
    'postgres',
    'zod',
    'react',
    'ux-writing',
    'copywriting',
    'algorithms',
    'networking',
    'linux',
    'security',
    'testing',
    'ai',
    'prompt-engineering',
    'education',
    'design-system',
    'performance',
  ];

  await prisma.tag.createMany({
    data: tagPool.map((name) => ({ name })),
    skipDuplicates: true,
  });

  const allTags = await prisma.tag.findMany({ where: { name: { in: tagPool } } });

  // ——————————————————————————————————————————————————————————————
  // 3) Criar 10 pastas para o usuário
  // ——————————————————————————————————————————————————————————————
  const folderNames = [
    '📚 Estudos — JavaScript',
    '⚙️ Backend — Fastify',
    '🗄️ Banco & Prisma',
    '🧪 Testes & Qualidade',
    '🖥️ Frontend — React',
    '🧠 IA & Prompting',
    '🕸️ Redes & DevOps',
    '🐧 Linux & CLI',
    '🎨 UX Writing & Copy',
    '🚀 Performance & Escala',
  ];

  const folders = await Promise.all(
    folderNames.map((name, idx) =>
      prisma.folder.create({
        data: {
          ownerId: user.id,
          name,
          description: faker.lorem.sentence(),
          isPublic: idx % 3 === 0, // algumas públicas
          isFavorite: idx % 4 === 0,
        },
      }),
    ),
  );

  // Cria slugs públicos para as pastas públicas
  const publicFolders = folders.filter((f) => f.isPublic);
  await prisma.publicSlug.createMany({
    data: publicFolders.map((f) => ({
      folderId: f.id,
      slug: faker.helpers.slugify(`${f.name}-${faker.string.alphanumeric(6)}`).toLowerCase(),
      active: true,
    })),
    skipDuplicates: true,
  });

  // ——————————————————————————————————————————————————————————————
  // 4) Para cada pasta, criar 5–10 links
  //    + Tags (1–4 por link, mistura MANUAL/AI)
  //    + Eventos (CREATE/CLICK/VISIT)
  // ——————————————————————————————————————————————————————————————
  const allLinkIds: string[] = [];
  const linkTagRows: { linkId: string; tagId: string; source: TagSource }[] = [];
  const eventRows: {
    userId?: string | null;
    folderId?: string | null;
    linkId?: string | null;
    eventType: EventType;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    meta: any;
    occurredAt: Date;
  }[] = [];

  for (const folder of folders) {
    const linksCount = faker.number.int({ min: 5, max: 10 });
    const linkBatch = [];

    for (let i = 0; i < linksCount; i++) {
      const url = faker.internet.url();
      const title = faker.helpers.arrayElement([
        `${faker.hacker.adjective()} ${faker.hacker.noun()} — Guide`,
        `How to ${faker.hacker.verb()} ${faker.hacker.noun()}`,
        `${faker.company.buzzPhrase()} for ${faker.hacker.noun()}`,
        `Deep dive: ${faker.hacker.noun()} & ${faker.hacker.noun()}`,
      ]);

      linkBatch.push({
        id: faker.string.uuid(),
        folderId: folder.id,
        url,
        title,
        description: faker.lorem.sentences({ min: 1, max: 2 }),
        createdAt: faker.date.recent({ days: 40 }),
        updatedAt: new Date(),
      });
    }

    // Inserimos os links em lote
    await prisma.link.createMany({ data: linkBatch });
    linkBatch.forEach((l) => allLinkIds.push(l.id));

    // Para cada link, sorteia 1–4 tags do pool
    for (const link of linkBatch) {
      const tagQty = faker.number.int({ min: 1, max: 4 });
      const pick = faker.helpers.arrayElements(allTags, tagQty);

      for (const t of pick) {
        linkTagRows.push({
          linkId: link.id,
          tagId: t.id,
          source: faker.datatype.boolean() ? TagSource.AI : TagSource.MANUAL,
        });
      }

      // Eventos: CREATE obrigatório, e mais alguns aleatórios
      eventRows.push({
        userId: user.id,
        folderId: folder.id,
        linkId: link.id,
        eventType: EventType.CREATE,
        meta: { source: 'seed' },
        occurredAt: new Date(link.createdAt),
      });

      if (faker.datatype.boolean()) {
        eventRows.push({
          userId: user.id,
          folderId: folder.id,
          linkId: link.id,
          eventType: EventType.CLICK,
          meta: { device: faker.helpers.arrayElement(['desktop', 'mobile']) },
          occurredAt: faker.date.recent({ days: 15 }),
        });
      }

      if (folder.isPublic && faker.datatype.boolean()) {
        eventRows.push({
          userId: null, // visitante anônimo
          folderId: folder.id,
          linkId: null,
          eventType: EventType.VISIT,
          meta: { referrer: faker.internet.url() },
          occurredAt: faker.date.recent({ days: 10 }),
        });
      }
    }
  }

  // Inserimos LinkTag em lote (pode haver duplicatas; skipDuplicates evita erro)
  await prisma.linkTag.createMany({
    data: linkTagRows,
    skipDuplicates: true,
  });

  // Inserimos Eventos (use lote menor para não estourar parâmetros)
  const chunkSize = 500;
  for (let i = 0; i < eventRows.length; i += chunkSize) {
    const slice = eventRows.slice(i, i + chunkSize);
    // createMany não suporta JSON direto em alguns drivers + skipDuplicates para PKs não se aplica aqui (id autoincrement).
    // Então fazemos inserts individuais em transação por pedaços para manter robustez.
    await prisma.$transaction(
      slice.map((e) =>
        prisma.event.create({
          data: {
            userId: e.userId ?? null,
            folderId: e.folderId ?? null,
            linkId: e.linkId ?? null,
            eventType: e.eventType,
            meta: e.meta,
            occurredAt: e.occurredAt,
          },
        }),
      ),
    );
  }

  // ——————————————————————————————————————————————————————————————
  // 5) Feedback
  // ——————————————————————————————————————————————————————————————
  console.log('Usuário:', user.email);
  console.log('Pastas criadas:', folders.length);
  console.log('Links criados (estimado):', allLinkIds.length);
  console.log('Relações Link–Tag:', linkTagRows.length);
  console.log('Eventos:', eventRows.length);

  console.timeEnd('seed');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
