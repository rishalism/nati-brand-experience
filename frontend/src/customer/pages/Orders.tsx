import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/features/cart/cart.hooks';
import { useOrders } from '@/features/orders/orders.hooks';

const Orders = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useOrders(page);
  const { data: cart } = useCart();

  const orders = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen bg-background">
      <Header cartCount={cart?.itemCount ?? 0} />
      <main className="pt-24 pb-20">
        <section className="container py-12 max-w-3xl">
          <h1 className="font-heading text-4xl tracking-wider text-foreground mb-10">YOUR ORDERS</h1>

          {isLoading && (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          )}

          {!isLoading && orders.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-6">No orders yet.</p>
              <Link to="/shop">
                <Button variant="hero">Start shopping</Button>
              </Link>
            </div>
          )}

          <div className="space-y-4">
            {orders.map((o) => (
              <Link
                key={o.id}
                to={`/orders/${o.id}`}
                className="flex items-center justify-between border border-border rounded-lg p-5 hover:border-primary/50 transition-colors"
              >
                <div>
                  <p className="font-heading tracking-wider text-foreground">{o.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(o.placedAt).toLocaleDateString()} · {o.itemCount} item(s)
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <Badge>{o.status}</Badge>
                  <p className="font-heading text-primary">${o.total.toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-4 mt-10">
              <Button variant="outline" disabled={!pagination.hasPrevPage} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground self-center">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button variant="outline" disabled={!pagination.hasNextPage} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Orders;
