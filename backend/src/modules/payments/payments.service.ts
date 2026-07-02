import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import type { PaymentMethod } from '@nati/shared';
import { AppConfigService } from '../../config/app-config.service';
import type { IPaymentProvider } from './payment-provider.interface';
import { RazorpayProvider } from './providers/razorpay.provider';
import { CodProvider } from './providers/cod.provider';

/**
 * Registry of available payment providers. OrdersService asks for a provider by
 * method; unavailable/unconfigured methods are rejected cleanly.
 */
@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly providers = new Map<PaymentMethod, IPaymentProvider>();

  constructor(private readonly config: AppConfigService) {
    this.providers.set('COD', new CodProvider());

    const { keyId, keySecret } = this.config.razorpay;
    if (keyId && keySecret) {
      this.providers.set('RAZORPAY', new RazorpayProvider(keyId, keySecret));
    } else {
      this.logger.warn('Razorpay not configured — RAZORPAY checkout disabled');
    }
  }

  getProvider(method: PaymentMethod): IPaymentProvider {
    const provider = this.providers.get(method);
    if (!provider) {
      throw new BadRequestException(`Payment method ${method} is not available`);
    }
    return provider;
  }

  get razorpayKeyId(): string | undefined {
    return this.config.razorpay.keyId;
  }
}
