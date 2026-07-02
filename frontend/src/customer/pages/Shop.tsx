import React, { useMemo, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/shop/ProductCard';
import CartDrawer from '@/components/shop/CartDrawer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import type { ProductQuery, SortOrder } from '@nati/shared';
import { useProducts, useCategories } from '@/features/catalog/catalog.hooks';
import { useDebouncedValue } from '@/hooks/use-debounced-value';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const SORT_OPTIONS: Record<string, { sortBy: string; sortOrder: SortOrder; label: string }> = {
  newest: { sortBy: 'createdAt', sortOrder: 'desc', label: 'Newest' },
  'price-asc': { sortBy: 'price', sortOrder: 'asc', label: 'Price: Low to High' },
  'price-desc': { sortBy: 'price', sortOrder: 'desc', label: 'Price: High to Low' },
  'name-asc': { sortBy: 'name', sortOrder: 'asc', label: 'Name: A–Z' },
};

const PAGE_SIZE = 9;

const Shop = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(search, 350);

  const query = useMemo<ProductQuery>(() => {
    const sortOpt = SORT_OPTIONS[sort];
    return {
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
      categorySlug: category === 'all' ? undefined : category,
      sortBy: sortOpt.sortBy,
      sortOrder: sortOpt.sortOrder,
    };
  }, [page, debouncedSearch, category, sort]);

  const { data, isLoading, isError } = useProducts(query);
  const { data: categories } = useCategories();

  const resetToFirstPage = () => setPage(1);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    toast({ title: 'Added to Cart', description: `${item.name} has been added to your cart.` });
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCart((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, quantity } : i)),
    );
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const products = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen bg-background">
      <Header cartCount={cartCount} onCartClick={() => setIsCartOpen(true)} />

      <main className="pt-24 pb-20">
        <section className="container py-12 md:py-20">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading text-foreground mb-4 tracking-wider">
              THE <span className="text-primary">DROP</span>
            </h1>
            <p className="text-muted-foreground font-body text-lg">
              Premium electrolyte hydration. Choose your pack.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 max-w-6xl mx-auto mb-10">
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetToFirstPage();
              }}
              className="md:max-w-xs"
            />
            <Select
              value={category}
              onValueChange={(v) => {
                setCategory(v);
                resetToFirstPage();
              }}
            >
              <SelectTrigger className="md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((c) => (
                  <SelectItem key={c.id} value={c.slug}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={sort}
              onValueChange={(v) => {
                setSort(v);
                resetToFirstPage();
              }}
            >
              <SelectTrigger className="md:w-56">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SORT_OPTIONS).map(([key, opt]) => (
                  <SelectItem key={key} value={key}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-[420px] rounded-lg" />
              ))}

            {!isLoading &&
              products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  description={product.description}
                  price={product.price}
                  originalPrice={product.compareAtPrice ?? undefined}
                  badge={product.isFeatured ? 'MOST POPULAR' : undefined}
                  image={product.primaryImage ?? undefined}
                  outOfStock={!product.inventory.inStock}
                  onAddToCart={addToCart}
                />
              ))}
          </div>

          {isError && (
            <p className="text-center text-destructive mt-10">Failed to load products.</p>
          )}
          {!isLoading && !isError && products.length === 0 && (
            <p className="text-center text-muted-foreground mt-10">No products found.</p>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12">
              <Button
                variant="outline"
                disabled={!pagination.hasPrevPage}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-muted-foreground text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={!pagination.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
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
