import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import { z } from 'zod';

const envDir = 'envs';
const currentEnv = process.env.NODE_ENV;
const envFiles = [`${envDir}/.env`, currentEnv ? `${envDir}/.env.${currentEnv}` : ''].filter(
  Boolean,
);

console.log(`Loading environment variables from: ${envFiles.join(', ')}`);
dotenvExpand.expand(
  dotenv.config({
    path: envFiles,
  }),
);

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().default('0.0.0.0'),
  POSTGRES_HOST: z.string(),
  POSTGRES_PORT: z.coerce.number().int().positive().default(5432),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),
  POSTGRES_SCHEMA: z.string().default('public'),
  POSTGRES_SSL: z.coerce.boolean().default(false),
  DATABASE_URL: z.url(),
  FRONTEND_URL: z.url().default('http://localhost:8000'),
  CORS_ORIGIN: z
    .string()
    .default('["http://localhost:4000"]')
    .transform((val) => {
      try {
        return JSON.parse(val) as string[];
      } catch (_) {
        console.error('Invalid CORS_ORIGIN format, expected JSON array:', val);
        throw new Error('Invalid CORS_ORIGIN format');
      }
    }),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CALLBACK_URL: z.url(),
  COOKIE_SECRET: z.string().default('dev-secret'),
  JWT_SECRET: z.string().default('dev-jwt-secret'),
  JWT_EXPIRES_IN: z.string().default('1h'),
});

export const env = envSchema.parse(process.env);

export const db = {
  host: env.POSTGRES_DB,
  port: env.POSTGRES_DB,
  user: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  name: env.POSTGRES_DB,
  schema: env.POSTGRES_SCHEMA,
  ssl: env.POSTGRES_SSL,
  url: env.DATABASE_URL,
} as const;
