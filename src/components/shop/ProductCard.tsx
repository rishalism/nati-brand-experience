import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import productImage from '@/assets/product-sachet-single.jpg';
import type { CartItem } from '@/pages/Shop';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  isSubscription?: boolean;
  subscriptionText?: string;
  onAddToCart: (item: Omit<CartItem, 'quantity'>) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  description,
  price,
  originalPrice,
  badge,
  isSubscription,
  subscriptionText,
  onAddToCart,
}) => {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart({
      id,
      name,
      price,
      image: productImage,
    });
  };

  return (
    <Link to={`/product/${id}`} className="block">
      <div className="group relative bg-card rounded-lg border border-border overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_40px_hsl(72_94%_46%/0.15)]">
        {badge && (
          <div className="absolute top-4 right-4 z-10 bg-primary text-primary-foreground px-3 py-1 text-xs font-heading tracking-wider">
            {badge}
          </div>
        )}

        {/* Product Image */}
        <div className="relative aspect-square bg-background overflow-hidden">
          <img
            src={productImage}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Product Info */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="font-heading text-xl text-foreground tracking-wider mb-2">
              {name}
            </h3>
            <p className="text-muted-foreground text-sm font-body leading-relaxed">
              {description}
            </p>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-2xl text-primary">
              ${price.toFixed(2)}
            </span>
            {originalPrice && (
              <span className="text-muted-foreground text-sm line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
            {isSubscription && subscriptionText && (
              <span className="text-muted-foreground text-sm">
                {subscriptionText}
              </span>
            )}
          </div>

          {/* Add to Cart */}
          <Button
            onClick={handleAddToCart}
            variant="hero"
            className="w-full"
          >
            {isSubscription ? 'SUBSCRIBE' : 'ADD TO CART'}
          </Button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
