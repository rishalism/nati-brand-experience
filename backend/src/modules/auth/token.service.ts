import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { TokenType } from '@prisma/client';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type { JwtAccessPayload } from '@nati/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { AppConfigService } from '../../config/app-config.service';
import { expiryFromNow, parseDurationMs } from '../../common/utils/duration.util';

// Verification token lifetimes per flow.
const VERIFICATION_TTL: Record<TokenType, string> = {
  EMAIL_VERIFICATION: '24h',
  PASSWORD_RESET: '1h',
};

interface RefreshContext {
  familyId?: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface IssuedRefresh {
  token: string;
  familyId: string;
  expiresAt: Date;
}

/**
 * Issues and validates tokens.
 * - Access token: short-lived stateless JWT carrying roles/permissions.
 * - Refresh token: high-entropy opaque string, stored only as a SHA-256 hash,
 *   rotated on every use. Reuse of an already-rotated token invalidates the
 *   whole token family (theft detection). `familyId` == session id.
 * - Verification token: single-use, hashed, for email verify / password reset.
 */
@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
  ) {}

  private static generateRawToken(): string {
    return randomBytes(32).toString('hex');
  }

  private static hash(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }

  async signAccessToken(payload: JwtAccessPayload): Promise<{ token: string; expiresAt: Date }> {
    const { accessSecret, accessTtl } = this.config.jwt;
    const token = await this.jwt.signAsync(payload, {
      secret: accessSecret,
      // TTL is a validated duration string ("15m"); cast to the ms-branded type.
      expiresIn: accessTtl as JwtSignOptions['expiresIn'],
    });
    return { token, expiresAt: new Date(Date.now() + parseDurationMs(accessTtl)) };
  }

  async issueRefreshToken(userId: string, ctx: RefreshContext = {}): Promise<IssuedRefresh> {
    const raw = TokenService.generateRawToken();
    const familyId = ctx.familyId ?? randomUUID();
    const expiresAt = expiryFromNow(this.config.jwt.refreshTtl);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: TokenService.hash(raw),
        familyId,
        userAgent: ctx.userAgent,
        ipAddress: ctx.ipAddress,
        expiresAt,
      },
    });

    return { token: raw, familyId, expiresAt };
  }

  /** Rotates a refresh token: validates it, revokes it, and issues a replacement
   * in the same family. Throws (and kills the family) on reuse. */
  async rotateRefreshToken(
    rawToken: string,
    ctx: RefreshContext = {},
  ): Promise<{ userId: string } & IssuedRefresh> {
    const existing = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: TokenService.hash(rawToken) },
    });

    if (!existing) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (existing.revokedAt) {
      // Token was already rotated — likely stolen. Nuke the whole family.
      await this.revokeFamily(existing.familyId);
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    if (existing.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const replacement = await this.issueRefreshToken(existing.userId, {
      familyId: existing.familyId,
      userAgent: ctx.userAgent ?? existing.userAgent ?? undefined,
      ipAddress: ctx.ipAddress ?? existing.ipAddress ?? undefined,
    });

    const replacementRow = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: TokenService.hash(replacement.token) },
      select: { id: true },
    });

    await this.prisma.refreshToken.update({
      where: { id: existing.id },
      data: { revokedAt: new Date(), replacedByTokenId: replacementRow?.id },
    });

    return { userId: existing.userId, ...replacement };
  }

  async revokeRefreshToken(rawToken: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: TokenService.hash(rawToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async revokeFamily(familyId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /** Revokes all active sessions for a user, optionally keeping one family
   * (e.g. the caller's current session after a password change). */
  async revokeUserRefreshTokens(userId: string, exceptFamilyId?: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
        ...(exceptFamilyId ? { familyId: { not: exceptFamilyId } } : {}),
      },
      data: { revokedAt: new Date() },
    });
  }

  async issueVerificationToken(userId: string, type: TokenType): Promise<string> {
    const raw = TokenService.generateRawToken();
    await this.prisma.verificationToken.create({
      data: {
        userId,
        type,
        tokenHash: TokenService.hash(raw),
        expiresAt: expiryFromNow(VERIFICATION_TTL[type]),
      },
    });
    return raw;
  }

  /** Consumes a single-use verification token, returning the owning userId. */
  async consumeVerificationToken(rawToken: string, type: TokenType): Promise<string> {
    const record = await this.prisma.verificationToken.findUnique({
      where: { tokenHash: TokenService.hash(rawToken) },
    });

    if (
      !record ||
      record.type !== type ||
      record.usedAt ||
      record.expiresAt.getTime() < Date.now()
    ) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    await this.prisma.verificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });

    return record.userId;
  }
}
