import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserStatus } from "@nati/shared";
import { usersApi } from "./users.api";

export const useAdminUsers = (page: number, search?: string) =>
  useQuery({
    queryKey: ["admin-users", page, search ?? ""],
    queryFn: () => usersApi.list(page, 20, search),
  });

export const useUpdateUserStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
      usersApi.updateStatus(id, status),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });
};
