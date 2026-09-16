import Link from "next/link";
import { getLeaderboardData } from "@/lib/leaderboardData";
import { LeaderboardBoard } from "@/components/LeaderboardBoard";
import { ActivityFeed } from "@/components/ActivityFeed";
import { Navbar } from "@/components/Navbar";
import { CategoryNav } from "@/components/CategoryNav";
import { formatRupees } from "@/lib/currency";

const MAIN_SLUG = "india";

export default async function HomePage() {
  const data = await getLeaderboardData(MAIN_SLUG);

  return (
    <main className="min-h-dvh pb-16">
      <Navbar />

      <section className="max-w-2xl mx-auto text-center pt-10 pb-10 px-4 sm:px-6">
        <p className="text-4xl mb-3">🇮🇳</p>
        <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight">
          WHO DESERVES
          <br />
          THE TOP SPOT?
        </h1>
        <p className="text-white/50 mt-3 text-sm sm:text-base">India&apos;s most chaotic leaderboard.</p>
        {data && (
          <p className="mt-4 text-sm sm:text-base text-white/70">
            {data.rows[0] ? (
              <>
                <span className="font-bold">@{data.rows[0].username}</span> owns #1 with{" "}
                <span className="font-bold text-saffron">{formatRupees(data.rows[0].amount)}</span>. For now.
              </>
            ) : (
              "Nobody owns #1 yet. It could be you."
            )}
          </p>
        )}
      </section>

      <CategoryNav activeSlug={MAIN_SLUG} />

      {data ? (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start mb-12">
          <LeaderboardBoard slug={MAIN_SLUG} initialData={data} />
          <div className="lg:sticky lg:top-24">
            <ActivityFeed />
          </div>
        </section>
      ) : (
        <p className="text-center text-white/50">Leaderboard is warming up. Check back shortly.</p>
      )}

      <footer className="max-w-6xl mx-auto mt-4 text-center text-xs text-white/30 space-x-3 px-4 sm:px-6 lg:px-8">
        <Link href="/terms">Terms</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/refund-policy">Refunds</Link>
        <Link href="/responsible-use">Responsible Use</Link>
      </footer>
    </main>
  );
}
