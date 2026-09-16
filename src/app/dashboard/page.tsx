import Link from "next/link";
import { getAnonUserId } from "@/lib/anonSession";
import { prisma } from "@/lib/prisma";
import { formatRupees } from "@/lib/currency";
import { timeAgo } from "@/lib/timeAgo";
import { Navbar } from "@/components/Navbar";
import { ProfileEditForm } from "@/components/ProfileEditForm";

export default async function DashboardPage() {
  const userId = await getAnonUserId();

  if (!userId) {
    return (
      <main className="min-h-dvh px-4 pb-16">
        <Navbar />
        <section className="max-w-sm mx-auto pt-16 text-center">
          <p className="text-3xl mb-3">🇮🇳</p>
          <p className="font-black text-xl mb-2">No identity yet</p>
          <p className="text-white/50 text-sm mb-6">Claim a @username by placing your first bid.</p>
          <Link href="/" className="inline-block bg-saffron text-ink font-bold rounded-full px-6 py-3">
            Go bid
          </Link>
        </section>
      </main>
    );
  }

  const [user, notifications, bids] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.bid.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { leaderboard: { select: { name: true, slug: true } } },
    }),
  ]);

  if (!user) {
    return (
      <main className="min-h-dvh px-4 pb-16">
        <Navbar />
        <p className="text-center text-white/50 pt-16">Identity not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-dvh px-4 pb-16">
      <Navbar />
      <section className="max-w-sm mx-auto pt-4">
        <h1 className="text-xl font-black mb-1">@{user.username}</h1>
        <Link href={`/${user.username}`} className="text-xs text-white/40 hover:text-white">
          View public profile →
        </Link>

        <h2 className="text-sm font-bold text-white/50 mt-8 mb-2">Your profile</h2>
        <ProfileEditForm initial={{ city: user.city ?? "", instagram: user.instagram ?? "", avatarUrl: user.avatarUrl ?? "" }} />

        <h2 className="text-sm font-bold text-white/50 mt-8 mb-2">Notifications</h2>
        <div className="flex flex-col gap-2 mb-8">
          {notifications.length === 0 && <p className="text-white/30 text-sm">No notifications yet.</p>}
          {notifications.map((n) => (
            <div key={n.id} className={`rounded-xl p-3 text-sm ${n.readAt ? "bg-white/5" : "bg-saffron/10 border border-saffron/30"}`}>
              <p className="font-bold">{n.title}</p>
              <p className="text-white/60">{n.message}</p>
              <p className="text-white/30 text-xs mt-1">{timeAgo(n.createdAt)}</p>
            </div>
          ))}
        </div>

        <h2 className="text-sm font-bold text-white/50 mb-2">Your bids</h2>
        <div className="flex flex-col gap-2">
          {bids.length === 0 && <p className="text-white/30 text-sm">You haven&apos;t bid yet.</p>}
          {bids.map((b) => (
            <div key={b.id} className="rounded-xl p-3 bg-white/5 flex justify-between gap-2 text-sm">
              <span className="truncate min-w-0">{b.leaderboard.name}</span>
              <span className="font-bold shrink-0">{formatRupees(b.amount)}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
