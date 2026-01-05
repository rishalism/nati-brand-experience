import React from 'react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CartItem } from '@/pages/Shop';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  total: number;
}

const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  total,
}) => {
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-border z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-heading text-xl text-foreground tracking-wider flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            YOUR CART
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-foreground" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Your cart is empty</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 bg-secondary/50 rounded-lg p-4"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div className="flex-1">
                  <h3 className="font-heading text-foreground tracking-wider">
                    {item.name}
                  </h3>
                  <p className="text-primary font-heading">
                    ${item.price.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="p-1 hover:bg-muted rounded transition-colors"
                    >
                      <Minus className="h-4 w-4 text-foreground" />
                    </button>
                    <span className="text-foreground font-body w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
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

        {/* Footer */}
        {items.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-border bg-card">
            <div className="flex justify-between items-center mb-4">
              <span className="text-foreground font-body">Total</span>
              <span className="font-heading text-2xl text-primary">
                ${total.toFixed(2)}
              </span>
            </div>
            <Button variant="hero" className="w-full" size="lg">
              CHECKOUT
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
