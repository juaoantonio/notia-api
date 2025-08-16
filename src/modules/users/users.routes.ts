import type { FastifyTypedPluginAsync } from '@/types';
import { NotFoundError } from '@/errors/client.errors';

const usersRoutes: FastifyTypedPluginAsync = async (app) => {
  app.get(
    '/me',
    {
      onRequest: [app.authenticate],
    },
    async (request, reply) => {
      const result = await app.prisma.user.findUnique({
        where: {
          id: request.user.id,
        },
        select: {
          id: true,
          email: true,
          name: true,
          picture: true,
          _count: {
            select: {
              folders: true,
            },
          },
          folders: {
            select: {
              _count: {
                select: {
                  links: true,
                },
              },
            },
          },
        },
      });

      if (!result) {
        throw new NotFoundError({
          message: 'User not found.',
          action: 'Check if the user ID is correct.',
        });
      }

      return reply.send({
        id: result.id,
        email: result.email,
        name: result.name,
        picture: result.picture,
        foldersCount: result._count.folders,
        linksCount: result.folders.reduce((acc, folder) => acc + folder._count.links, 0),
      });
    },
  );
};

export default usersRoutes;
