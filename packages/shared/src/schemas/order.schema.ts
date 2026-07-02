import { z } from "zod";

// A checkout either references a saved address (addressId) or supplies a new
// shipping address inline. Exactly one is required.
const shippingAddressSchema = z.object({
  recipientName: z.string().min(1).max(100),
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  postalCode: z.string().min(1).max(20),
  country: z.string().min(2).max(100),
  phone: z.string().min(5).max(20).optional(),
});

export const checkoutSchema = z
  .object({
    addressId: z.string().uuid().optional(),
    shippingAddress: shippingAddressSchema.optional(),
    paymentMethod: z.enum(["RAZORPAY", "COD"]),
  })
  .refine((data) => Boolean(data.addressId) !== Boolean(data.shippingAddress), {
    message: "Provide either addressId or shippingAddress (exactly one)",
    path: ["addressId"],
  });
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;

export const verifyRazorpaySchema = z.object({
  orderId: z.string().uuid(),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});
export type VerifyRazorpayInput = z.infer<typeof verifyRazorpaySchema>;

export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
});
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
