import { NextResponse } from "next/server";
import { z } from "zod";
import { getAnonUserId } from "@/lib/anonSession";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  referrerUsername: z.string().min(1),
  referredUsername: z.string().min(1).optional(),
  source: z.string().max(40).optional(),
});

/**
 * Records that someone arrived via a /out/@user?ref=someone link. If the
 * visitor is signed in we attribute it to their account; if the visitor is
 * the same person being shown off (i.e. they clicked their own share link
 * while logged out), we still log the click for analytics without a
 * referred user attached.
 */
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const referrer = await prisma.user.findUnique({ where: { username: parsed.data.referrerUsername.replace(/^@/, "") } });
  if (!referrer) return NextResponse.json({ ok: true }); // don't leak whether a username exists

  const visitorId = await getAnonUserId();

  if (!visitorId || visitorId === referrer.id) {
    return NextResponse.json({ ok: true });
  }

  await prisma.referral.create({
    data: { referrerUserId: referrer.id, referredUserId: visitorId, source: parsed.data.source ?? "out_link" },
  });

  return NextResponse.json({ ok: true });
}
