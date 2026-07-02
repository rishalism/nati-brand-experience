import { Logger } from '@nestjs/common';
import type { EmailMessage, IEmailProvider } from '../email-provider.interface';

/** Dev/fallback provider used when no real email transport is configured.
 * Logs the message (including any action link) so flows are testable locally
 * without sending real email. */
export class ConsoleEmailProvider implements IEmailProvider {
  private readonly logger = new Logger('Email');

  send(message: EmailMessage): Promise<void> {
    this.logger.log(`[email:console] to=${message.to} subject="${message.subject}"`);
    this.logger.debug(message.text ?? message.html);
    return Promise.resolve();
  }
}
