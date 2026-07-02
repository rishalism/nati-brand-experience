import type { PublicUser } from "./user";

/** Payload returned on successful login/register/refresh. Tokens themselves
 * travel in HTTP-only cookies; the body carries the user + optional expiry. */
export interface AuthSession {
  user: PublicUser;
  accessTokenExpiresAt: string;
}

/** Decoded JWT access-token claims. */
export interface JwtAccessPayload {
  sub: string; // user id
  email: string;
  roles: string[];
  permissions: string[];
  sessionId: string;
}
