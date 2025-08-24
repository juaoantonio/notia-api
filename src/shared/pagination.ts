export type PageMeta = {
  page: number;
  limit: number;
  count: number;
  total: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
  prevPage: number | null;
  nextPage: number | null;
};

export type PageResult<T> = {
  data: T[];
  meta: PageMeta;
};

/**
 * Monta a estrutura de paginação a partir de itens, total, page e limit.
 */
export function makePage<T>(items: T[], total: number, page: number, limit: number): PageResult<T> {
  const safeLimit = Math.max(1, limit | 0);
  const safePage = Math.max(1, page | 0);

  const totalPages = Math.max(1, Math.ceil(total / safeLimit));
  const clampedPage = Math.min(safePage, totalPages);

  const meta: PageMeta = {
    page: clampedPage,
    limit: safeLimit,
    count: items.length,
    total,
    totalPages,
    hasPrev: clampedPage > 1,
    hasNext: clampedPage < totalPages,
    prevPage: clampedPage > 1 ? clampedPage - 1 : null,
    nextPage: clampedPage < totalPages ? clampedPage + 1 : null,
  };

  return { data: items, meta };
}

/**
 * Versão assíncrona: útil quando você quer calcular o total sob demanda
 * (ex.: chamando `prisma.model.count({ where })`).
 */
export async function makePageAsync<T>(
  items: T[],
  getTotal: () => Promise<number>,
  page: number,
  limit: number,
): Promise<PageResult<T>> {
  const total = await getTotal();
  return makePage(items, total, page, limit);
}
