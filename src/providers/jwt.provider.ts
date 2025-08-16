import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import { env } from '@config/env';
import type { FastifyTypedInstance } from '@/types';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: {
      id: string;
      email: string | null;
      name: string | null;
    };
  }
}

export default fp(
  async (app: FastifyTypedInstance) => {
    app.register(fastifyJwt, {
      secret: env.JWT_SECRET,
      sign: { expiresIn: env.JWT_EXPIRES_IN },
      cookie: { cookieName: 'token', signed: false },
    });

    app.decorate('authenticate', async function (req, reply) {
      try {
        const decoded = await req.jwtVerify<{ sub: string; email?: string; name?: string }>();
        req.user = { id: decoded.sub, email: decoded.email ?? null, name: decoded.name ?? null };
      } catch {
        reply.code(401).send({ error: 'unauthorized' });
      }
    });
  },
  { name: 'jwt' },
);
