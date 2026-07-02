/**
 * Canonical API envelope. Every backend response conforms to this shape via a
 * global response interceptor + exception filter, and the frontend api-client
 * unwraps it. Keeping it here makes it the single contract both sides share.
 */

export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  pagination?: PaginationMeta;
  meta?: Record<string, unknown>;
  errors?: ApiErrorDetail[];
}

export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
}
