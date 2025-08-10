import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const user = await prisma.user.upsert({
    where: { email: 'demo@notia.local' },
    update: {},
    create: {
      email: 'demo@notia.local',
      passwordHash: 'changeme',
      name: 'Demo User',
    },
  });

  const folder = await prisma.folder.create({
    data: {
      ownerId: user.id,
      name: 'Getting Started',
      description: 'Sample folder created by seed',
      isPublic: false,
    },
  });

  const link = await prisma.link.create({
    data: {
      folderId: folder.id,
      url: 'https://example.com',
      title: 'Welcome to Notia',
      description: 'Example link created by seed',
    },
  });

  const tag = await prisma.tag.upsert({
    where: { name: 'productivity' },
    update: {},
    create: { name: 'productivity' },
  });

  await prisma.linkTag.create({
    data: {
      linkId: link.id,
      tagId: tag.id,
      source: 'MANUAL',
    },
  });

  const publicSlug = await prisma.publicSlug.create({
    data: {
      folderId: folder.id,
      slug: `getting-started-${Math.random().toString(36).slice(2, 8)}`,
      active: true,
    },
  });

  await prisma.event.create({
    data: {
      userId: user.id,
      folderId: folder.id,
      linkId: link.id,
      eventType: 'CREATE',
      meta: { note: 'seed' },
      occurredAt: new Date(),
    },
  });

  console.log('Seed completed:', {
    user: user.email,
    folderId: folder.id,
    linkId: link.id,
    publicSlug: publicSlug.slug,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


