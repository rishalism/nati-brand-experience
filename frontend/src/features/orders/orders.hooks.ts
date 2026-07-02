import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CheckoutInput, OrderStatus, VerifyRazorpayInput } from "@nati/shared";
import { ordersApi } from "./orders.api";

export const useOrders = (page: number) =>
  useQuery({ queryKey: ["orders", page], queryFn: () => ordersApi.list(page) });

export const useOrder = (id: string | undefined) =>
  useQuery({
    queryKey: ["order", id],
    queryFn: () => ordersApi.get(id as string),
    enabled: Boolean(id),
  });

export const useInvoice = (id: string | undefined) =>
  useQuery({
    queryKey: ["invoice", id],
    queryFn: () => ordersApi.invoice(id as string),
    enabled: Boolean(id),
  });

export const useCheckout = () =>
  useMutation({ mutationFn: (input: CheckoutInput) => ordersApi.checkout(input) });

export const useVerifyRazorpay = () =>
  useMutation({ mutationFn: (input: VerifyRazorpayInput) => ordersApi.verifyRazorpay(input) });

// admin
export const useAdminOrders = (page: number, status?: OrderStatus) =>
  useQuery({
    queryKey: ["admin-orders", page, status],
    queryFn: () => ordersApi.listAdmin(page, 20, status),
  });

export const useUpdateOrderStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin-orders"] }),
  });
};
