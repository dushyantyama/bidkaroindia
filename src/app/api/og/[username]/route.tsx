import { ImageResponse } from "next/og";
import { getPublicProfile } from "@/lib/userData";
import { formatRupees } from "@/lib/currency";
import { getCategoryMeta } from "@/lib/categories";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username: rawUsername } = await params;
  const profile = await getPublicProfile(rawUsername);

  const username = rawUsername.replace(/^@/, "");
  const amount = profile?.currentAmount ?? 0;
  const isTop = profile?.currentRank === 1;
  const category = profile?.leaderboardSlug ? getCategoryMeta(profile.leaderboardSlug) : null;

  const headline = isTop && category ? category.claim : profile?.currentRank ? `I'M #${profile.currentRank}` : "ON THE LEADERBOARD";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 32, letterSpacing: 2 }}>
          🇮🇳 BIDKAROINDIA.LOL
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", fontSize: category ? 56 : 64, fontWeight: 800, color: "#ff7a1a", maxWidth: 1000 }}>
            {headline}
          </div>
          <div style={{ display: "flex", fontSize: 96, fontWeight: 900 }}>{formatRupees(amount)}</div>
          <div style={{ display: "flex", fontSize: 40, opacity: 0.85, gap: 16 }}>
            <span>@{username}</span>
            {profile?.instagram && <span style={{ opacity: 0.6 }}>📷 @{profile.instagram}</span>}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 30, opacity: 0.7 }}>Can you outbid me? → bidkaroindia.lol/@{username}</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
