import { createFiltersSchema } from '@/shared/filters';
import { z } from 'zod';

const { schema, buildOrderBy, buildPagination } = createFiltersSchema({
  orderFields: ['updatedAt', 'name', 'description', 'isPublic', 'isFavorite'],
  primaryOrderField: 'updatedAt',
  primaryOrderDir: 'desc',
  extraShape: {
    name: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    isPublic: z.coerce.boolean().optional(),
    isFavorite: z.coerce.boolean().optional(),
  },
  defaultLimit: 10,
  maxLimit: 100,
});

export const schemas = {
  getPaginatedFoldersSchema: {
    schema,
    buildOrderBy,
    buildPagination,
  },
};
