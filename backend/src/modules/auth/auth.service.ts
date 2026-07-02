import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenType } from '@prisma/client';
import type { PublicUser } from '@nati/shared';
import { AppConfigService } from '../../config/app-config.service';
import { UsersService } from '../users/users.service';
import type { UserWithRoles } from '../users/users.repository';
import { EmailService } from '../email/email.service';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';

export interface AuthContext {
  userAgent?: string;
  ipAddress?: string;
}

export interface AuthResult {
  user: PublicUser;
  accessToken: string;
  accessExpiresAt: Date;
  refreshToken: string;
  refreshExpiresAt: Date;
}

/**
 * Auth use-cases. Coordinates users, password hashing, token issuance/rotation,
 * and transactional email. Cookie handling lives in the controller.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly users: UsersService,
    private readonly passwords: PasswordService,
    private readonly tokens: TokenService,
    private readonly email: EmailService,
    private readonly config: AppConfigService,
  ) {}

  async register(
    input: { email: string; password: string; firstName: string; lastName: string },
    ctx: AuthContext,
  ): Promise<AuthResult> {
    const existing = await this.users.findByEmail(input.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await this.passwords.hash(input.password);
    const user = await this.users.createCustomer({
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
    });

    await this.sendVerificationEmail(user.id, user.email);
    return this.issueSession(user, ctx);
  }

  async login(input: { email: string; password: string }, ctx: AuthContext): Promise<AuthResult> {
    const user = await this.users.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await this.passwords.verify(user.passwordHash, input.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.status === 'SUSPENDED') {
      throw new ForbiddenException('Account suspended');
    }

    await this.users.recordLogin(user.id);
    return this.issueSession(user, ctx);
  }

  async refresh(rawRefreshToken: string, ctx: AuthContext): Promise<AuthResult> {
    const rotated = await this.tokens.rotateRefreshToken(rawRefreshToken, ctx);
    const user = await this.users.findEntityById(rotated.userId);
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    const publicUser = this.users.toPublicUser(user);
    const access = await this.tokens.signAccessToken({
      sub: user.id,
      email: user.email,
      roles: publicUser.roles,
      permissions: publicUser.permissions,
      sessionId: rotated.familyId,
    });

    return {
      user: publicUser,
      accessToken: access.token,
      accessExpiresAt: access.expiresAt,
      refreshToken: rotated.token,
      refreshExpiresAt: rotated.expiresAt,
    };
  }

  async logout(rawRefreshToken?: string): Promise<void> {
    if (rawRefreshToken) {
      await this.tokens.revokeRefreshToken(rawRefreshToken);
    }
  }

  async logoutAll(userId: string): Promise<void> {
    await this.tokens.revokeUserRefreshTokens(userId);
  }

  me(userId: string): Promise<PublicUser> {
    return this.users.getPublicUser(userId);
  }

  async verifyEmail(token: string): Promise<void> {
    const userId = await this.tokens.consumeVerificationToken(token, TokenType.EMAIL_VERIFICATION);
    await this.users.markEmailVerified(userId);
  }

  async resendVerification(userId: string): Promise<void> {
    const user = await this.users.findEntityById(userId);
    if (!user || user.emailVerified) return;
    await this.sendVerificationEmail(user.id, user.email);
  }

  /** Always resolves (no user enumeration) whether or not the email exists. */
  async forgotPassword(email: string): Promise<void> {
    const user = await this.users.findByEmail(email);
    if (!user) return;
    const raw = await this.tokens.issueVerificationToken(user.id, TokenType.PASSWORD_RESET);
    const link = `${this.config.webUrl}/reset-password?token=${raw}`;
    // Never let a mail-delivery failure surface as an error here.
    try {
      await this.email.sendPasswordResetEmail(user.email, link);
    } catch (error) {
      this.logger.error(`Failed to send password reset email: ${(error as Error).message}`);
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const userId = await this.tokens.consumeVerificationToken(token, TokenType.PASSWORD_RESET);
    const passwordHash = await this.passwords.hash(newPassword);
    await this.users.updatePassword(userId, passwordHash);
    // Invalidate every existing session after a password reset.
    await this.tokens.revokeUserRefreshTokens(userId);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    currentSessionId: string,
  ): Promise<void> {
    const user = await this.users.findEntityById(userId);
    if (!user) throw new UnauthorizedException();
    const valid = await this.passwords.verify(user.passwordHash, currentPassword);
    if (!valid) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    const passwordHash = await this.passwords.hash(newPassword);
    await this.users.updatePassword(userId, passwordHash);
    // Log out other devices, keep the current session alive.
    await this.tokens.revokeUserRefreshTokens(userId, currentSessionId);
  }

  private async sendVerificationEmail(userId: string, email: string): Promise<void> {
    const raw = await this.tokens.issueVerificationToken(userId, TokenType.EMAIL_VERIFICATION);
    const link = `${this.config.webUrl}/verify-email?token=${raw}`;
    // Email delivery must not block registration; log and move on if it fails.
    try {
      await this.email.sendVerificationEmail(email, link);
    } catch (error) {
      this.logger.error(`Failed to send verification email: ${(error as Error).message}`);
    }
  }

  private async issueSession(user: UserWithRoles, ctx: AuthContext): Promise<AuthResult> {
    const publicUser = this.users.toPublicUser(user);
    const refresh = await this.tokens.issueRefreshToken(user.id, ctx);
    const access = await this.tokens.signAccessToken({
      sub: user.id,
      email: user.email,
      roles: publicUser.roles,
      permissions: publicUser.permissions,
      sessionId: refresh.familyId,
    });

    return {
      user: publicUser,
      accessToken: access.token,
      accessExpiresAt: access.expiresAt,
      refreshToken: refresh.token,
      refreshExpiresAt: refresh.expiresAt,
    };
  }
}
