import { Global, Logger, Module } from '@nestjs/common';
import { AppConfigService } from '../../config/app-config.service';
import { EMAIL_PROVIDER, type IEmailProvider } from './email-provider.interface';
import { EmailService } from './email.service';
import { ResendEmailProvider } from './providers/resend.provider';
import { ConsoleEmailProvider } from './providers/console.provider';

/**
 * Global email module. Picks the transport at startup based on config: Resend
 * when an API key is present, otherwise a console provider for local dev. The
 * rest of the app only ever sees EmailService.
 */
@Global()
@Module({
  providers: [
    {
      provide: EMAIL_PROVIDER,
      inject: [AppConfigService],
      useFactory: (config: AppConfigService): IEmailProvider => {
        const { resendApiKey, from } = config.email;
        if (resendApiKey) {
          return new ResendEmailProvider(resendApiKey, from);
        }
        new Logger('EmailModule').warn(
          'RESEND_API_KEY not set — using console email provider (emails are logged, not sent)',
        );
        return new ConsoleEmailProvider();
      },
    },
    EmailService,
  ],
  exports: [EmailService],
})
export class EmailModule {}
