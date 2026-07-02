import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/features/cart/cart.hooks';
import { useOrder } from '@/features/orders/orders.hooks';

const OrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: order, isLoading, isError } = useOrder(orderId);
  const { data: cart } = useCart();

  return (
    <div className="min-h-screen bg-background">
      <Header cartCount={cart?.itemCount ?? 0} />
      <main className="pt-24 pb-20">
        <section className="container py-12 max-w-3xl">
          <Link to="/orders" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8">
            <ArrowLeft size={18} /> <span className="text-sm">Back to orders</span>
          </Link>

          {isLoading && <Skeleton className="h-96 rounded-lg" />}
          {isError && <p className="text-destructive">Order not found.</p>}

          {order && (
            <div className="space-y-8">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <CheckCircle2 className="h-6 w-6" />
                    <span className="font-heading tracking-wider">ORDER CONFIRMED</span>
                  </div>
                  <h1 className="font-heading text-3xl tracking-wider text-foreground">{order.orderNumber}</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Placed {new Date(order.placedAt).toLocaleString()}
                  </p>
                </div>
                <Badge className="text-sm">{order.status}</Badge>
              </div>

              <div className="border border-border rounded-lg divide-y divide-border">
                {order.items.map((i) => (
                  <div key={i.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium text-foreground">{i.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ${i.unitPrice.toFixed(2)} × {i.quantity}
                      </p>
                    </div>
                    <p className="font-heading text-foreground">${i.lineTotal.toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="border border-border rounded-lg p-5 text-sm space-y-1">
                  <h3 className="font-heading tracking-wider mb-2">SHIPPING TO</h3>
                  <p className="text-foreground">{order.address.recipientName}</p>
                  <p className="text-muted-foreground">{order.address.line1}</p>
                  {order.address.line2 && <p className="text-muted-foreground">{order.address.line2}</p>}
                  <p className="text-muted-foreground">
                    {order.address.city}, {order.address.state} {order.address.postalCode}
                  </p>
                  <p className="text-muted-foreground">{order.address.country}</p>
                </div>

                <div className="border border-border rounded-lg p-5 text-sm space-y-1">
                  <h3 className="font-heading tracking-wider mb-2">SUMMARY</h3>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span> <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-primary">
                      <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                      <span>-${order.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>{order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border font-heading text-primary text-lg">
                    <span>Total</span> <span>${order.total.toFixed(2)}</span>
                  </div>
                  {order.payment && (
                    <p className="text-muted-foreground pt-2">
                      Payment: {order.payment.provider} · {order.payment.status}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default OrderDetail;
