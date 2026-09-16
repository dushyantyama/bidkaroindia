import { prisma } from "@/lib/prisma";

export async function getPublicProfile(usernameRaw: string) {
  const username = usernameRaw.replace(/^@/, "");
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      username: true,
      displayName: true,
      avatarUrl: true,
      instagram: true,
      city: true,
      createdAt: true,
      bids: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { amount: true, createdAt: true, leaderboard: { select: { slug: true, name: true } } },
      },
    },
  });
  if (!user) return null;

  const bestBid = user.bids.length ? user.bids.reduce((max, b) => (b.amount > max.amount ? b : max), user.bids[0]) : null;

  let rank: number | null = null;
  if (bestBid) {
    const grouped = await prisma.bid.groupBy({
      by: ["userId"],
      _max: { amount: true },
      where: { leaderboard: { slug: bestBid.leaderboard.slug } },
    });
    const ranked = grouped.map((g) => g._max.amount ?? 0).sort((a, b) => b - a);
    rank = ranked.findIndex((a) => a <= bestBid.amount) + 1 || ranked.length + 1;
  }

  return {
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    instagram: user.instagram,
    city: user.city,
    memberSince: user.createdAt.toISOString(),
    currentRank: rank,
    currentAmount: bestBid?.amount ?? null,
    leaderboardSlug: bestBid?.leaderboard.slug ?? null,
    bidHistory: user.bids.map((b) => ({ amount: b.amount, at: b.createdAt.toISOString(), leaderboard: b.leaderboard.slug })).reverse(),
  };
}
