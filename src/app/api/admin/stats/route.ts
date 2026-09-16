import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));

  const [totalUsers, newUsersToday, totalBids, bidsToday, gmv, gmvToday, avgBid, highestBid, activeUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.bid.count(),
    prisma.bid.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.bid.aggregate({ _sum: { amount: true } }),
    prisma.bid.aggregate({ _sum: { amount: true }, where: { createdAt: { gte: startOfDay } } }),
    prisma.bid.aggregate({ _avg: { amount: true } }),
    prisma.bid.aggregate({ _max: { amount: true } }),
    prisma.bid.groupBy({ by: ["userId"], where: { createdAt: { gte: startOfDay } } }),
  ]);

  return NextResponse.json({
    totalUsers,
    newUsersToday,
    totalBids,
    bidsToday,
    totalGmv: gmv._sum.amount ?? 0,
    todayGmv: gmvToday._sum.amount ?? 0,
    averageBid: Math.round(avgBid._avg.amount ?? 0),
    highestBid: highestBid._max.amount ?? 0,
    activeUsersToday: activeUsers.length,
  });
}
