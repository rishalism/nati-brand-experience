import type {
  ApiResponse,
  CheckoutInput,
  CheckoutResult,
  Invoice,
  OrderStatus,
  OrderSummary,
  OrderView,
  PaginatedData,
  VerifyRazorpayInput,
} from "@nati/shared";
import { apiClient, unwrap, unwrapPage } from "@/services/api-client";

export const ordersApi = {
  checkout: (input: CheckoutInput) =>
    unwrap<CheckoutResult>(apiClient.post<ApiResponse<CheckoutResult>>("/orders/checkout", input)),
  verifyRazorpay: (input: VerifyRazorpayInput) =>
    unwrap<OrderView>(apiClient.post<ApiResponse<OrderView>>("/orders/verify-razorpay", input)),
  list: (page: number, limit = 10) =>
    unwrapPage<OrderSummary>(
      apiClient.get<ApiResponse<OrderSummary[]>>("/orders", { params: { page, limit } }),
    ),
  get: (id: string) => unwrap<OrderView>(apiClient.get<ApiResponse<OrderView>>(`/orders/${id}`)),
  invoice: (id: string) =>
    unwrap<Invoice>(apiClient.get<ApiResponse<Invoice>>(`/orders/${id}/invoice`)),

  // admin
  listAdmin: (page: number, limit = 20, status?: OrderStatus) =>
    unwrapPage<OrderSummary>(
      apiClient.get<ApiResponse<OrderSummary[]>>("/orders/admin", {
        params: { page, limit, ...(status ? { status } : {}) },
      }),
    ),
  getAdmin: (id: string) =>
    unwrap<OrderView>(apiClient.get<ApiResponse<OrderView>>(`/orders/admin/${id}`)),
  updateStatus: (id: string, status: OrderStatus) =>
    unwrap<OrderView>(apiClient.patch<ApiResponse<OrderView>>(`/orders/${id}/status`, { status })),
};
