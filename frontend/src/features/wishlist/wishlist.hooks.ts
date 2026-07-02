import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse, WishlistItemView } from "@nati/shared";
import { apiClient, unwrap } from "@/services/api-client";
import { useAuthStore } from "@/features/auth/auth.store";

const WISHLIST_KEY = ["wishlist"] as const;

const wishlistApi = {
  get: () => unwrap<WishlistItemView[]>(apiClient.get<ApiResponse<WishlistItemView[]>>("/wishlist")),
  toggle: (productId: string) =>
    unwrap<WishlistItemView[]>(
      apiClient.post<ApiResponse<WishlistItemView[]>>(`/wishlist/${productId}/toggle`),
    ),
  remove: (productId: string) =>
    unwrap<WishlistItemView[]>(
      apiClient.delete<ApiResponse<WishlistItemView[]>>(`/wishlist/${productId}`),
    ),
};

export const useWishlist = () => {
  const authed = useAuthStore((s) => s.status === "authenticated");
  return useQuery({ queryKey: WISHLIST_KEY, queryFn: wishlistApi.get, enabled: authed });
};

/** Set of product ids in the wishlist, for quick membership checks in cards. */
export const useWishlistIds = (): Set<string> => {
  const { data } = useWishlist();
  return new Set((data ?? []).map((i) => i.product.id));
};

function useWishlistMutation<TArgs>(fn: (args: TArgs) => Promise<WishlistItemView[]>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (data) => qc.setQueryData(WISHLIST_KEY, data),
  });
}

export const useToggleWishlist = () => useWishlistMutation((productId: string) => wishlistApi.toggle(productId));
export const useRemoveWishlist = () => useWishlistMutation((productId: string) => wishlistApi.remove(productId));
