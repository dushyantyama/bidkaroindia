/** Indian-locale rupee formatting, e.g. 2500001 -> "₹25,00,001" */
export function formatRupees(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

export type IncrementTier = { upTo: number | null; increment: number };

export const DEFAULT_INCREMENT_CONFIG: IncrementTier[] = [
  { upTo: 999, increment: 1 },
  { upTo: 9999, increment: 10 },
  { upTo: null, increment: 100 },
];

/** Given the current top amount and a leaderboard's configured tiers, return the minimum amount a new bid must reach. */
export function computeMinNextBid(
  currentAmount: number,
  tiers: IncrementTier[] = DEFAULT_INCREMENT_CONFIG,
  minStartingBid = 1
): number {
  if (currentAmount <= 0) return minStartingBid;
  const sorted = [...tiers].sort((a, b) => {
    if (a.upTo === null) return 1;
    if (b.upTo === null) return -1;
    return a.upTo - b.upTo;
  });
  const tier = sorted.find((t) => t.upTo === null || currentAmount <= t.upTo) ?? sorted[sorted.length - 1];
  return currentAmount + tier.increment;
}
