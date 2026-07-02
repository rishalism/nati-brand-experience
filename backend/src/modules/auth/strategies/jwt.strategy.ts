import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, type JwtFromRequestFunction } from 'passport-jwt';
import type { Request } from 'express';
import type { JwtAccessPayload } from '@nati/shared';
import { AppConfigService } from '../../../config/app-config.service';
import { ACCESS_TOKEN_COOKIE } from '../cookies';
import type { AuthUser } from '../../../common/interfaces/auth-user.interface';

// Prefer the HTTP-only cookie; fall back to Authorization: Bearer for
// API clients / Swagger.
const cookieExtractor: JwtFromRequestFunction = (req: Request) => {
  // Express types `req.cookies` as `any`; re-type to a concrete shape.
  const cookies = (req as unknown as { cookies?: Record<string, string | undefined> }).cookies;
  return cookies?.[ACCESS_TOKEN_COOKIE] ?? null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: AppConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.jwt.accessSecret,
    });
  }

  // Return value becomes `req.user`. Claims are trusted (short-lived token),
  // so no DB hit on the hot path.
  validate(payload: JwtAccessPayload): AuthUser {
    return payload;
  }
}
