import { Link } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/shop/CartDrawer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/services/api-client';
import productFallback from '@/assets/product-sachet-single.jpg';
import { useAddToCart, useCart, useCartUi } from '@/features/cart/cart.hooks';
import { useRemoveWishlist, useWishlist } from '@/features/wishlist/wishlist.hooks';

const Wishlist = () => {
  const { data: items, isLoading } = useWishlist();
  const { data: cart } = useCart();
  const cartUi = useCartUi();
  const addToCart = useAddToCart();
  const removeWishlist = useRemoveWishlist();

  const handleAdd = (productId: string) => {
    addToCart.mutate(
      { productId },
      {
        onSuccess: () => {
          toast({ title: 'Added to cart' });
          cartUi.open();
        },
        onError: (error) =>
          toast({ title: 'Could not add', description: getErrorMessage(error), variant: 'destructive' }),
      },
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header cartCount={cart?.itemCount ?? 0} onCartClick={cartUi.open} />

      <main className="pt-24 pb-20">
        <section className="container py-12 md:py-16">
          <div className="flex items-center gap-3 mb-10">
            <Heart className="h-7 w-7 text-primary" />
            <h1 className="font-heading text-4xl md:text-5xl tracking-wider text-foreground">WISHLIST</h1>
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-lg" />
              ))}
            </div>
          )}

          {!isLoading && (items?.length ?? 0) === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-6">Your wishlist is empty.</p>
              <Link to="/shop">
                <Button variant="hero">Browse the drop</Button>
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items?.map((item) => (
              <div key={item.id} className="bg-card border border-border rounded-lg overflow-hidden">
                <Link to={`/product/${item.product.id}`} className="block aspect-square bg-background">
                  <img
                    src={item.product.primaryImage ?? productFallback}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </Link>
                <div className="p-5 space-y-3">
                  <Link to={`/product/${item.product.id}`}>
                    <h3 className="font-heading text-lg tracking-wider text-foreground">{item.product.name}</h3>
                  </Link>
                  <p className="font-heading text-primary text-xl">${item.product.price.toFixed(2)}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="hero"
                      className="flex-1"
                      disabled={!item.product.inStock || addToCart.isPending}
                      onClick={() => handleAdd(item.product.id)}
                    >
                      {item.product.inStock ? 'ADD TO CART' : 'SOLD OUT'}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeWishlist.mutate(item.product.id)}
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
};

export default Wishlist;
