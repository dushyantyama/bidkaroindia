"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useActivityFeed } from "@/hooks/useActivityFeed";
import { formatRupees } from "@/lib/currency";
import { InstagramHandle } from "@/components/InstagramHandle";
import { Avatar } from "@/components/Avatar";

const VERBS: Record<string, (username: string, amount: number) => string> = {
  NEW_TOP: (u, a) => `just took #1 — ${formatRupees(a)}`,
  ENTERED: (u, a) => `entered the leaderboard at ${formatRupees(a)}`,
  MOVED: (u, a) => `moved up with ${formatRupees(a)}`,
  OUTBID: () => `was OUTBID`,
};

export function ActivityFeed() {
  const events = useActivityFeed(15);

  return (
    <div className="w-full">
      <p className="text-xs font-bold text-white/50 mb-2 px-1 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" /> LIVE
      </p>
      <div className="flex flex-col gap-1 max-h-64 lg:max-h-[calc(100dvh-180px)] overflow-y-auto scrollbar-none">
        <AnimatePresence initial={false}>
          {events.map((e) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm px-3 py-2 rounded-xl bg-white/5 flex items-start gap-2"
            >
              <Avatar username={e.username} instagram={e.instagram} size="xs" />
              <p className="min-w-0">
                <InstagramHandle username={e.username} instagram={e.instagram} className="font-bold" />{" "}
                <span className="text-white/60">{(VERBS[e.type] ?? VERBS.MOVED)(e.username, e.amount)}</span>
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
        {events.length === 0 && <p className="text-white/30 text-sm px-3 py-4">Waiting for the first move…</p>}
      </div>
    </div>
  );
}
