import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CheckoutInput } from '@nati/shared';

type CheckoutMethod = 'RAZORPAY' | 'COD';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/services/api-client';
import { useCart } from '@/features/cart/cart.hooks';
import { useAddresses } from '@/features/addresses/addresses.hooks';
import { useCheckout, useVerifyRazorpay } from '@/features/orders/orders.hooks';
import { loadRazorpay, openRazorpay } from '@/features/orders/razorpay';

const FREE_SHIPPING_THRESHOLD = 50;
const FLAT_SHIPPING = 5;
const NEW = '__new__';

interface AddressForm {
  recipientName: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}
const emptyAddress: AddressForm = {
  recipientName: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  phone: '',
};

const Checkout = () => {
  const navigate = useNavigate();
  const { data: cart } = useCart();
  const { data: addresses } = useAddresses();
  const checkout = useCheckout();
  const verify = useVerifyRazorpay();

  const [selectedAddress, setSelectedAddress] = useState<string>(NEW);
  const [form, setForm] = useState<AddressForm>(emptyAddress);
  const [method, setMethod] = useState<CheckoutMethod>('COD');

  const set = <K extends keyof AddressForm>(k: K, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const subtotal = cart?.subtotal ?? 0;
  const discount = cart?.discount ?? 0;
  const shipping = useMemo(
    () => (subtotal - discount >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING),
    [subtotal, discount],
  );
  const total = Math.max(0, subtotal - discount + shipping);
  const empty = !cart || cart.items.length === 0;

  const buildInput = (): CheckoutInput | null => {
    if (selectedAddress !== NEW) {
      return { addressId: selectedAddress, paymentMethod: method };
    }
    if (!form.recipientName || !form.line1 || !form.city || !form.state || !form.postalCode || !form.country) {
      toast({ title: 'Address incomplete', description: 'Fill in the required address fields.', variant: 'destructive' });
      return null;
    }
    return {
      shippingAddress: {
        recipientName: form.recipientName,
        line1: form.line1,
        line2: form.line2 || undefined,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
        country: form.country,
        phone: form.phone || undefined,
      },
      paymentMethod: method,
    };
  };

  const placeOrder = async () => {
    const input = buildInput();
    if (!input) return;
    try {
      const result = await checkout.mutateAsync(input);
      if (!result.razorpay) {
        toast({ title: 'Order placed', description: result.order.orderNumber });
        navigate(`/orders/${result.order.id}`);
        return;
      }
      // Razorpay: open the checkout modal.
      const ok = await loadRazorpay();
      if (!ok) {
        toast({ title: 'Could not load payment', variant: 'destructive' });
        return;
      }
      openRazorpay({
        key: result.razorpay.keyId,
        amount: result.razorpay.amount,
        currency: result.razorpay.currency,
        name: 'NATI',
        description: `Order ${result.order.orderNumber}`,
        order_id: result.razorpay.razorpayOrderId,
        theme: { color: '#000000' },
        handler: (res) => {
          verify.mutate(
            {
              orderId: result.order.id,
              razorpayOrderId: res.razorpay_order_id,
              razorpayPaymentId: res.razorpay_payment_id,
              razorpaySignature: res.razorpay_signature,
            },
            {
              onSuccess: () => {
                toast({ title: 'Payment successful' });
                navigate(`/orders/${result.order.id}`);
              },
              onError: (error) =>
                toast({ title: 'Verification failed', description: getErrorMessage(error), variant: 'destructive' }),
            },
          );
        },
        modal: { ondismiss: () => toast({ title: 'Payment cancelled' }) },
      });
    } catch (error) {
      toast({ title: 'Checkout failed', description: getErrorMessage(error), variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header cartCount={cart?.itemCount ?? 0} />
      <main className="pt-24 pb-20">
        <section className="container py-12 max-w-5xl">
          <h1 className="font-heading text-4xl tracking-wider text-foreground mb-10">CHECKOUT</h1>

          {empty ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-6">Your cart is empty.</p>
              <Button variant="hero" onClick={() => navigate('/shop')}>
                Back to shop
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Address + payment */}
              <div className="lg:col-span-2 space-y-8">
                <div className="space-y-4">
                  <h2 className="font-heading text-xl tracking-wider">SHIPPING ADDRESS</h2>
                  <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress} className="space-y-2">
                    {addresses?.map((a) => (
                      <label
                        key={a.id}
                        className="flex items-start gap-3 border border-border rounded-lg p-4 cursor-pointer"
                      >
                        <RadioGroupItem value={a.id} className="mt-1" />
                        <div className="text-sm">
                          <p className="font-medium">{a.recipientName} — {a.label}</p>
                          <p className="text-muted-foreground">
                            {a.line1}, {a.city}, {a.state} {a.postalCode}, {a.country}
                          </p>
                        </div>
                      </label>
                    ))}
                    <label className="flex items-center gap-3 border border-border rounded-lg p-4 cursor-pointer">
                      <RadioGroupItem value={NEW} />
                      <span className="text-sm font-medium">Use a new address</span>
                    </label>
                  </RadioGroup>

                  {selectedAddress === NEW && (
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="col-span-2 space-y-1">
                        <Label>Recipient name</Label>
                        <Input value={form.recipientName} onChange={(e) => set('recipientName', e.target.value)} />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label>Address line 1</Label>
                        <Input value={form.line1} onChange={(e) => set('line1', e.target.value)} />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label>Address line 2 (optional)</Label>
                        <Input value={form.line2} onChange={(e) => set('line2', e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label>City</Label>
                        <Input value={form.city} onChange={(e) => set('city', e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label>State</Label>
                        <Input value={form.state} onChange={(e) => set('state', e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label>Postal code</Label>
                        <Input value={form.postalCode} onChange={(e) => set('postalCode', e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label>Country</Label>
                        <Input value={form.country} onChange={(e) => set('country', e.target.value)} />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label>Phone (optional)</Label>
                        <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h2 className="font-heading text-xl tracking-wider">PAYMENT</h2>
                  <RadioGroup value={method} onValueChange={(v) => setMethod(v as CheckoutMethod)} className="space-y-2">
                    <label className="flex items-center gap-3 border border-border rounded-lg p-4 cursor-pointer">
                      <RadioGroupItem value="RAZORPAY" />
                      <span className="text-sm font-medium">Pay online (Razorpay)</span>
                    </label>
                    <label className="flex items-center gap-3 border border-border rounded-lg p-4 cursor-pointer">
                      <RadioGroupItem value="COD" />
                      <span className="text-sm font-medium">Cash on delivery</span>
                    </label>
                  </RadioGroup>
                </div>
              </div>

              {/* Summary */}
              <div className="border border-border rounded-lg p-6 h-fit space-y-4">
                <h2 className="font-heading text-xl tracking-wider">ORDER SUMMARY</h2>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {cart?.items.map((i) => (
                    <div key={i.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {i.name} × {i.quantity}
                      </span>
                      <span>${i.lineTotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-1 text-sm border-t border-border pt-3">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-primary">
                      <span>Discount</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-border">
                    <span className="font-body">Total</span>
                    <span className="font-heading text-2xl text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={checkout.isPending}
                  onClick={placeOrder}
                >
                  {checkout.isPending ? 'PLACING…' : method === 'COD' ? 'PLACE ORDER' : 'PAY NOW'}
                </Button>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
