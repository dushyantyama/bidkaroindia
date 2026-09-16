import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

export async function GET(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const q = new URL(req.url).searchParams.get("q")?.trim();
  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { username: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, username: true, email: true, phone: true, city: true, isAdmin: true, isBanned: true, isVerified: true, createdAt: true },
  });

  return NextResponse.json({ users });
}

const actionSchema = z.object({
  userId: z.string(),
  action: z.enum(["ban", "unban", "verify", "unverify"]),
});

export async function PATCH(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = actionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { userId, action } = parsed.data;
  const data =
    action === "ban" ? { isBanned: true } : action === "unban" ? { isBanned: false } : action === "verify" ? { isVerified: true } : { isVerified: false };

  const user = await prisma.user.update({ where: { id: userId }, data });

  await prisma.adminAuditLog.create({
    data: { adminId: session.user!.id!, action: action.toUpperCase(), targetType: "User", targetId: user.id },
  });

  return NextResponse.json({ ok: true, user });
}
