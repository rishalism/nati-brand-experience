import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse, Coupon, CreateCouponInput } from "@nati/shared";
import { apiClient, unwrap } from "@/services/api-client";

const COUPONS_KEY = ["coupons"] as const;

const couponsApi = {
  list: () => unwrap<Coupon[]>(apiClient.get<ApiResponse<Coupon[]>>("/coupons")),
  create: (input: CreateCouponInput) =>
    unwrap<Coupon>(apiClient.post<ApiResponse<Coupon>>("/coupons", input)),
  remove: (id: string) => apiClient.delete(`/coupons/${id}`).then(() => undefined),
};

export const useCoupons = () =>
  useQuery({ queryKey: COUPONS_KEY, queryFn: couponsApi.list });

export const useCreateCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCouponInput) => couponsApi.create(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: COUPONS_KEY }),
  });
};

export const useDeleteCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => couponsApi.remove(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: COUPONS_KEY }),
  });
};
