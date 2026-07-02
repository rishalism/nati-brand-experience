export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/** Transport abstraction for outbound email. Business code depends on this,
 * never on a concrete SDK — swapping Resend for SES/SendGrid later means adding
 * one provider class and changing the factory, nothing else. */
export interface IEmailProvider {
  send(message: EmailMessage): Promise<void>;
}

export const EMAIL_PROVIDER = Symbol('EMAIL_PROVIDER');
