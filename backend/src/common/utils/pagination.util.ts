import type { PaginatedData, PaginationMeta } from '@nati/shared';

/** Builds the standard PaginationMeta from raw counts. */
export function buildPaginationMeta(params: {
  page: number;
  limit: number;
  total: number;
}): PaginationMeta {
  const { page, limit, total } = params;
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/** Wraps a page of items + counts into the PaginatedData shape the response
 * interceptor understands. */
export function paginate<T>(
  items: T[],
  params: { page: number; limit: number; total: number },
): PaginatedData<T> {
  return { items, pagination: buildPaginationMeta(params) };
}
