/**
 * Fine-grained permissions (`<resource>:<action>`), granted to roles via the
 * RolePermission join table. Enables permission-based guards beyond coarse
 * role checks. Extended per feature phase.
 */
export const PERMISSIONS = {
  // Users / accounts
  USER_READ: "user:read",
  USER_WRITE: "user:write",
  USER_DELETE: "user:delete",
  ROLE_MANAGE: "role:manage",

  // Catalog (Phase 3)
  PRODUCT_READ: "product:read",
  PRODUCT_WRITE: "product:write",
  PRODUCT_DELETE: "product:delete",
  CATEGORY_MANAGE: "category:manage",
  INVENTORY_MANAGE: "inventory:manage",

  // Commerce (Phases 4-5)
  ORDER_READ: "order:read",
  ORDER_MANAGE: "order:manage",
  COUPON_MANAGE: "coupon:manage",

  // Admin (Phase 6)
  ANALYTICS_READ: "analytics:read",
  REVIEW_MODERATE: "review:moderate",
  SETTINGS_MANAGE: "settings:manage",
  AUDIT_READ: "audit:read",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: Permission[] = Object.values(PERMISSIONS);
