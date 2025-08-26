import type { FastifyTypedPluginAsync } from '@/types';
import type { Prisma } from '@prisma/client';
import { makePage } from '@/shared/pagination';
import { schemas } from '@/modules/link/schemas.link';

export const routesLink: FastifyTypedPluginAsync = async (app) => {
  app.get(
    '/links',
    {
      onRequest: [app.authenticate],
      schema: { querystring: schemas.getPaginatedLinksSchema.schema },
    },
    async (request) => {
      const userId = request.user.id;
      const { title, folderId } = request.query;

      const where: Prisma.LinkWhereInput = {
        folder: {
          ownerId: userId,
        },
        ...(title ? { title: { contains: title, mode: 'insensitive' as const } } : {}),
        ...(folderId ? { folderId } : {}),
      };

      const orderBy = schemas.getPaginatedLinksSchema.buildOrderBy(request.query);
      orderBy.push({ createdAt: 'desc' });

      const { skip, take } = schemas.getPaginatedLinksSchema.buildPagination(request.query);

      const [items, total] = await Promise.all([
        app.prisma.link.findMany({
          where,
          select: {
            id: true,
            image: true,
            title: true,
            url: true,
            favicon: true,
            siteName: true,
            tags: {
              select: {
                tag: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                source: true,
              },
            },
            description: true,
            folderId: true,
          },
          orderBy,
          skip,
          take,
        }),
        app.prisma.link.count({ where }),
      ]);

      return makePage(items, total, request.query.page, request.query.limit);
    },
  );
};
