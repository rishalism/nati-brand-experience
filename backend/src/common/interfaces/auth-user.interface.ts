import type { JwtAccessPayload } from '@nati/shared';

/** The authenticated principal attached to `req.user` by the JWT strategy.
 * Mirrors the access-token claims (no DB entity), so guards are DB-free. */
export type AuthUser = JwtAccessPayload;
