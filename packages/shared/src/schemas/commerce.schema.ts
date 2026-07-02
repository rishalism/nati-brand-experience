import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).default(1),
});
export type AddToCartInput = z.infer<typeof addToCartSchema>;

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0), // 0 removes the line
});
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

export const mergeCartSchema = z.object({
  items: z.array(addToCartSchema).max(100),
});
export type MergeCartInput = z.infer<typeof mergeCartSchema>;

export const applyCouponSchema = z.object({
  code: z.string().min(1).max(64),
});
export type ApplyCouponInput = z.infer<typeof applyCouponSchema>;

export const createCouponSchema = z.object({
  code: z.string().min(1).max(64),
  description: z.string().max(500).optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().positive(),
  minSubtotal: z.number().nonnegative().optional(),
  maxDiscount: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  perUserLimit: z.number().int().positive().optional(),
  startsAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
});
export const updateCouponSchema = createCouponSchema.partial();
export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
