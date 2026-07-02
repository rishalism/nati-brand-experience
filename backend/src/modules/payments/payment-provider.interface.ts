import type { PaymentMethod } from '@nati/shared';

export interface CreatePaymentOrderInput {
  /** Amount in the currency's minor unit (e.g. paise/cents). */
  amountMinor: number;
  currency: string;
  receipt: string;
}

export interface VerifySignatureInput {
  providerOrderId: string;
  providerPaymentId: string;
  signature: string;
}

/**
 * Payment gateway abstraction. Business code (OrdersService) depends only on
 * this — swapping Razorpay for Stripe/PayPal means adding a provider class and
 * registering it, nothing else. No gateway SDK is imported outside this folder.
 */
export interface IPaymentProvider {
  readonly method: PaymentMethod;
  /** Creates a gateway order; returns null providerOrderId for offline methods (COD). */
  createPaymentOrder(input: CreatePaymentOrderInput): Promise<{ providerOrderId: string | null }>;
  /** Verifies a gateway callback signature. Offline methods return true. */
  verifySignature(input: VerifySignatureInput): boolean;
}
