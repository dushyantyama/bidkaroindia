import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLeaderboardData } from "@/lib/leaderboardData";
import { getCategoryMeta } from "@/lib/categories";
import { LeaderboardBoard } from "@/components/LeaderboardBoard";
import { ActivityFeed } from "@/components/ActivityFeed";
import { Navbar } from "@/components/Navbar";
import { CategoryNav } from "@/components/CategoryNav";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getLeaderboardData(slug);
  const category = getCategoryMeta(slug);
  const title = data ? `${category.claim} — Who's #1 right now?` : "Leaderboard";
  return { title };
}

export default async function LeaderboardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getLeaderboardData(slug);
  if (!data) notFound();
  const category = getCategoryMeta(slug);

  return (
    <main className="min-h-dvh pb-16">
      <Navbar />
      <section className="max-w-2xl mx-auto text-center pt-10 pb-10 px-4 sm:px-6">
        <p className="text-4xl mb-3">{category.emoji}</p>
        <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight">{category.claim}</h1>
        {category.description && <p className="text-white/50 mt-3 text-sm sm:text-base">{category.description}</p>}
      </section>
      <CategoryNav activeSlug={slug} />
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start mb-12">
        <LeaderboardBoard slug={slug} initialData={data} />
        <div className="lg:sticky lg:top-24">
          <ActivityFeed />
        </div>
      </section>
    </main>
  );
}
