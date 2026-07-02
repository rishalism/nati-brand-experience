import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import type { ApiResponse, PaginatedData, PaginationMeta } from "@nati/shared";
import { env } from "@/config/env";
import { authStore } from "@/features/auth/auth.store";

/**
 * Central Axios instance. `withCredentials` so the HTTP-only access/refresh
 * cookies ride along with every request (no manual Authorization header).
 *
 * The response interceptor implements silent token refresh with a single-flight
 * guard: on the first 401 it calls /auth/refresh once, de-duplicating
 * concurrent refreshes, then replays the original request. The refresh endpoint
 * itself is delivered in Phase 2 — until then a 401 simply clears the session.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

const REFRESH_PATH = "/auth/refresh";

// Single-flight: concurrent 401s share one refresh call instead of stampeding.
let refreshPromise: Promise<void> | null = null;

async function refreshSession(): Promise<void> {
  refreshPromise ??= apiClient
    .post(REFRESH_PATH)
    .then(() => undefined)
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    const isRefreshCall = original?.url?.includes(REFRESH_PATH);

    if (status === 401 && original && !original._retry && !isRefreshCall) {
      original._retry = true;
      try {
        await refreshSession();
        return apiClient(original);
      } catch {
        authStore.getState().clear();
      }
    }

    return Promise.reject(error);
  },
);

/** Unwraps the standard envelope, returning `data`. Feature services build on
 * this so callers work with plain domain data, not the transport envelope. */
export async function unwrap<T>(promise: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
  const { data } = await promise;
  return data.data as T;
}

/** Unwraps a paginated envelope into { items, pagination } for list endpoints. */
export async function unwrapPage<T>(
  promise: Promise<AxiosResponse<ApiResponse<T[]>>>,
): Promise<PaginatedData<T>> {
  const { data } = await promise;
  const pagination: PaginationMeta = data.pagination ?? {
    page: 1,
    limit: (data.data ?? []).length,
    total: (data.data ?? []).length,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };
  return { items: data.data ?? [], pagination };
}

/** Extracts a human-readable message from an API/Axios error for toasts. */
export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiResponse<unknown> | undefined;
    if (data?.errors?.length) return data.errors[0].message;
    if (data?.message) return data.message;
  }
  return fallback;
}
