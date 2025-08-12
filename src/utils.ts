import type { DefineRoutesHandler, FastifyTypedInstance } from './types';

export function defineRoutes(handler: DefineRoutesHandler) {
  return (app: FastifyTypedInstance, _: Record<never, never>, done: () => void) => {
    handler(app);
    done();
  };
}
