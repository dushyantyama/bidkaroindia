"use client";

import { useEffect, useState } from "react";
import { formatRupees } from "@/lib/currency";
import { OutbidModal } from "@/components/OutbidModal";
import { InstagramHandle } from "@/components/InstagramHandle";
import type { LeaderboardResponse } from "@/types/leaderboard";

type Profile = {
  username: string;
  instagram: string | null;
  currentRank: number | null;
  currentAmount: number | null;
  leaderboardSlug: string | null;
};

export function OutbidLanding({ profile, board, referrer }: { profile: Profile; board: LeaderboardResponse | null; referrer: string | null }) {
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!referrer) return;
    fetch("/api/referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referrerUsername: referrer, referredUsername: profile.username }),
    }).catch(() => {});
  }, [referrer, profile.username]);

  const slug = profile.leaderboardSlug ?? "india";

  return (
    <section className="max-w-sm mx-auto pt-10 text-center">
      <p className="text-4xl mb-3">🔥</p>
      <h1 className="text-2xl font-black mb-2">
        <InstagramHandle username={profile.username} instagram={profile.instagram} /> is currently{" "}
        {profile.currentRank === 1 ? "#1" : `#${profile.currentRank ?? "—"}`}
      </h1>
      <p className="text-white/50 mb-1">Current bid</p>
      <p className="text-4xl font-black text-saffron mb-6">{formatRupees(profile.currentAmount ?? 0)}</p>
      <p className="text-white/70 mb-6">Think you can beat them?</p>

      <button onClick={() => setModalOpen(true)} className="w-full bg-saffron text-ink font-black rounded-full py-4">
        OUTBID @{profile.username.toUpperCase()}
      </button>

      {board && (
        <OutbidModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          leaderboardSlug={slug}
          currentTopUsername={board.rows[0]?.username ?? null}
          currentAmount={board.leaderboard.currentAmount}
          minNextBid={board.leaderboard.minNextBid}
          onSuccess={() => {}}
        />
      )}
    </section>
  );
}
