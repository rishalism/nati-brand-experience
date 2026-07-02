import { createHmac } from 'node:crypto';
import Razorpay from 'razorpay';
import type { PaymentMethod } from '@nati/shared';
import type {
  CreatePaymentOrderInput,
  IPaymentProvider,
  VerifySignatureInput,
} from '../payment-provider.interface';

/** Razorpay gateway. Creates gateway orders and verifies the HMAC signature
 * Razorpay returns on the client callback. */
export class RazorpayProvider implements IPaymentProvider {
  readonly method: PaymentMethod = 'RAZORPAY';
  private readonly client: Razorpay;

  constructor(
    keyId: string,
    private readonly keySecret: string,
  ) {
    this.client = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }

  async createPaymentOrder(
    input: CreatePaymentOrderInput,
  ): Promise<{ providerOrderId: string | null }> {
    const order = await this.client.orders.create({
      amount: input.amountMinor,
      currency: input.currency,
      receipt: input.receipt,
    });
    return { providerOrderId: order.id };
  }

  verifySignature(input: VerifySignatureInput): boolean {
    const expected = createHmac('sha256', this.keySecret)
      .update(`${input.providerOrderId}|${input.providerPaymentId}`)
      .digest('hex');
    return expected === input.signature;
  }
}
