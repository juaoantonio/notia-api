import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

process.env.NODE_ENV = 'test';

dotenvExpand.expand(
  dotenv.config({
    path: ['envs/.env', 'envs/.env.test'],
  }),
);

// Silenciar logs de pino/fastify em e2e para saída mais limpa (opcional)
const mute = process.env.VITEST_SILENCE_LOGS !== 'false';
if (mute) {
  const orig = console.error;
  console.error = (...args) => {
    // deixe passar erros de asserção, silencie resto
    const msg = args?.[0]?.toString?.() ?? '';
    if (msg.includes('AssertionError')) return orig(...args);
    // noop
  };
}
