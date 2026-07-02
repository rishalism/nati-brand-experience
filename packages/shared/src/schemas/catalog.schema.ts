import { z } from "zod";

// --- Brand ---
export const createBrandSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
  logoUrl: z.string().url().optional(),
});
export const updateBrandSchema = createBrandSchema.partial();
export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;

// --- Category ---
export const createCategorySchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
  parentId: z.string().uuid().optional(),
  imageUrl: z.string().url().optional(),
});
export const updateCategorySchema = createCategorySchema.partial();
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

// --- Product ---
export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(10000),
  price: z.number().nonnegative(),
  compareAtPrice: z.number().nonnegative().optional(),
  currency: z.string().length(3).default("USD"),
  sku: z.string().max(64).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT"),
  isFeatured: z.boolean().default(false),
  brandId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  // Optional initial stock on create.
  initialStock: z.number().int().nonnegative().optional(),
});
export const updateProductSchema = createProductSchema.partial().omit({ initialStock: true });
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

// --- Inventory adjustment ---
export const adjustInventorySchema = z.object({
  delta: z.number().int(),
  reason: z.enum(["RESTOCK", "SALE", "ADJUSTMENT", "RETURN", "RESERVATION", "RELEASE"]),
  note: z.string().max(500).optional(),
});
export type AdjustInventoryInput = z.infer<typeof adjustInventorySchema>;
