import { Logger } from '@nestjs/common';
import { Resend } from 'resend';
import type { EmailMessage, IEmailProvider } from '../email-provider.interface';

/** Resend-backed email provider. Selected when RESEND_API_KEY is configured. */
export class ResendEmailProvider implements IEmailProvider {
  private readonly logger = new Logger(ResendEmailProvider.name);
  private readonly resend: Resend;

  constructor(
    apiKey: string,
    private readonly from: string,
  ) {
    this.resend = new Resend(apiKey);
  }

  async send(message: EmailMessage): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: this.from,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text ?? '',
    });
    if (error) {
      this.logger.error(`Failed to send email to ${message.to}: ${error.message}`);
      throw new Error(`Email delivery failed: ${error.message}`);
    }
  }
}
