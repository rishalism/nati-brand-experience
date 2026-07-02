/**
 * Cross-cutting enums shared by API + UI. These mirror Prisma enums 1:1;
 * keeping a hand-authored copy here avoids the frontend importing anything
 * from the backend/Prisma runtime.
 */

export const USER_STATUS = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
} as const;
export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export const TOKEN_TYPE = {
  EMAIL_VERIFICATION: "EMAIL_VERIFICATION",
  PASSWORD_RESET: "PASSWORD_RESET",
} as const;
export type TokenType = (typeof TOKEN_TYPE)[keyof typeof TOKEN_TYPE];

// Declared now for a stable contract; used from Phase 5 onward.
export const ORDER_STATUS = {
  PENDING: "PENDING",
  PAID: "PAID",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
} as const;
export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  AUTHORIZED: "AUTHORIZED",
  CAPTURED: "CAPTURED",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
} as const;
export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const PRODUCT_STATUS = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  ARCHIVED: "ARCHIVED",
} as const;
export type ProductStatus = (typeof PRODUCT_STATUS)[keyof typeof PRODUCT_STATUS];

export const DISCOUNT_TYPE = {
  PERCENTAGE: "PERCENTAGE",
  FIXED: "FIXED",
} as const;
export type DiscountType = (typeof DISCOUNT_TYPE)[keyof typeof DISCOUNT_TYPE];

// Checkout payment methods. Razorpay + COD implemented; others reserved.
export const PAYMENT_METHOD = {
  RAZORPAY: "RAZORPAY",
  COD: "COD",
  STRIPE: "STRIPE",
  PAYPAL: "PAYPAL",
} as const;
export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

// Reason for a stock movement — the append-only inventory ledger.
export const INVENTORY_MOVEMENT_REASON = {
  RESTOCK: "RESTOCK",
  SALE: "SALE",
  ADJUSTMENT: "ADJUSTMENT",
  RETURN: "RETURN",
  RESERVATION: "RESERVATION",
  RELEASE: "RELEASE",
} as const;
export type InventoryMovementReason =
  (typeof INVENTORY_MOVEMENT_REASON)[keyof typeof INVENTORY_MOVEMENT_REASON];
