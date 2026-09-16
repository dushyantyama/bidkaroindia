import crypto from "crypto";
import type { PaymentProvider } from "./types";

/**
 * Razorpay implementation, ready to activate for the Vercel + Supabase +
 * Razorpay production target. Not wired up as the active provider yet
 * (see src/lib/payments/index.ts) — flip PAYMENTS_PROVIDER=razorpay and set
 * RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET / RAZORPAY_WEBHOOK_SECRET once a
 * merchant account exists.
 */
export const razorpayProvider: PaymentProvider = {
  name: "razorpay",

  async createOrder({ amount, idempotencyKey, notes }) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new Error("Razorpay keys are not configured");
    }

    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64"),
      },
      body: JSON.stringify({
        amount: amount * 100, // paise
        currency: "INR",
        receipt: idempotencyKey,
        notes,
      }),
    });

    if (!res.ok) {
      throw new Error(`Razorpay order creation failed: ${res.status}`);
    }

    const order = (await res.json()) as { id: string };
    return {
      providerOrderId: order.id,
      clientPayload: { orderId: order.id, keyId, amount: amount * 100, currency: "INR" },
    };
  },

  /**
   * Verifies the HMAC signature Razorpay returns to the client after
   * checkout AND expects webhook confirmation server-side before a bid is
   * ever marked confirmed — never trust the client-side callback alone.
   */
  async verifyPayment({ providerOrderId, providerPaymentId, signature }) {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret || !signature) return { ok: false, reason: "missing signature or secret" };

    const expected = crypto
      .createHmac("sha256", keySecret)
      .update(`${providerOrderId}|${providerPaymentId}`)
      .digest("hex");

    if (!timingSafeEqualHex(expected, signature)) return { ok: false, reason: "signature mismatch" };
    return { ok: true };
  },
};

function timingSafeEqualHex(expectedHex: string, actualHex: string): boolean {
  const expected = Buffer.from(expectedHex, "hex");
  const actual = Buffer.from(actualHex, "hex");
  if (expected.length !== actual.length) return false;
  return crypto.timingSafeEqual(expected, actual);
}

/**
 * Webhook payloads are signed over the raw request body with a separate
 * secret (RAZORPAY_WEBHOOK_SECRET, configured in the Razorpay dashboard) —
 * this is independent of the client-side checkout signature above, and is
 * what lets us confirm a payment even if the buyer closes the tab before the
 * checkout `handler` callback fires.
 */
export function verifyRazorpayWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return timingSafeEqualHex(expected, signature);
}
