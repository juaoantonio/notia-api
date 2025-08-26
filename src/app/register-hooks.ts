import type { FastifyTypedInstance } from '@/types';

export function registerHooks(app: FastifyTypedInstance) {
  app.addHook('onRoute', ({ method, url }) => {
    if (['HEAD', 'OPTIONS'].includes(String(method))) return;
    app.log.info(`Registered route: ${String(method)} ${url}`);
  });
}
