import { NextResponse } from "next/server";
import { z } from "zod";
import { getAnonUserId } from "@/lib/anonSession";
import { createBidOrder, BidError } from "@/lib/bidding";

const bodySchema = z.object({
  leaderboardSlug: z.string().min(1),
  amount: z.number().int().positive(),
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
    const order = await createBidOrder({
      userId,
      leaderboardSlug: parsed.data.leaderboardSlug,
      amount: parsed.data.amount,
    });
    return NextResponse.json({ ok: true, ...order });
  } catch (err) {
    if (err instanceof BidError) {
      const status = err.code === "NOT_FOUND" ? 404 : err.code === "FORBIDDEN" ? 403 : 409;
      return NextResponse.json({ error: err.message, code: err.code }, { status });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Your payment was not charged for an invalid bid." }, { status: 500 });
  }
}
