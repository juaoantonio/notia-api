import { z } from 'zod';

export const sortDirEnum = z.enum(['asc', 'desc']);
export type SortDir = z.infer<typeof sortDirEnum>;

type EmptyShape = Record<never, never>;

type NoOverlap<ES extends z.ZodRawShape, BS extends z.ZodRawShape> = Omit<ES, keyof BS>;

export type CreateFiltersSchemaOptions<
  OrderField extends string,
  ExtraShape extends z.ZodRawShape = EmptyShape,
> = {
  orderFields: readonly OrderField[];
  primaryOrderField?: OrderField;
  primaryOrderDir?: SortDir;
  extraShape?: ExtraShape;
  defaultLimit?: number;
  maxLimit?: number;
};

export function createFiltersSchema<
  OrderField extends string,
  ExtraShape extends z.ZodRawShape = EmptyShape,
>(opts: CreateFiltersSchemaOptions<OrderField, ExtraShape>) {
  const {
    orderFields,
    primaryOrderField,
    primaryOrderDir = 'desc',
    extraShape,
    defaultLimit = 20,
    maxLimit = 100,
  } = opts;

  const OrderFieldEnum = z.enum(orderFields as [OrderField, ...OrderField[]]);

  // 1) Defina o SHAPE base (sem schema ainda)
  const baseShape = {
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(maxLimit).default(defaultLimit),
    orderBy: OrderFieldEnum.optional(),
    orderDirection: sortDirEnum.default('desc'),
  } satisfies z.ZodRawShape;

  type BaseShape = typeof baseShape;

  // 2) Monte o SHAPE final, impedindo sobreposição de chaves do base
  type CleanExtra = NoOverlap<ExtraShape, BaseShape>;
  const finalShape: BaseShape & CleanExtra = {
    ...baseShape,
    ...(extraShape ?? ({} as CleanExtra)),
  };

  // 3) Construa os schemas a partir dos SHAPES
  const _baseSchema = z.object(baseShape);
  const schema = z.object(finalShape);

  type BaseFilters = z.infer<typeof _baseSchema>;

  /** Sempre começa com o campo primário; depois aplica o secundário, se houver */
  function buildOrderBy<T extends BaseFilters>(filters: T) {
    const order: Array<Record<string, SortDir>> = [];
    if (primaryOrderField) order.push({ [primaryOrderField]: primaryOrderDir });
    if (filters.orderBy && filters.orderBy !== primaryOrderField) {
      order.push({ [filters.orderBy]: filters.orderDirection });
    }
    return order;
  }

  /** Paginação baseada em page/limit (presentes via default) */
  function buildPagination<T extends BaseFilters>(filters: T) {
    const { page, limit } = filters;
    return { skip: (page - 1) * limit, take: limit };
  }

  return { schema, buildOrderBy, buildPagination };
}
