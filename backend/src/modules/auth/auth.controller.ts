import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import type { AuthSession, PublicUser } from '@nati/shared';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import type { AuthUser } from '../../common/interfaces/auth-user.interface';
import { AppConfigService } from '../../config/app-config.service';
import { AuthService, type AuthContext, type AuthResult } from './auth.service';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './dto/auth.dto';
import { clearAuthCookies, REFRESH_TOKEN_COOKIE, setAuthCookies } from './cookies';

// Stricter limit for credential/enumeration-sensitive endpoints.
const STRICT_THROTTLE = { default: { limit: 5, ttl: 60_000 } };

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: AppConfigService,
  ) {}

  @Post('register')
  @Public()
  @Throttle(STRICT_THROTTLE)
  @ResponseMessage('Registration successful')
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSession> {
    const result = await this.authService.register(dto, this.context(req));
    return this.startSession(res, result);
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle(STRICT_THROTTLE)
  @ResponseMessage('Login successful')
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSession> {
    const result = await this.authService.login(dto, this.context(req));
    return this.startSession(res, result);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Token refreshed')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSession> {
    const token = this.readRefreshCookie(req);
    if (!token) {
      throw new UnauthorizedException('Missing refresh token');
    }
    const result = await this.authService.refresh(token, this.context(req));
    return this.startSession(res, result);
  }

  @Post('logout')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Logged out')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<null> {
    await this.authService.logout(this.readRefreshCookie(req));
    clearAuthCookies(res, this.config);
    return null;
  }

  @Post('logout-all')
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Logged out of all sessions')
  async logoutAll(
    @CurrentUser('sub') userId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<null> {
    await this.authService.logoutAll(userId);
    clearAuthCookies(res, this.config);
    return null;
  }

  @Get('me')
  @ApiBearerAuth('access-token')
  getMe(@CurrentUser('sub') userId: string): Promise<PublicUser> {
    return this.authService.me(userId);
  }

  @Post('verify-email')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Email verified')
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<null> {
    await this.authService.verifyEmail(dto.token);
    return null;
  }

  @Post('resend-verification')
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Verification email sent')
  async resendVerification(@CurrentUser('sub') userId: string): Promise<null> {
    await this.authService.resendVerification(userId);
    return null;
  }

  @Post('forgot-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle(STRICT_THROTTLE)
  @ResponseMessage('If the email exists, a reset link has been sent')
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<null> {
    await this.authService.forgotPassword(dto.email);
    return null;
  }

  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle(STRICT_THROTTLE)
  @ResponseMessage('Password reset successful')
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<null> {
    await this.authService.resetPassword(dto.token, dto.password);
    return null;
  }

  @Post('change-password')
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Password changed')
  async changePassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordDto,
  ): Promise<null> {
    await this.authService.changePassword(
      user.sub,
      dto.currentPassword,
      dto.newPassword,
      user.sessionId,
    );
    return null;
  }

  // --- helpers ---

  private context(req: Request): AuthContext {
    return {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    };
  }

  private readRefreshCookie(req: Request): string | undefined {
    // Express types `req.cookies` as `any`; re-type to a concrete shape.
    const cookies = (req as unknown as { cookies?: Record<string, string | undefined> }).cookies;
    return cookies?.[REFRESH_TOKEN_COOKIE];
  }

  private startSession(res: Response, result: AuthResult): AuthSession {
    setAuthCookies(res, this.config, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
    return {
      user: result.user,
      accessTokenExpiresAt: result.accessExpiresAt.toISOString(),
    };
  }
}
