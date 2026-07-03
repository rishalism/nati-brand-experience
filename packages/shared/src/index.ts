// Public surface of @nati/shared — the single contract shared by frontend + backend.

// Types
export * from "./types/api-response";
export * from "./types/pagination";
export * from "./types/user";
export * from "./types/auth";
export * from "./types/address";
export * from "./types/catalog";
export * from "./types/commerce";
export * from "./types/order";
export * from "./types/analytics";

// Constants / enums
export * from "./constants/roles";
export * from "./constants/permissions";
export * from "./constants/enums";

// Zod schemas (+ inferred input types)
export * from "./schemas/auth.schema";
export * from "./schemas/user.schema";
export * from "./schemas/address.schema";
export * from "./schemas/catalog.schema";
export * from "./schemas/commerce.schema";
export * from "./schemas/order.schema";
