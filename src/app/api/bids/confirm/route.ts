import { NextResponse } from "next/server";
import { z } from "zod";
import { getAnonUserId } from "@/lib/anonSession";
import { confirmBidOrder, BidError } from "@/lib/bidding";

const bodySchema = z.object({
  paymentId: z.string().min(1),
  providerPaymentId: z.string().min(1),
  signature: z.string().optional(),
});

export async function POST(req: Request) {
  const userId = await getAnonUserId();
  if (!userId) {
    return NextResponse.json({ error: "Claim a username to bid." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const bid = await confirmBidOrder({ userId, ...parsed.data });
    return NextResponse.json({ ok: true, bid });
  } catch (err) {
    if (err instanceof BidError) {
      const status = err.code === "NOT_FOUND" ? 404 : err.code === "FORBIDDEN" ? 403 : 409;
      return NextResponse.json({ error: err.message, code: err.code }, { status });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. If you were charged, it will be refunded." }, { status: 500 });
  }
}
