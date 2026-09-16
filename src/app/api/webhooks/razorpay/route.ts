import { NextResponse } from "next/server";
import { verifyRazorpayWebhookSignature } from "@/lib/payments/razorpayProvider";
import { finalizeBidFromWebhook } from "@/lib/bidding";

/**
 * Server-to-server confirmation from Razorpay. This is the "never trust the
 * client-side callback alone" half of the flow — it finalizes a bid even if
 * the buyer's browser never called /api/bids/confirm (e.g. they closed the
 * tab right after paying). Configure this URL + a webhook secret for the
 * "payment.captured" event in the Razorpay dashboard, and set
 * RAZORPAY_WEBHOOK_SECRET to match.
 */
export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let payload: { event?: string; payload?: { payment?: { entity?: { id?: string; order_id?: string } } } };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (payload.event === "payment.captured") {
    const entity = payload.payload?.payment?.entity;
    if (entity?.order_id && entity?.id) {
      await finalizeBidFromWebhook({ providerOrderId: entity.order_id, providerPaymentId: entity.id });
    }
  }

  return NextResponse.json({ ok: true });
}
