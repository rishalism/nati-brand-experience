import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Minus, Plus, ShoppingBag, Trash2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/services/api-client';
import {
  useApplyCoupon,
  useCart,
  useCartUi,
  useRemoveCartItem,
  useRemoveCoupon,
  useUpdateCartItem,
} from '@/features/cart/cart.hooks';

/** Self-contained cart drawer backed by the server cart. */
const CartDrawer = () => {
  const navigate = useNavigate();
  const { isOpen, close } = useCartUi();
  const { data: cart } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const applyCoupon = useApplyCoupon();
  const removeCoupon = useRemoveCoupon();
  const [code, setCode] = useState('');

  const items = cart?.items ?? [];

  const onApplyCoupon = async () => {
    if (!code.trim()) return;
    try {
      await applyCoupon.mutateAsync(code.trim());
      toast({ title: 'Coupon applied' });
      setCode('');
    } catch (error) {
      toast({ title: 'Invalid coupon', description: getErrorMessage(error), variant: 'destructive' });
    }
  };

  const changeQty = (productId: string, quantity: number) => {
    updateItem.mutate(
      { productId, quantity },
      {
        onError: (error) =>
          toast({ title: 'Could not update', description: getErrorMessage(error), variant: 'destructive' }),
      },
    );
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={close}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-border z-50 flex flex-col transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-heading text-xl text-foreground tracking-wider flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            YOUR CART
          </h2>
          <button onClick={close} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="h-5 w-5 text-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Your cart is empty</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 bg-secondary/50 rounded-lg p-4">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
                ) : (
                  <div className="w-20 h-20 rounded-md bg-muted flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="font-heading text-foreground tracking-wider">{item.name}</h3>
                    <button
                      onClick={() => removeItem.mutate(item.productId)}
                      className="p-1 text-muted-foreground hover:text-destructive"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-primary font-heading">${item.price.toFixed(2)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => changeQty(item.productId, item.quantity - 1)}
                      className="p-1 hover:bg-muted rounded transition-colors"
                    >
                      <Minus className="h-4 w-4 text-foreground" />
                    </button>
                    <span className="text-foreground font-body w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => changeQty(item.productId, item.quantity + 1)}
                      className="p-1 hover:bg-muted rounded transition-colors"
                    >
                      <Plus className="h-4 w-4 text-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && cart && (
          <div className="p-6 border-t border-border bg-card space-y-4">
            {/* Coupon */}
            {cart.coupon ? (
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-primary">
                  <Tag className="h-4 w-4" /> {cart.coupon.code}
                </span>
                <button
                  onClick={() => removeCoupon.mutate()}
                  className="text-muted-foreground hover:text-destructive"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Coupon code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="h-10"
                />
                <Button variant="outline" onClick={onApplyCoupon} disabled={applyCoupon.isPending}>
                  Apply
                </Button>
              </div>
            )}

            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${cart.subtotal.toFixed(2)}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-primary">
                  <span>Discount</span>
                  <span>-${cart.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="text-foreground font-body">Total</span>
                <span className="font-heading text-2xl text-primary">${cart.total.toFixed(2)}</span>
              </div>
            </div>

            <Button
              variant="hero"
              className="w-full"
              size="lg"
              onClick={() => {
                close();
                navigate('/checkout');
              }}
            >
              CHECKOUT
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
