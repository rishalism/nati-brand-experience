import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/shop/ProductCard';
import CartDrawer from '@/components/shop/CartDrawer';
import { toast } from '@/hooks/use-toast';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const Shop = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Check authentication
  useEffect(() => {
    const isAuth = sessionStorage.getItem('nati-auth');
    if (!isAuth) {
      navigate('/login');
    }
  }, [navigate]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    toast({
      title: 'Added to Cart',
      description: `${item.name} has been added to your cart.`,
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((i) => i.id !== id));
    } else {
      setCart((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity } : i))
      );
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header cartCount={cartCount} onCartClick={() => setIsCartOpen(true)} />

      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <section className="container py-12 md:py-20">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading text-foreground mb-4 tracking-wider">
              THE <span className="text-primary">DROP</span>
            </h1>
            <p className="text-muted-foreground font-body text-lg">
              Premium electrolyte hydration. Choose your pack.
            </p>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <ProductCard
              id="single"
              name="NATI Single Pack"
              description="Perfect for trying out. 10 sachets of pure electrolyte power."
              price={29.99}
              originalPrice={39.99}
              onAddToCart={addToCart}
            />
            <ProductCard
              id="bundle"
              name="NATI Bundle"
              description="Best value. 30 sachets for the committed athlete."
              price={69.99}
              originalPrice={99.99}
              badge="MOST POPULAR"
              onAddToCart={addToCart}
            />
            <ProductCard
              id="subscription"
              name="NATI Monthly"
              description="Never run out. 30 sachets delivered monthly."
              price={59.99}
              isSubscription
              subscriptionText="per month"
              onAddToCart={addToCart}
            />
          </div>
        </section>

        {/* Features Grid */}
        <section className="container py-12 md:py-20 border-t border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-center">
            {[
              { label: 'Free Shipping', value: 'On orders $50+' },
              { label: '30-Day Returns', value: 'No questions asked' },
              { label: 'Lab Tested', value: '100% pure formula' },
              { label: 'Secure Checkout', value: 'SSL encrypted' },
            ].map((feature, idx) => (
              <div key={idx} className="space-y-2">
                <p className="font-heading text-primary text-lg tracking-wider">{feature.label}</p>
                <p className="text-muted-foreground text-sm">{feature.value}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={updateQuantity}
        total={cartTotal}
      />
    </div>
  );
};

export default Shop;
