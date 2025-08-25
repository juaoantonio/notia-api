import { createFiltersSchema } from '@/shared/filters';
import { z } from 'zod';

const { schema, buildOrderBy, buildPagination } = createFiltersSchema({
  orderFields: ['updatedAt', 'title'],
  primaryOrderField: 'updatedAt',
  primaryOrderDir: 'desc',
  extraShape: {
    title: z.string().min(1).optional(),
    folderId: z.uuid().optional(),
  },
  defaultLimit: 5,
  maxLimit: 100,
});

export const schemas = {
  getPaginatedLinksSchema: {
    schema,
    buildOrderBy,
    buildPagination,
  },
};
