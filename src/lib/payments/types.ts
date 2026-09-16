export type CreateOrderInput = {
  userId: string;
  amount: number; // rupees
  idempotencyKey: string;
  /** Provider-side metadata (e.g. leaderboardSlug) so a webhook can reconcile without trusting the client. */
  notes?: Record<string, string>;
};

export type CreateOrderResult = {
  providerOrderId: string;
  /** Opaque data the client-side checkout widget needs (keys, order id, etc). */
  clientPayload: Record<string, unknown>;
};

export type VerifyPaymentInput = {
  providerOrderId: string;
  providerPaymentId: string;
  signature?: string;
  rawBody?: string;
};

export type VerifyPaymentResult = {
  ok: boolean;
  amount?: number;
  reason?: string;
};

/**
 * A payment provider must implement order creation + webhook/signature
 * verification. The bidding flow never trusts the frontend to confirm a
 * payment — only a verified provider result can confirm a bid.
 */
export interface PaymentProvider {
  name: string;
  createOrder(input: CreateOrderInput): Promise<CreateOrderResult>;
  verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult>;
}
