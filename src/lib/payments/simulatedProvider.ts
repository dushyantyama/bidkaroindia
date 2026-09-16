import type { PaymentProvider } from "./types";

/**
 * Placeholder provider used while no real payment gateway is wired up.
 * "Orders" are auto-approved so the rest of the bidding architecture (order
 * creation -> verification -> confirmed bid) can be built and tested end to
 * end before Razorpay keys exist. Swap PAYMENTS_PROVIDER=razorpay later.
 */
export const simulatedProvider: PaymentProvider = {
  name: "simulated",

  async createOrder({ amount, idempotencyKey }) {
    return {
      providerOrderId: `sim_order_${idempotencyKey}`,
      clientPayload: { amount, simulated: true },
    };
  },

  async verifyPayment({ providerOrderId }) {
    return { ok: true, amount: undefined, reason: `auto-approved (${providerOrderId})` };
  },
};
