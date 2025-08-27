import { createFiltersSchema } from '@/shared/filters';
import { z } from 'zod';
import { strictBoolean } from '@/shared/schemas';

const { schema, buildOrderBy, buildPagination } = createFiltersSchema({
  orderFields: ['updatedAt', 'name', 'description', 'isPublic', 'isFavorite'],
  primaryOrderField: 'updatedAt',
  primaryOrderDir: 'desc',
  extraShape: {
    name: z.string().min(1).optional(),
    isPublic: strictBoolean.optional(),
    isFavorite: strictBoolean.optional(),
  },
  defaultLimit: 10,
  maxLimit: 100,
});

const createFolderSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(255).optional(),
  isPublic: z.boolean().optional().default(false),
});

export const schemas = {
  getPaginatedFoldersSchema: {
    schema,
    buildOrderBy,
    buildPagination,
  },
  createFolderSchema,
};
