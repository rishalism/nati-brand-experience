import { useEffect, useMemo, useState } from "react";
import { PERMISSIONS, USER_STATUS, type UserStatus } from "@nati/shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/services/api-client";
import { useAuthStore } from "@/features/auth/auth.store";
import { useAdminUsers, useUpdateUserStatus } from "@/features/users/users.hooks";

const STATUSES = Object.values(USER_STATUS);

const STATUS_VARIANT: Record<UserStatus, "default" | "secondary" | "destructive"> = {
  [USER_STATUS.ACTIVE]: "default",
  [USER_STATUS.PENDING]: "secondary",
  [USER_STATUS.SUSPENDED]: "destructive",
};

const AdminCustomers = () => {
  const [page, setPage] = useState(1);
  const [term, setTerm] = useState("");
  const [search, setSearch] = useState<string | undefined>(undefined);

  // Debounce the search box so a keystroke burst is one request, not N.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(term.trim() || undefined);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [term]);

  const { data, isLoading } = useAdminUsers(page, search);
  const updateStatus = useUpdateUserStatus();

  // Status change requires USER_WRITE (SUPER_ADMIN only); plain ADMIN gets a
  // read-only badge so the action isn't offered just to 403.
  const canWrite = useAuthStore((s) =>
    Boolean(s.user?.permissions.includes(PERMISSIONS.USER_WRITE)),
  );

  const users = useMemo(() => data?.items ?? [], [data]);
  const pagination = data?.pagination;

  const changeStatus = (id: string, status: UserStatus) => {
    updateStatus.mutate(
      { id, status },
      {
        onSuccess: () => toast({ title: "Status updated" }),
        onError: (error) =>
          toast({
            title: "Update failed",
            description: getErrorMessage(error),
            variant: "destructive",
          }),
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl tracking-wider text-foreground">Customers</h1>
          <p className="text-muted-foreground">Browse and manage registered users.</p>
        </div>
        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search name or email…"
          className="w-64"
        />
      </div>

      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No customers found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    {`${u.firstName} ${u.lastName}`.trim() || "—"}
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {u.roles.map((r) => (
                        <Badge key={r} variant="outline">
                          {r}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {u.emailVerified ? (
                      <Badge variant="secondary">Verified</Badge>
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </TableCell>
                  <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {canWrite ? (
                      <Select
                        value={u.status}
                        onValueChange={(v) => changeStatus(u.id, v as UserStatus)}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant={STATUS_VARIANT[u.status]}>{u.status}</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-end gap-3">
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasPrevPage}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasNextPage}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
