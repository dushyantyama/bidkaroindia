import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

const updateSchema = z.object({
  name: z.string().min(1).max(60).optional(),
  description: z.string().max(300).optional(),
  status: z.enum(["ACTIVE", "PAUSED", "ARCHIVED"]).optional(),
  minStartingBid: z.number().int().positive().optional(),
  incrementConfig: z
    .array(z.object({ upTo: z.number().int().positive().nullable(), increment: z.number().int().positive() }))
    .optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const board = await prisma.leaderboard.update({ where: { id }, data: parsed.data });

  await prisma.adminAuditLog.create({
    data: {
      adminId: session.user!.id!,
      action: "UPDATE_LEADERBOARD",
      targetType: "Leaderboard",
      targetId: board.id,
      details: parsed.data,
    },
  });

  return NextResponse.json({ ok: true, leaderboard: board });
}
