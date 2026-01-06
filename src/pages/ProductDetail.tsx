import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Star, Plus, Minus, Check } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import productImage from '@/assets/product-sachet-single.jpg';

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

const products = {
  single: {
    id: 'single',
    name: 'NATI Single Pack',
    description: 'Perfect for trying out. 10 sachets of pure electrolyte power.',
    fullDescription: 'Experience the power of NATI with our starter pack. Each sachet is precisely formulated with 6 essential electrolytes to keep you hydrated and performing at your peak. Zero sugar, zero artificial colors, and zero compromise on quality.',
    price: 29.99,
    originalPrice: 39.99,
    sachets: 10,
    badge: undefined as string | undefined,
    isSubscription: false,
    subscriptionText: undefined as string | undefined,
  },
  bundle: {
    id: 'bundle',
    name: 'NATI Bundle',
    description: 'Best value. 30 sachets for the committed athlete.',
    fullDescription: 'The athlete\'s choice. Stock up with our bundle pack and never run out of hydration. Perfect for training cycles, competition season, or keeping at home and the gym. Each sachet delivers the same premium formula trusted by professionals.',
    price: 69.99,
    originalPrice: 99.99,
    sachets: 30,
    badge: 'MOST POPULAR',
    isSubscription: false,
    subscriptionText: undefined as string | undefined,
  },
  subscription: {
    id: 'subscription',
    name: 'NATI Monthly',
    description: 'Never run out. 30 sachets delivered monthly.',
    fullDescription: 'Set it and forget it. Our monthly subscription ensures you\'re always stocked with NATI. Enjoy exclusive subscriber benefits including priority access to new flavors, free shipping, and the flexibility to pause or cancel anytime.',
    price: 59.99,
    originalPrice: undefined as number | undefined,
    sachets: 30,
    badge: undefined as string | undefined,
    isSubscription: true,
    subscriptionText: 'per month',
  },
};

const ingredients = [
  { name: 'Sodium', amount: '1000mg', benefit: 'Essential for fluid balance and nerve function' },
  { name: 'Potassium', amount: '200mg', benefit: 'Supports muscle contractions and heart health' },
  { name: 'Magnesium', amount: '60mg', benefit: 'Aids muscle recovery and energy production' },
  { name: 'Calcium', amount: '50mg', benefit: 'Vital for bone strength and muscle function' },
  { name: 'Zinc', amount: '3mg', benefit: 'Boosts immune function and recovery' },
  { name: 'Chloride', amount: '700mg', benefit: 'Maintains proper hydration levels' },
];

const reviews: Review[] = [
  {
    id: '1',
    author: 'Marcus T.',
    rating: 5,
    date: '2025-12-15',
    comment: 'Game changer for my marathon training. No more cramps, just pure performance. The taste is clean and not overly sweet like other brands.',
    verified: true,
  },
  {
    id: '2',
    author: 'Sarah K.',
    rating: 5,
    date: '2025-12-10',
    comment: 'Finally an electrolyte that doesn\'t taste like chemicals. I use it every morning and after every workout. Highly recommend!',
    verified: true,
  },
  {
    id: '3',
    author: 'James R.',
    rating: 4,
    date: '2025-12-05',
    comment: 'Great product, exactly what I needed for hot weather training. Would love to see more flavor options in the future.',
    verified: true,
  },
  {
    id: '4',
    author: 'Emily L.',
    rating: 5,
    date: '2025-11-28',
    comment: 'As a nurse working 12-hour shifts, staying hydrated is crucial. NATI keeps me energized without the sugar crash. Love it!',
    verified: true,
  },
];

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  // Check authentication
  useEffect(() => {
    const isAuth = sessionStorage.getItem('nati-auth');
    if (!isAuth) {
      navigate('/login');
    }
  }, [navigate]);

  const product = productId ? products[productId as keyof typeof products] : null;

  if (!product) {
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

  const handleAddToCart = () => {
    toast({
      title: 'Added to Cart',
      description: `${quantity}x ${product.name} has been added to your cart.`,
    });
  };

  const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-20">
        {/* Back Link */}
        <div className="container py-4">
          <Link 
            to="/shop" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="font-body text-sm">Back to Shop</span>
          </Link>
        </div>

        {/* Product Hero */}
        <section className="container py-8 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Product Image */}
            <div className="relative">
              {product.badge && (
                <div className="absolute top-4 left-4 z-10 bg-primary text-primary-foreground px-4 py-2 text-sm font-heading tracking-wider">
                  {product.badge}
                </div>
              )}
              <div className="aspect-square bg-card rounded-lg overflow-hidden border border-border">
                <img
                  src={productImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Thumbnails */}
              <div className="flex gap-4 mt-4">
                {[1, 2, 3].map((i) => (
                  <div 
                    key={i}
                    className={`w-20 h-20 bg-card rounded border cursor-pointer transition-all ${
                      i === 1 ? 'border-primary' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <img
                      src={productImage}
                      alt={`${product.name} view ${i}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-8">
              <div>
                <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-foreground tracking-wider mb-4">
                  {product.name}
                </h1>
                <p className="text-muted-foreground font-body text-lg leading-relaxed">
                  {product.fullDescription}
                </p>
              </div>

              {/* Rating */}
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

              {/* Pricing */}
              <div className="flex items-baseline gap-4">
                <span className="font-heading text-4xl text-primary">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-muted-foreground text-xl line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
                {product.isSubscription && product.subscriptionText && (
                  <span className="text-muted-foreground text-lg">
                    {product.subscriptionText}
                  </span>
                )}
              </div>

              {/* Key Benefits */}
              <div className="space-y-3">
                {[
                  `${product.sachets} premium sachets`,
                  '6 essential electrolytes',
                  'Zero sugar, zero artificial colors',
                  'Lab tested for purity',
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Check size={18} className="text-primary" />
                    <span className="text-foreground font-body">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-4 hover:bg-muted/50 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="px-6 font-heading text-xl">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-4 hover:bg-muted/50 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <Button
                  onClick={handleAddToCart}
                  variant="hero"
                  size="lg"
                  className="flex-1"
                >
                  {product.isSubscription ? 'SUBSCRIBE NOW' : 'ADD TO CART'}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Ingredients Section */}
        <section className="container py-16 border-t border-border">
          <h2 className="font-heading text-3xl md:text-4xl text-foreground tracking-wider mb-8">
            WHAT'S <span className="text-primary">INSIDE</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ingredients.map((ingredient, idx) => (
              <div 
                key={idx}
                className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="font-heading text-xl text-foreground tracking-wider">
                    {ingredient.name}
                  </h3>
                  <span className="font-heading text-primary text-lg">
                    {ingredient.amount}
                  </span>
                </div>
                <p className="text-muted-foreground font-body text-sm">
                  {ingredient.benefit}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Reviews Section */}
        <section className="container py-16 border-t border-border">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-3xl md:text-4xl text-foreground tracking-wider">
              CUSTOMER <span className="text-primary">REVIEWS</span>
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={20}
                    className={star <= Math.round(averageRating) ? 'fill-primary text-primary' : 'text-muted-foreground'}
                  />
                ))}
              </div>
              <span className="font-heading text-xl text-foreground">
                {averageRating.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review) => (
              <div 
                key={review.id}
                className="bg-card border border-border rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading text-lg text-foreground">
                        {review.author}
                      </span>
                      {review.verified && (
                        <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded font-body">
                          Verified
                        </span>
                      )}
                    </div>
                    <span className="text-muted-foreground text-sm font-body">
                      {new Date(review.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={star <= review.rating ? 'fill-primary text-primary' : 'text-muted-foreground'}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-foreground font-body leading-relaxed">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
