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

  get webUrl(): string {
    return this.get('WEB_URL');
  }

  get publicApiUrl(): string {
    return this.get('PUBLIC_API_URL');
  }

  get cloudinary(): { cloudName?: string; apiKey?: string; apiSecret?: string } {
    return {
      cloudName: this.get('CLOUDINARY_CLOUD_NAME'),
      apiKey: this.get('CLOUDINARY_API_KEY'),
      apiSecret: this.get('CLOUDINARY_API_SECRET'),
    };
  }

  get email(): { resendApiKey?: string; from: string } {
    return { resendApiKey: this.get('RESEND_API_KEY'), from: this.get('EMAIL_FROM') };
  }

  get razorpay(): { keyId?: string; keySecret?: string } {
    return { keyId: this.get('RAZORPAY_KEY_ID'), keySecret: this.get('RAZORPAY_KEY_SECRET') };
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

  get cookie(): {
    secret: string;
    secure: boolean;
    sameSite: 'lax' | 'strict' | 'none';
    domain?: string;
  } {
    return {
      secret: this.get('COOKIE_SECRET'),
      secure: this.get('COOKIE_SECURE'),
      sameSite: this.get('COOKIE_SAMESITE'),
      domain: this.get('COOKIE_DOMAIN'),
    };
  }

  get throttle(): { ttl: number; limit: number } {
    return { ttl: this.get('THROTTLE_TTL'), limit: this.get('THROTTLE_LIMIT') };
  }
}
