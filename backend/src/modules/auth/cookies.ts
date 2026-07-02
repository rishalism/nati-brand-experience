import type { CookieOptions, Response } from 'express';
import type { AppConfigService } from '../../config/app-config.service';
import { parseDurationMs } from '../../common/utils/duration.util';

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

// Refresh cookie is scoped to the auth endpoints only, so it isn't sent on
// every request. Derived from config to stay in sync with the API prefix.
function refreshCookiePath(config: AppConfigService): string {
  return `/${config.api.prefix}/v${config.api.version}/auth`;
}

function baseOptions(config: AppConfigService): CookieOptions {
  return {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: 'lax',
    domain: config.cookie.domain,
  };
}

/** Sets the access + refresh cookies with lifetimes matching their tokens. */
export function setAuthCookies(
  res: Response,
  config: AppConfigService,
  tokens: { accessToken: string; refreshToken: string },
): void {
  const opts = baseOptions(config);
  res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...opts,
    maxAge: parseDurationMs(config.jwt.accessTtl),
    path: '/',
  });
  res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...opts,
    maxAge: parseDurationMs(config.jwt.refreshTtl),
    path: refreshCookiePath(config),
  });
}

/** Clears both auth cookies (logout). Paths must match those used when set. */
export function clearAuthCookies(res: Response, config: AppConfigService): void {
  const opts = baseOptions(config);
  res.clearCookie(ACCESS_TOKEN_COOKIE, { ...opts, path: '/' });
  res.clearCookie(REFRESH_TOKEN_COOKIE, { ...opts, path: refreshCookiePath(config) });
}
