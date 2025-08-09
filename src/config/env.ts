import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import { z } from 'zod';

console.log(process.env.NODE_ENV);

const envDir = 'envs';
const currentEnv = process.env.NODE_ENV;
const envFiles = [`${envDir}/.env`];
if (currentEnv === 'production') {
  envFiles.push(`${envDir}/.env.production`);
}

if (currentEnv === 'development') {
  envFiles.push(`${envDir}/.env.development`);
}

if (currentEnv === 'test') {
  envFiles.push(`${envDir}/.env.test`);
}

console.log(`Loading environment variables from: ${envFiles.join(', ')}`);
dotenvExpand.expand(
  dotenv.config({
    path: envFiles,
  }),
);

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number().int().positive(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  DB_SCHEMA: z.string().default('public'),
  DB_SSL: z.coerce.boolean().default(false),
  DATABASE_URL: z.url(),
});

export const env = envSchema.parse(process.env);

export const db = {
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  name: env.DB_NAME,
  schema: env.DB_SCHEMA,
  ssl: env.DB_SSL,
  url: env.DATABASE_URL,
} as const;
