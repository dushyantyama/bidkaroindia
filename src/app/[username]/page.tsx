import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicProfile } from "@/lib/userData";
import { formatRupees } from "@/lib/currency";
import { getCategoryMeta } from "@/lib/categories";
import { instagramProfileUrl } from "@/lib/instagram";
import { Navbar } from "@/components/Navbar";
import { ShareButton } from "@/components/ShareButton";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const profile = await getPublicProfile(username);
  if (!profile) return {};

  const claim = profile.leaderboardSlug ? getCategoryMeta(profile.leaderboardSlug).claim : null;
  const title = profile.currentRank === 1 && claim ? `@${profile.username}: "${claim}"` : `@${profile.username} on BidKaroIndia`;
  const description = `Can you outbid @${profile.username}? Currently ${profile.currentAmount ? formatRupees(profile.currentAmount) : "just getting started"}.`;

  return {
    title,
    description,
    openGraph: { title, description, images: [`/api/og/${profile.username}`] },
    twitter: { card: "summary_large_image", title, description, images: [`/api/og/${profile.username}`] },
  };
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const profile = await getPublicProfile(username);
  if (!profile) notFound();

  const claim = profile.leaderboardSlug ? getCategoryMeta(profile.leaderboardSlug).claim : undefined;

  return (
    <main className="min-h-dvh pb-16">
      <Navbar />
      <section className="max-w-sm mx-auto pt-10 px-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center">
          {(() => {
            const avatarImg = profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt={profile.username}
                className="w-20 h-20 rounded-full object-cover mx-auto mb-3 bg-white/10 ring-2 ring-saffron/40"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/10 mx-auto mb-3 flex items-center justify-center text-2xl font-black ring-2 ring-saffron/40">
                {profile.username[0]?.toUpperCase()}
              </div>
            );
            if (!profile.instagram) return avatarImg;
            return (
              <a href={instagramProfileUrl(profile.instagram)} target="_blank" rel="noopener noreferrer nofollow" title="Open on Instagram">
                {avatarImg}
              </a>
            );
          })()}
          <h1 className="text-xl font-black">
            {profile.instagram ? (
              <a href={instagramProfileUrl(profile.instagram)} target="_blank" rel="noopener noreferrer nofollow" className="hover:underline">
                @{profile.username}
              </a>
            ) : (
              `@${profile.username}`
            )}
          </h1>
          {profile.city && <p className="text-white/40 text-sm">{profile.city} 🇮🇳</p>}

          {claim && profile.currentRank === 1 && (
            <p className="mt-4 text-sm font-black text-saffron tracking-wide">&ldquo;{claim}&rdquo;</p>
          )}

          <div className="mt-4">
            <p className="text-xs text-white/40 uppercase tracking-wide">Current rank</p>
            <p className="text-4xl font-black text-saffron">{profile.currentRank ? `#${profile.currentRank}` : "—"}</p>
            {profile.currentAmount !== null && <p className="text-lg font-bold mt-1">{formatRupees(profile.currentAmount)}</p>}
          </div>

          {profile.bidHistory.length > 1 && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-white/40 uppercase tracking-wide mb-2">Bid history</p>
              <p className="text-sm text-white/70">{profile.bidHistory.map((b) => formatRupees(b.amount)).join(" → ")}</p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-white/10 flex flex-col gap-2">
            {profile.instagram && (
              <a
                href={instagramProfileUrl(profile.instagram)}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="w-full bg-gradient-to-r from-fuchsia-500 via-pink-500 to-amber-400 text-white font-black rounded-full py-3 active:scale-95 transition"
              >
                📷 VIEW INSTAGRAM PROFILE
              </a>
            )}
            <ShareButton username={profile.username} amount={profile.currentAmount ?? 0} isTop={profile.currentRank === 1} claim={claim} />
          </div>
        </div>
      </section>
    </main>
  );
}
