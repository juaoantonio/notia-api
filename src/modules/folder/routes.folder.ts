import type { FastifyTypedPluginAsync } from '@/types';
import type { Prisma } from '@prisma/client';
import { makePage } from '@/shared/pagination';
import { schemas } from '@/modules/folder/schemas.folder';

export const routesFolder: FastifyTypedPluginAsync = async (app) => {
  app.get(
    '/folders',
    {
      onRequest: [app.authenticate],
      schema: { querystring: schemas.getPaginatedFoldersSchema.schema },
    },
    async (request) => {
      const userId = request.user.id;
      const { name, isPublic, isFavorite } = request.query;

      const where: Prisma.FolderWhereInput = {
        ownerId: userId,
        ...(name ? { name: { contains: name, mode: 'insensitive' as const } } : {}),
        ...(typeof isPublic === 'boolean' ? { isPublic } : {}),
        ...(typeof isFavorite === 'boolean' ? { isFavorite } : {}),
      };

      const orderBy = schemas.getPaginatedFoldersSchema.buildOrderBy(request.query);
      orderBy.push({ createdAt: 'desc' });

      const { skip, take } = schemas.getPaginatedFoldersSchema.buildPagination(request.query);

      const [items, total] = await Promise.all([
        app.prisma.folder.findMany({
          where,
          select: {
            id: true,
            name: true,
            description: true,
            isPublic: true,
            isFavorite: true,
            publicSlug: { select: { slug: true, revokedAt: true, active: true } },
            _count: { select: { links: true } },
          },
          orderBy,
          skip,
          take,
        }),
        app.prisma.folder.count({ where }),
      ]);

      const data = items.map((f) => ({
        id: f.id,
        name: f.name,
        description: f.description,
        isPublic: f.isPublic,
        isFavorite: f.isFavorite,
        publicSlug: f.publicSlug,
        linksCount: f._count.links,
      }));

      return makePage(data, total, request.query.page, request.query.limit);
    },
  );

  app.post(
    '/folders',
    {
      onRequest: [app.authenticate],
      schema: { body: schemas.createFolderSchema },
    },
    async (request, reply) => {
      const userId = request.user.id;
      const { name, description, isPublic } = request.body;
      const folder = await app.prisma.folder.create({
        data: {
          name,
          description: description ?? null,
          isPublic: isPublic ?? false,
          owner: { connect: { id: userId } },
        },
        select: { id: true },
      });
      return reply.status(201).send({
        id: folder.id,
      });
    },
  );
};
