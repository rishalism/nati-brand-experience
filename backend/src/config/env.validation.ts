import { z } from 'zod';

/**
 * Environment schema. Validated once at boot (ConfigModule `validate`) so the
 * process fails fast with a clear message instead of surfacing `undefined`
 * config deep in a request handler. Provider keys are optional in Phase 1 and
 * become required in the phases that consume them.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  API_PREFIX: z.string().default('api'),
  API_VERSION: z.string().default('1'),
  CORS_ORIGIN: z.string().default('http://localhost:8080'),
  // Public URL of the frontend — used to build email verification / reset links.
  WEB_URL: z.string().url().default('http://localhost:8080'),
  // Public base URL of THIS API — used to build local-storage file URLs.
  PUBLIC_API_URL: z.string().url().default('http://localhost:3000'),

  DATABASE_URL: z.string().url(),

  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_REFRESH_TTL: z.string().default('7d'),

  COOKIE_SECRET: z.string().min(16),
  COOKIE_SECURE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  // 'none' is required when the frontend and API live on different sites
  // (e.g. vercel.app/localhost → onrender.com); browsers then also require
  // Secure, which cookies.ts enforces.
  COOKIE_SAMESITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  // Optional. When unset the cookie is host-only (scoped to the API host),
  // which is correct unless sharing cookies across subdomains of one site.
  // A Domain that doesn't match the API host gets the cookie silently
  // rejected by the browser.
  COOKIE_DOMAIN: z
    .string()
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : undefined)),

  THROTTLE_TTL: z.coerce.number().int().positive().default(60),
  THROTTLE_LIMIT: z.coerce.number().int().positive().default(100),

  // Providers (wired in later phases)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('NATI <no-reply@nati.example>'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return parsed.data;
}
