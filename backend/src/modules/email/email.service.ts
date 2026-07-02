import { Inject, Injectable } from '@nestjs/common';
import { EMAIL_PROVIDER, type IEmailProvider } from './email-provider.interface';

const wrap = (title: string, body: string): string => `
  <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:24px">
    <h1 style="font-size:20px">${title}</h1>
    ${body}
    <hr style="margin-top:32px;border:none;border-top:1px solid #eee" />
    <p style="color:#888;font-size:12px">NATI — premium electrolyte hydration</p>
  </div>`;

const button = (href: string, label: string): string =>
  `<p><a href="${href}" style="display:inline-block;background:#000;color:#fff;padding:12px 20px;text-decoration:none;border-radius:6px">${label}</a></p>
   <p style="color:#888;font-size:12px">Or paste this link: ${href}</p>`;

/**
 * Transactional email use-cases. Depends on the IEmailProvider abstraction, so
 * templates/content live here and delivery is swappable.
 */
@Injectable()
export class EmailService {
  constructor(@Inject(EMAIL_PROVIDER) private readonly provider: IEmailProvider) {}

  async sendVerificationEmail(to: string, link: string): Promise<void> {
    await this.provider.send({
      to,
      subject: 'Verify your NATI account',
      html: wrap(
        'Confirm your email',
        `<p>Welcome to NATI. Confirm your email to activate your account.</p>${button(link, 'Verify email')}`,
      ),
      text: `Verify your NATI account: ${link}`,
    });
  }

  async sendPasswordResetEmail(to: string, link: string): Promise<void> {
    await this.provider.send({
      to,
      subject: 'Reset your NATI password',
      html: wrap(
        'Reset your password',
        `<p>We received a request to reset your password. This link expires soon.</p>${button(link, 'Reset password')}<p style="color:#888;font-size:12px">If you didn't request this, ignore this email.</p>`,
      ),
      text: `Reset your NATI password: ${link}`,
    });
  }
}
