import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { create } from "zustand";
import type { CartView } from "@nati/shared";
import { useAuthStore } from "@/features/auth/auth.store";
import { cartApi } from "./cart.api";

const CART_KEY = ["cart"] as const;

/** Drawer open/close state (UI only; data lives in the query). */
interface CartUiState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  setOpen: (open: boolean) => void;
}
export const useCartUi = create<CartUiState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setOpen: (isOpen) => set({ isOpen }),
}));

/** Server cart. Only fetched once authenticated (cart is a protected resource). */
export const useCart = () => {
  const authed = useAuthStore((s) => s.status === "authenticated");
  return useQuery({ queryKey: CART_KEY, queryFn: cartApi.get, enabled: authed });
};

function useCartMutation<TArgs>(fn: (args: TArgs) => Promise<CartView>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (data) => qc.setQueryData(CART_KEY, data),
  });
}

export const useAddToCart = () =>
  useCartMutation(({ productId, quantity }: { productId: string; quantity?: number }) =>
    cartApi.addItem(productId, quantity),
  );

export const useUpdateCartItem = () =>
  useCartMutation(({ productId, quantity }: { productId: string; quantity: number }) =>
    cartApi.updateItem(productId, quantity),
  );

export const useRemoveCartItem = () =>
  useCartMutation((productId: string) => cartApi.removeItem(productId));

export const useClearCart = () => useCartMutation<void>(() => cartApi.clear());

export const useApplyCoupon = () => useCartMutation((code: string) => cartApi.applyCoupon(code));

export const useRemoveCoupon = () => useCartMutation<void>(() => cartApi.removeCoupon());
