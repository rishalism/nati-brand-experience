import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AdjustInventoryInput,
  CreateBrandInput,
  CreateCategoryInput,
  CreateProductInput,
  ProductQuery,
  UpdateProductInput,
} from "@nati/shared";
import { catalogApi } from "./catalog.api";

export const catalogKeys = {
  products: (query: ProductQuery) => ["products", query] as const,
  adminProducts: (query: ProductQuery) => ["admin-products", query] as const,
  product: (id: string) => ["product", id] as const,
  productBySlug: (slug: string) => ["product-slug", slug] as const,
  brands: ["brands"] as const,
  categories: ["categories"] as const,
};

// --- public ---
export const useProducts = (query: ProductQuery) =>
  useQuery({
    queryKey: catalogKeys.products(query),
    queryFn: () => catalogApi.listProducts(query),
    placeholderData: (prev) => prev, // keep previous page while fetching next
  });

export const useProduct = (id: string | undefined) =>
  useQuery({
    queryKey: catalogKeys.product(id ?? ""),
    queryFn: () => catalogApi.getProduct(id as string),
    enabled: Boolean(id),
  });

export const useBrands = () =>
  useQuery({ queryKey: catalogKeys.brands, queryFn: () => catalogApi.listBrands() });

export const useCategories = () =>
  useQuery({ queryKey: catalogKeys.categories, queryFn: () => catalogApi.listCategories() });

// --- admin ---
export const useAdminProducts = (query: ProductQuery) =>
  useQuery({
    queryKey: catalogKeys.adminProducts(query),
    queryFn: () => catalogApi.listAdminProducts(query),
    placeholderData: (prev) => prev,
  });

function useInvalidateProducts() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: ["admin-products"] });
    void qc.invalidateQueries({ queryKey: ["products"] });
  };
}

export const useCreateProduct = () => {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: (input: CreateProductInput) => catalogApi.createProduct(input),
    onSuccess: invalidate,
  });
};

export const useUpdateProduct = () => {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProductInput }) =>
      catalogApi.updateProduct(id, input),
    onSuccess: invalidate,
  });
};

export const useDeleteProduct = () => {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: (id: string) => catalogApi.deleteProduct(id),
    onSuccess: invalidate,
  });
};

export const useAdjustInventory = () => {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: ({ productId, input }: { productId: string; input: AdjustInventoryInput }) =>
      catalogApi.adjustInventory(productId, input),
    onSuccess: invalidate,
  });
};

export const useCreateBrand = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBrandInput) => catalogApi.createBrand(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: catalogKeys.brands }),
  });
};

export const useDeleteBrand = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => catalogApi.deleteBrand(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: catalogKeys.brands }),
  });
};

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => catalogApi.createCategory(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: catalogKeys.categories }),
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => catalogApi.deleteCategory(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: catalogKeys.categories }),
  });
};
