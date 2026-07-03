import type { ApiResponse, PaginatedData, PublicUser, UserStatus } from "@nati/shared";
import { apiClient, unwrap, unwrapPage } from "@/services/api-client";

/** Admin users API. List is gated by USER_READ (ADMIN + SUPER_ADMIN); status
 * change needs USER_WRITE and delete needs USER_DELETE (both SUPER_ADMIN only),
 * so the UI hides those actions when the current user lacks the permission. */
export const usersApi = {
  list: (page: number, limit = 20, search?: string) =>
    unwrapPage<PublicUser>(
      apiClient.get<ApiResponse<PublicUser[]>>("/users", {
        params: { page, limit, ...(search ? { search } : {}) },
      }),
    ),
  get: (id: string) =>
    unwrap<PublicUser>(apiClient.get<ApiResponse<PublicUser>>(`/users/${id}`)),
  updateStatus: (id: string, status: UserStatus) =>
    unwrap<PublicUser>(
      apiClient.patch<ApiResponse<PublicUser>>(`/users/${id}/status`, { status }),
    ),
  remove: (id: string) =>
    unwrap<null>(apiClient.delete<ApiResponse<null>>(`/users/${id}`)),
};

export type UsersPage = PaginatedData<PublicUser>;
