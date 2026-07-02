import type { PaymentMethod } from '@nati/shared';
import type { IPaymentProvider } from '../payment-provider.interface';

/** Cash on delivery: no gateway interaction. The order is placed immediately
 * and collected on delivery. */
export class CodProvider implements IPaymentProvider {
  readonly method: PaymentMethod = 'COD';

  createPaymentOrder(): Promise<{ providerOrderId: string | null }> {
    return Promise.resolve({ providerOrderId: null });
  }

  verifySignature(): boolean {
    return true;
  }
}
