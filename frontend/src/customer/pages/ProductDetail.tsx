import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Plus, Minus, Check, Heart } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/shop/CartDrawer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getErrorMessage } from '@/services/api-client';
import productSachetsHero from '@/assets/product-sachets-hero.jpg';
import productSachetsDetail from '@/assets/product-sachets-detail.jpg';
import productBoxes from '@/assets/product-boxes.jpg';
import { useProduct } from '@/features/catalog/catalog.hooks';
import { useAddToCart, useCart, useCartUi } from '@/features/cart/cart.hooks';
import { useToggleWishlist, useWishlistIds } from '@/features/wishlist/wishlist.hooks';

// Fallback gallery when a product has no uploaded images yet.
const FALLBACK_IMAGES = [productSachetsHero, productSachetsDetail, productBoxes];

const ingredients = [
  { name: 'Sodium', amount: '1000mg', benefit: 'Essential for fluid balance and nerve function' },
  { name: 'Potassium', amount: '200mg', benefit: 'Supports muscle contractions and heart health' },
  { name: 'Magnesium', amount: '60mg', benefit: 'Aids muscle recovery and energy production' },
  { name: 'Calcium', amount: '50mg', benefit: 'Vital for bone strength and muscle function' },
  { name: 'Zinc', amount: '3mg', benefit: 'Boosts immune function and recovery' },
  { name: 'Chloride', amount: '700mg', benefit: 'Maintains proper hydration levels' },
];

const reviews = [
  { id: '1', author: 'Marcus T.', rating: 5, date: '2025-12-15', verified: true, comment: 'Game changer for my marathon training. No more cramps, just pure performance.' },
  { id: '2', author: 'Sarah K.', rating: 5, date: '2025-12-10', verified: true, comment: "Finally an electrolyte that doesn't taste like chemicals. Highly recommend!" },
  { id: '3', author: 'James R.', rating: 4, date: '2025-12-05', verified: true, comment: 'Great product, exactly what I needed for hot weather training.' },
  { id: '4', author: 'Emily L.', rating: 5, date: '2025-11-28', verified: true, comment: 'Keeps me energized through 12-hour shifts without the sugar crash. Love it!' },
];

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const { data: product, isLoading, isError } = useProduct(productId);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { data: cart } = useCart();
  const cartUi = useCartUi();
  const addToCart = useAddToCart();
  const toggleWishlist = useToggleWishlist();
  const wishlistIds = useWishlistIds();

  const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container pt-28 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-4xl text-foreground mb-4">Product Not Found</h1>
          <Link to="/shop" className="text-primary hover:underline">
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images.length > 0 ? product.images.map((i) => i.url) : FALLBACK_IMAGES;
  const inStock = product.inventory.inStock;
  const isWishlisted = wishlistIds.has(product.id);

  const handleAddToCart = () => {
    addToCart.mutate(
      { productId: product.id, quantity },
      {
        onSuccess: () => {
          toast({ title: 'Added to cart', description: `${quantity}x ${product.name}` });
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

      <main className="pt-20 md:pt-24 pb-16 md:pb-20">
        <div className="container py-4">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="font-body text-sm">Back to Shop</span>
          </Link>
        </div>

        <section className="container py-6 md:py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-20">
            {/* Images */}
            <div className="space-y-4">
              {product.isFeatured && (
                <div className="inline-block bg-primary text-primary-foreground px-4 py-2 text-sm font-heading tracking-wider mb-2">
                  MOST POPULAR
                </div>
              )}
              <div className="aspect-square bg-card rounded-lg overflow-hidden border border-border">
                <img
                  src={images[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-all duration-500"
                />
              </div>
              <div className="flex gap-3 md:gap-4">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIndex(i)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 bg-card rounded-lg overflow-hidden border-2 cursor-pointer transition-all flex-shrink-0 ${
                      i === selectedImageIndex
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <img src={img} alt={`${product.name} view ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="space-y-6 md:space-y-8">
              <div>
                <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground tracking-wider mb-4">
                  {product.name}
                </h1>
                <p className="text-muted-foreground font-body text-base md:text-lg leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={18}
                      className={star <= Math.round(averageRating) ? 'fill-primary text-primary' : 'text-muted-foreground'}
                    />
                  ))}
                </div>
                <span className="text-muted-foreground font-body text-sm">
                  {averageRating.toFixed(1)} ({reviews.length} reviews)
                </span>
              </div>

              <div className="flex items-baseline gap-3 md:gap-4 flex-wrap">
                <span className="font-heading text-3xl md:text-4xl text-primary">
                  ${product.price.toFixed(2)}
                </span>
                {product.compareAtPrice && (
                  <span className="text-muted-foreground text-lg md:text-xl line-through">
                    ${product.compareAtPrice.toFixed(2)}
                  </span>
                )}
                <span className={`text-sm font-body ${inStock ? 'text-primary' : 'text-destructive'}`}>
                  {inStock ? 'In stock' : 'Sold out'}
                </span>
              </div>

              <div className="space-y-2 md:space-y-3">
                {['6 essential electrolytes', 'Zero sugar, zero artificial colors', 'Lab tested for purity'].map(
                  (benefit, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <Check size={18} className="text-primary flex-shrink-0" />
                      <span className="text-foreground font-body text-sm md:text-base">{benefit}</span>
                    </div>
                  ),
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex items-center border border-border rounded-lg w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 md:p-4 hover:bg-muted/50 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="px-4 md:px-6 font-heading text-lg md:text-xl min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 md:p-4 hover:bg-muted/50 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <Button onClick={handleAddToCart} variant="hero" size="lg" className="flex-1 min-h-[48px]" disabled={!inStock || addToCart.isPending}>
                  {inStock ? 'ADD TO CART' : 'SOLD OUT'}
                </Button>
                <Button
                  onClick={() => toggleWishlist.mutate(product.id)}
                  variant="outline"
                  size="lg"
                  className="min-h-[48px]"
                  aria-label="Toggle wishlist"
                >
                  <Heart className={cn('h-5 w-5', isWishlisted ? 'fill-primary text-primary' : '')} />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Ingredients */}
        <section className="container py-12 md:py-16 border-t border-border">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl text-foreground tracking-wider mb-6 md:mb-8">
            WHAT'S <span className="text-primary">INSIDE</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {ingredients.map((ingredient, idx) => (
              <div key={idx} className="bg-card border border-border rounded-lg p-4 md:p-6 hover:border-primary/50 transition-colors">
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="font-heading text-lg md:text-xl text-foreground tracking-wider">{ingredient.name}</h3>
                  <span className="font-heading text-primary text-base md:text-lg">{ingredient.amount}</span>
                </div>
                <p className="text-muted-foreground font-body text-sm">{ingredient.benefit}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Reviews */}
        <section className="container py-12 md:py-16 border-t border-border">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl text-foreground tracking-wider mb-6 md:mb-8">
            CUSTOMER <span className="text-primary">REVIEWS</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-card border border-border rounded-lg p-4 md:p-6">
                <div className="flex items-start justify-between mb-3 md:mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-heading text-base md:text-lg text-foreground">{review.author}</span>
                      {review.verified && (
                        <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded font-body">Verified</span>
                      )}
                    </div>
                    <span className="text-muted-foreground text-xs md:text-sm font-body">
                      {new Date(review.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={14} className={star <= review.rating ? 'fill-primary text-primary' : 'text-muted-foreground'} />
                    ))}
                  </div>
                </div>
                <p className="text-foreground font-body text-sm md:text-base leading-relaxed">{review.comment}</p>
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

export default ProductDetail;
