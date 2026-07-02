/**
 * System roles. Stored in the DB (Role table) and seeded, but enumerated here
 * so guards, route configs, and the frontend can reference them type-safely
 * without magic strings.
 */
export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  CUSTOMER: "CUSTOMER",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ALL_ROLES: Role[] = Object.values(ROLES);
