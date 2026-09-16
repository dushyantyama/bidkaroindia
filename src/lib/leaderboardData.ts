import { prisma } from "@/lib/prisma";
import { computeMinNextBid, type IncrementTier } from "@/lib/currency";
import type { LeaderboardResponse } from "@/types/leaderboard";

export async function getLeaderboardData(slug: string): Promise<LeaderboardResponse | null> {
  const board = await prisma.leaderboard.findUnique({ where: { slug } });
  if (!board) return null;

  const bids = await prisma.bid.findMany({
    where: { leaderboardId: board.id },
    orderBy: [{ amount: "desc" }, { createdAt: "asc" }],
    distinct: ["userId"],
    take: 50,
    include: { user: { select: { username: true, avatarUrl: true, instagram: true, city: true } } },
  });

  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const bidsLastHour = await prisma.bid.count({ where: { leaderboardId: board.id, createdAt: { gte: hourAgo } } });
  const topChangesToday = await prisma.leaderboardEvent.count({
    where: {
      leaderboardId: board.id,
      eventType: "NEW_TOP",
      createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    },
  });

  return {
    leaderboard: {
      name: board.name,
      slug: board.slug,
      currentAmount: board.currentAmount,
      minNextBid: computeMinNextBid(board.currentAmount, board.incrementConfig as unknown as IncrementTier[], board.minStartingBid),
    },
    rows: bids.map((b, i) => ({
      rank: i + 1,
      username: b.user.username,
      avatarUrl: b.user.avatarUrl,
      instagram: b.user.instagram,
      city: b.user.city,
      amount: b.amount,
      bidAt: b.createdAt.toISOString(),
    })),
    momentum: { bidsLastHour, topChangesToday },
  };
}
