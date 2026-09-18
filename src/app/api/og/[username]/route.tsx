import { ImageResponse } from "next/og";
import { getPublicProfile } from "@/lib/userData";
import { formatRupees } from "@/lib/currency";
import { getCategoryMeta } from "@/lib/categories";
import { resolveAvatarUrl } from "@/lib/instagram";

export const runtime = "nodejs";

/**
 * Inlined as a data URI rather than passed as a URL: Satori fetches remote
 * images while rendering, and a slow or 404ing avatar would fail the whole
 * share card instead of just dropping the picture.
 */
async function resolveAvatarDataUri(username: string, avatarUrl: string | null, instagram: string | null): Promise<string | null> {
  const url = resolveAvatarUrl(username, avatarUrl, instagram, "png");

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !type.startsWith("image/")) return null;
    const bytes = Buffer.from(await res.arrayBuffer());
    return `data:${type};base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function GET(_req: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username: rawUsername } = await params;
  const profile = await getPublicProfile(rawUsername);

  const username = rawUsername.replace(/^@/, "");
  const amount = profile?.currentAmount ?? 0;
  const isTop = profile?.currentRank === 1;
  const category = profile?.leaderboardSlug ? getCategoryMeta(profile.leaderboardSlug) : null;

  const headline = isTop && category ? category.claim : profile?.currentRank ? `I'M #${profile.currentRank}` : "ON THE LEADERBOARD";
  const avatar = await resolveAvatarDataUri(username, profile?.avatarUrl ?? null, profile?.instagram ?? null);

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
          <div style={{ display: "flex", alignItems: "center", fontSize: 40, opacity: 0.85, gap: 20 }}>
            {avatar && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatar}
                alt=""
                width={88}
                height={88}
                style={{ width: 88, height: 88, borderRadius: 44, objectFit: "cover", border: "3px solid #ff7a1a" }}
              />
            )}
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
