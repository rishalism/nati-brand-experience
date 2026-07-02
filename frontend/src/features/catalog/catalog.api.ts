import type {
  ApiResponse,
  Brand,
  Category,
  CreateBrandInput,
  CreateCategoryInput,
  CreateProductInput,
  InventoryInfo,
  PaginatedData,
  Product,
  ProductQuery,
  UpdateProductInput,
  AdjustInventoryInput,
} from "@nati/shared";
import { apiClient, unwrap, unwrapPage } from "@/services/api-client";

// Drops undefined values so they aren't serialized into the query string.
function clean(params: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""));
}

export const catalogApi = {
  // --- public ---
  listProducts(query: ProductQuery): Promise<PaginatedData<Product>> {
    return unwrapPage<Product>(
      apiClient.get<ApiResponse<Product[]>>("/products", { params: clean({ ...query }) }),
    );
  },
  getProduct(id: string): Promise<Product> {
    return unwrap<Product>(apiClient.get<ApiResponse<Product>>(`/products/${id}`));
  },
  getProductBySlug(slug: string): Promise<Product> {
    return unwrap<Product>(apiClient.get<ApiResponse<Product>>(`/products/slug/${slug}`));
  },
  listBrands(): Promise<Brand[]> {
    return unwrap<Brand[]>(apiClient.get<ApiResponse<Brand[]>>("/brands"));
  },
  listCategories(): Promise<Category[]> {
    return unwrap<Category[]>(apiClient.get<ApiResponse<Category[]>>("/categories"));
  },

  // --- admin ---
  listAdminProducts(query: ProductQuery): Promise<PaginatedData<Product>> {
    return unwrapPage<Product>(
      apiClient.get<ApiResponse<Product[]>>("/products/admin", { params: clean({ ...query }) }),
    );
  },
  createProduct(input: CreateProductInput): Promise<Product> {
    return unwrap<Product>(apiClient.post<ApiResponse<Product>>("/products", input));
  },
  updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
    return unwrap<Product>(apiClient.patch<ApiResponse<Product>>(`/products/${id}`, input));
  },
  deleteProduct(id: string): Promise<void> {
    return apiClient.delete(`/products/${id}`).then(() => undefined);
  },
  adjustInventory(productId: string, input: AdjustInventoryInput): Promise<InventoryInfo> {
    return unwrap<InventoryInfo>(
      apiClient.post<ApiResponse<InventoryInfo>>(`/inventory/${productId}/adjust`, input),
    );
  },
  createBrand(input: CreateBrandInput): Promise<Brand> {
    return unwrap<Brand>(apiClient.post<ApiResponse<Brand>>("/brands", input));
  },
  deleteBrand(id: string): Promise<void> {
    return apiClient.delete(`/brands/${id}`).then(() => undefined);
  },
  createCategory(input: CreateCategoryInput): Promise<Category> {
    return unwrap<Category>(apiClient.post<ApiResponse<Category>>("/categories", input));
  },
  deleteCategory(id: string): Promise<void> {
    return apiClient.delete(`/categories/${id}`).then(() => undefined);
  },
};
