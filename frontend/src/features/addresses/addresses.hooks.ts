import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Address, ApiResponse, CreateAddressInput } from "@nati/shared";
import { apiClient, unwrap } from "@/services/api-client";

const ADDRESSES_KEY = ["addresses"] as const;

const addressesApi = {
  list: () => unwrap<Address[]>(apiClient.get<ApiResponse<Address[]>>("/addresses")),
  create: (input: CreateAddressInput) =>
    unwrap<Address>(apiClient.post<ApiResponse<Address>>("/addresses", input)),
};

export const useAddresses = () =>
  useQuery({ queryKey: ADDRESSES_KEY, queryFn: addressesApi.list });

export const useCreateAddress = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAddressInput) => addressesApi.create(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ADDRESSES_KEY }),
  });
};
