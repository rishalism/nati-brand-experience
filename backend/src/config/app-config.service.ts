import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from './env.validation';

/**
 * Typed accessor over the validated env. Feature modules inject this instead of
 * reading raw string keys off ConfigService, so config access is centralized,
 * grouped by concern, and fully type-checked (no magic strings, no `any`).
 */
@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService<Env, true>) {}

  private get<K extends keyof Env>(key: K): Env[K] {
    return this.config.get(key, { infer: true });
  }

  get nodeEnv(): Env['NODE_ENV'] {
    return this.get('NODE_ENV');
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get port(): number {
    return this.get('PORT');
  }

  get api(): { prefix: string; version: string } {
    return { prefix: this.get('API_PREFIX'), version: this.get('API_VERSION') };
  }

  get corsOrigin(): string[] {
    return this.get('CORS_ORIGIN')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);
  }

  get jwt(): {
    accessSecret: string;
    accessTtl: string;
    refreshSecret: string;
    refreshTtl: string;
  } {
    return {
      accessSecret: this.get('JWT_ACCESS_SECRET'),
      accessTtl: this.get('JWT_ACCESS_TTL'),
      refreshSecret: this.get('JWT_REFRESH_SECRET'),
      refreshTtl: this.get('JWT_REFRESH_TTL'),
    };
  }

  get cookie(): { secret: string; secure: boolean; domain: string } {
    return {
      secret: this.get('COOKIE_SECRET'),
      secure: this.get('COOKIE_SECURE'),
      domain: this.get('COOKIE_DOMAIN'),
    };
  }

  get throttle(): { ttl: number; limit: number } {
    return { ttl: this.get('THROTTLE_TTL'), limit: this.get('THROTTLE_LIMIT') };
  }
}
