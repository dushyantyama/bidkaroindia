import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { validateUsername } from "@/lib/username";
import { normalizeInstagramHandle } from "@/lib/instagram";
import { getAnonUserId, setAnonUserCookie, clearAnonUserCookie } from "@/lib/anonSession";

export async function GET() {
  const userId = await getAnonUserId();
  if (!userId) return NextResponse.json({ identity: null });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true, city: true, instagram: true, avatarUrl: true, isAdmin: true, isBanned: true },
  });
  if (!user || user.isBanned) return NextResponse.json({ identity: null });

  return NextResponse.json({ identity: user });
}

const avatarSchema = z
  .string()
  .trim()
  .url()
  .max(300)
  .refine((u) => u.startsWith("https://") || u.startsWith("http://"), { message: "Must be a valid URL" });

const claimSchema = z.object({
  instagram: z.string().min(1),
  city: z.string().max(60).optional(),
  avatarUrl: avatarSchema.optional().or(z.literal("")),
});

/**
 * Claims a bidder identity FROM an Instagram handle — the handle becomes
 * both the site @username and the linked Instagram profile, so every place
 * that shows this user can link straight to their real Instagram.
 */
export async function POST(req: Request) {
  const existing = await getAnonUserId();
  if (existing) {
    const user = await prisma.user.findUnique({ where: { id: existing } });
    if (user) return NextResponse.json({ error: "You've already claimed a username." }, { status: 409 });
  }

  const parsed = claimSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const handle = normalizeInstagramHandle(parsed.data.instagram);
  if (!handle) return NextResponse.json({ error: "That doesn't look like a valid Instagram handle." }, { status: 400 });

  const result = validateUsername(handle);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  const taken = await prisma.user.findFirst({
    where: { username: { equals: result.username, mode: "insensitive" } },
  });
  if (taken) return NextResponse.json({ error: "That handle is already claimed here." }, { status: 409 });

  const user = await prisma.user.create({
    data: {
      username: result.username,
      instagram: result.username,
      city: parsed.data.city || undefined,
      avatarUrl: parsed.data.avatarUrl || undefined,
    },
  });

  await setAnonUserCookie(user.id);

  return NextResponse.json({
    ok: true,
    identity: { username: user.username, city: user.city, instagram: user.instagram, avatarUrl: user.avatarUrl },
  });
}

const updateSchema = z.object({
  city: z.string().max(60).optional(),
  avatarUrl: avatarSchema.optional().or(z.literal("")),
});

/**
 * Updates optional profile fields (city / logo). The Instagram handle is
 * locked in at claim time since it IS the @username — changing it would
 * mean renaming the account and breaking existing share links.
 */
export async function PATCH(req: Request) {
  const userId = await getAnonUserId();
  if (!userId) return NextResponse.json({ error: "Claim a username first." }, { status: 401 });

  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      city: parsed.data.city ?? undefined,
      avatarUrl: parsed.data.avatarUrl === "" ? null : parsed.data.avatarUrl,
    },
  });

  return NextResponse.json({
    ok: true,
    identity: { username: user.username, city: user.city, instagram: user.instagram, avatarUrl: user.avatarUrl },
  });
}

export async function DELETE() {
  await clearAnonUserCookie();
  return NextResponse.json({ ok: true });
}
