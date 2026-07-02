import { useState } from 'react';
import { ORDER_STATUS, type OrderStatus } from '@nati/shared';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/services/api-client';
import { useAdminOrders, useUpdateOrderStatus } from '@/features/orders/orders.hooks';

const STATUSES = Object.values(ORDER_STATUS);

const AdminOrders = () => {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<string>('all');
  const { data, isLoading } = useAdminOrders(page, filter === 'all' ? undefined : (filter as OrderStatus));
  const updateStatus = useUpdateOrderStatus();

  const orders = data?.items ?? [];
  const pagination = data?.pagination;

  const changeStatus = (id: string, status: OrderStatus) => {
    updateStatus.mutate(
      { id, status },
      {
        onSuccess: () => toast({ title: 'Status updated' }),
        onError: (error) =>
          toast({ title: 'Update failed', description: getErrorMessage(error), variant: 'destructive' }),
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl tracking-wider text-foreground">Orders</h1>
          <p className="text-muted-foreground">Manage and fulfill orders.</p>
        </div>
        <Select
          value={filter}
          onValueChange={(v) => {
            setFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No orders.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.orderNumber}</TableCell>
                  <TableCell>{new Date(o.placedAt).toLocaleDateString()}</TableCell>
                  <TableCell>{o.itemCount}</TableCell>
                  <TableCell>${o.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Select value={o.status} onValueChange={(v) => changeStatus(o.id, v as OrderStatus)}>
                      <SelectTrigger className="w-40">
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
          <Button variant="outline" size="sm" disabled={!pagination.hasPrevPage} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled={!pagination.hasNextPage} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
