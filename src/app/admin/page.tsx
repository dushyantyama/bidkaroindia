import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatRupees } from "@/lib/currency";
import { CreateLeaderboardForm } from "@/components/admin/CreateLeaderboardForm";
import { LeaderboardStatusToggle } from "@/components/admin/LeaderboardStatusToggle";

export const metadata = { title: "Admin" };

async function getStats() {
  const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
  const [totalUsers, newUsersToday, totalBids, bidsToday, gmv, gmvToday, avgBid, highestBid] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.bid.count(),
    prisma.bid.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.bid.aggregate({ _sum: { amount: true } }),
    prisma.bid.aggregate({ _sum: { amount: true }, where: { createdAt: { gte: startOfDay } } }),
    prisma.bid.aggregate({ _avg: { amount: true } }),
    prisma.bid.aggregate({ _max: { amount: true } }),
  ]);
  return {
    totalUsers,
    newUsersToday,
    totalBids,
    bidsToday,
    totalGmv: gmv._sum.amount ?? 0,
    todayGmv: gmvToday._sum.amount ?? 0,
    averageBid: Math.round(avgBid._avg.amount ?? 0),
    highestBid: highestBid._max.amount ?? 0,
  };
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) redirect("/api/auth/signin?callbackUrl=/admin");

  const [stats, leaderboards] = await Promise.all([getStats(), prisma.leaderboard.findMany({ orderBy: { createdAt: "asc" } })]);

  const cards: [string, string][] = [
    ["Total users", stats.totalUsers.toLocaleString("en-IN")],
    ["New users today", stats.newUsersToday.toLocaleString("en-IN")],
    ["Total bids", stats.totalBids.toLocaleString("en-IN")],
    ["Bids today", stats.bidsToday.toLocaleString("en-IN")],
    ["Total GMV", formatRupees(stats.totalGmv)],
    ["Today's GMV", formatRupees(stats.todayGmv)],
    ["Average bid", formatRupees(stats.averageBid)],
    ["Highest bid", formatRupees(stats.highestBid)],
  ];

  return (
    <main className="min-h-dvh px-4 pb-16 max-w-2xl mx-auto">
      <div className="flex items-center justify-between pt-6 pb-4">
        <h1 className="text-xl font-black">Admin</h1>
        <Link href="/admin/users" className="text-sm text-white/50 hover:text-white">
          Manage users →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-8">
        {cards.map(([label, value]) => (
          <div key={label} className="bg-white/5 rounded-xl p-3">
            <p className="text-xs text-white/40">{label}</p>
            <p className="font-black text-lg">{value}</p>
          </div>
        ))}
      </div>

      <h2 className="text-sm font-bold text-white/50 mb-2">Leaderboards</h2>
      <div className="flex flex-col gap-2 mb-6">
        {leaderboards.map((lb) => (
          <div key={lb.id} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
            <div>
              <p className="font-bold">
                {lb.name} <span className="text-white/30 text-xs">/{lb.slug}</span>
              </p>
              <p className="text-xs text-white/40">
                {formatRupees(lb.currentAmount)} · {lb.status}
              </p>
            </div>
            <LeaderboardStatusToggle id={lb.id} status={lb.status} />
          </div>
        ))}
      </div>

      <CreateLeaderboardForm />
    </main>
  );
}
