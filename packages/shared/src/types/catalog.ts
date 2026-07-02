import type { ProductStatus } from "../constants/enums";

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  position: number;
  isPrimary: boolean;
}

export interface InventoryInfo {
  quantity: number;
  reserved: number;
  available: number;
  lowStockThreshold: number;
  inStock: boolean;
}

/** Lightweight brand/category reference embedded in a product. */
export interface CatalogRef {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  status: ProductStatus;
  isFeatured: boolean;
  sku: string | null;
  brand: CatalogRef | null;
  category: CatalogRef | null;
  images: ProductImage[];
  primaryImage: string | null;
  inventory: InventoryInfo;
  createdAt: string;
  updatedAt: string;
}

/** Query params accepted by the public product list endpoint. */
export interface ProductQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  categorySlug?: string;
  brandSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: ProductStatus;
  featured?: boolean;
  inStock?: boolean;
}
