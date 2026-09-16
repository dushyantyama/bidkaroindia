export type LeaderboardRow = {
  rank: number;
  username: string;
  avatarUrl: string | null;
  instagram: string | null;
  city: string | null;
  amount: number;
  bidAt: string;
};

export type LeaderboardResponse = {
  leaderboard: {
    name: string;
    slug: string;
    currentAmount: number;
    minNextBid: number;
  };
  rows: LeaderboardRow[];
  momentum: { bidsLastHour: number; topChangesToday: number };
};
