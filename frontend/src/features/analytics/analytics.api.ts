import type { ApiResponse, DashboardStats } from "@nati/shared";
import { apiClient, unwrap } from "@/services/api-client";

export const analyticsApi = {
  dashboard: (days: number) =>
    unwrap<DashboardStats>(
      apiClient.get<ApiResponse<DashboardStats>>("/analytics/dashboard", { params: { days } }),
    ),
};
