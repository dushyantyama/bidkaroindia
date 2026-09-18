"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { formatRupees } from "@/lib/currency";
import { timeAgo } from "@/lib/timeAgo";
import { useActivityFeed } from "@/hooks/useActivityFeed";
import { useIdentity } from "@/hooks/useIdentity";
import { OutbidModal } from "@/components/OutbidModal";
import { InstagramHandle } from "@/components/InstagramHandle";
import { Avatar } from "@/components/Avatar";
import type { LeaderboardResponse } from "@/types/leaderboard";

const MEDALS = ["🥇", "🥈", "🥉"];

export function LeaderboardBoard({ slug, initialData }: { slug: string; initialData: LeaderboardResponse }) {
  const { identity } = useIdentity();
  const [data, setData] = useState(initialData);
  const [modalOpen, setModalOpen] = useState(false);
  const events = useActivityFeed(5);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/leaderboard/${slug}`, { cache: "no-store" });
    if (res.ok) setData(await res.json());
  }, [slug]);

  useEffect(() => {
    if (events.some((e) => e.leaderboardSlug === slug)) {
      refresh();
    }
  }, [events, slug, refresh]);

  const myUsername = identity?.username;
  const top = data.rows[0];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="font-black text-lg tracking-tight">{data.leaderboard.name}</h2>
        <button onClick={refresh} className="text-xs text-white/50 hover:text-white flex items-center gap-1">
          ↻ Refresh
        </button>
      </div>

      {(data.momentum.bidsLastHour > 0 || data.momentum.topChangesToday > 0) && (
        <p className="text-xs text-saffron/90 mb-3 px-1">
          🔥 {data.momentum.bidsLastHour} bids in the last hour · #1 changed {data.momentum.topChangesToday}x today
        </p>
      )}

      <LayoutGroup>
        <div className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {data.rows.map((row) => (
              <motion.div
                layout
                key={row.username}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", damping: 24, stiffness: 260 }}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 border ${
                  row.rank === 1
                    ? "bg-gradient-to-r from-saffron/20 to-transparent border-saffron/40"
                    : "bg-white/5 border-white/10"
                } ${row.username === myUsername ? "ring-1 ring-white/40" : ""}`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="w-8 text-center text-lg font-black text-white/70 shrink-0">
                    {MEDALS[row.rank - 1] ?? `#${row.rank}`}
                  </span>
                  <Avatar
                    username={row.username}
                    avatarUrl={row.avatarUrl}
                    instagram={row.instagram}
                    size="sm"
                    ring={row.rank === 1}
                  />
                  <div className="min-w-0">
                    <p className="font-bold leading-tight truncate">
                      <InstagramHandle username={row.username} instagram={row.instagram} />{" "}
                      {row.username === myUsername && <span className="text-xs text-white/40">(you)</span>}
                    </p>
                    <p className="text-xs text-white/40 truncate">
                      {[row.instagram && row.instagram !== row.username ? `@${row.instagram}` : null, row.city, timeAgo(row.bidAt)]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </div>
                <p className={`font-black shrink-0 pl-2 ${row.rank === 1 ? "text-saffron text-lg" : ""}`}>{formatRupees(row.amount)}</p>
              </motion.div>
            ))}
          </AnimatePresence>

          {data.rows.length === 0 && (
            <div className="text-center py-10">
              <p className="text-3xl mb-2">🇮🇳</p>
              <p className="font-black text-xl mb-1">BE THE FIRST #1</p>
              <p className="text-white/50 text-sm">Nobody owns the top spot yet. You could.</p>
            </div>
          )}
        </div>
      </LayoutGroup>

      <div className="mt-6 sticky bottom-4">
        <button
          onClick={() => setModalOpen(true)}
          className="w-full bg-saffron text-ink font-black rounded-full py-4 shadow-lg shadow-saffron/20 active:scale-95 transition"
        >
          {data.rows.length === 0 ? "CLAIM #1" : `OUTBID #1 — ${formatRupees(data.leaderboard.minNextBid)}`}
        </button>
      </div>

      <OutbidModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        leaderboardSlug={slug}
        currentTopUsername={top?.username ?? null}
        currentAmount={data.leaderboard.currentAmount}
        minNextBid={data.leaderboard.minNextBid}
        onSuccess={() => refresh()}
      />
    </div>
  );
}
