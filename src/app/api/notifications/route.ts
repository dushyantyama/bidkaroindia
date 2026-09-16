import { NextResponse } from "next/server";
import { getAnonUserId } from "@/lib/anonSession";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const userId = await getAnonUserId();
  if (!userId) return NextResponse.json({ error: "No identity yet." }, { status: 401 });

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return NextResponse.json({ notifications });
}

export async function PATCH(req: Request) {
  const userId = await getAnonUserId();
  if (!userId) return NextResponse.json({ error: "No identity yet." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : null;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.notification.updateMany({
    where: { id, userId },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
