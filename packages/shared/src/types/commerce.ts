import type { DiscountType } from "../constants/enums";

export interface CartLineItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  lineTotal: number;
  image: string | null;
  inStock: boolean;
  availableStock: number;
}

export interface AppliedCoupon {
  code: string;
  discountType: DiscountType;
  discountValue: number;
}

export interface CartView {
  id: string;
  items: CartLineItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  total: number;
  coupon: AppliedCoupon | null;
}

/** Slim product projection for wishlist rows. */
export interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  primaryImage: string | null;
  inStock: boolean;
}

export interface WishlistItemView {
  id: string;
  addedAt: string;
  product: WishlistProduct;
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  minSubtotal: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  perUserLimit: number | null;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  usedCount: number;
  createdAt: string;
  updatedAt: string;
}
