import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
import { DEFAULT_INCREMENT_CONFIG } from "@/lib/currency";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const leaderboards = await prisma.leaderboard.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json({ leaderboards });
}

const createSchema = z.object({
  name: z.string().min(1).max(60),
  slug: z
    .string()
    .min(1)
    .max(40)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().max(300).optional(),
  minStartingBid: z.number().int().positive().default(1),
});

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const board = await prisma.leaderboard.create({
    data: { ...parsed.data, incrementConfig: DEFAULT_INCREMENT_CONFIG },
  });

  await prisma.adminAuditLog.create({
    data: { adminId: session.user!.id!, action: "CREATE_LEADERBOARD", targetType: "Leaderboard", targetId: board.id },
  });

  return NextResponse.json({ ok: true, leaderboard: board });
}
