import type { ApiResponse, CartView } from "@nati/shared";
import { apiClient, unwrap } from "@/services/api-client";

const get = (url: string) => apiClient.get<ApiResponse<CartView>>(url);
const post = (url: string, body?: unknown) => apiClient.post<ApiResponse<CartView>>(url, body);

export const cartApi = {
  get: () => unwrap<CartView>(get("/cart")),
  addItem: (productId: string, quantity = 1) =>
    unwrap<CartView>(post("/cart/items", { productId, quantity })),
  updateItem: (productId: string, quantity: number) =>
    unwrap<CartView>(apiClient.patch<ApiResponse<CartView>>(`/cart/items/${productId}`, { quantity })),
  removeItem: (productId: string) =>
    unwrap<CartView>(apiClient.delete<ApiResponse<CartView>>(`/cart/items/${productId}`)),
  clear: () => unwrap<CartView>(apiClient.delete<ApiResponse<CartView>>("/cart")),
  applyCoupon: (code: string) => unwrap<CartView>(post("/cart/coupon", { code })),
  removeCoupon: () => unwrap<CartView>(apiClient.delete<ApiResponse<CartView>>("/cart/coupon")),
  merge: (items: { productId: string; quantity: number }[]) =>
    unwrap<CartView>(post("/cart/merge", { items })),
};
