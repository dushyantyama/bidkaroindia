"use client";

import { useRouter } from "next/navigation";

export function LeaderboardStatusToggle({ id, status }: { id: string; status: "ACTIVE" | "PAUSED" | "ARCHIVED" }) {
  const router = useRouter();

  async function toggle() {
    const next = status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    await fetch(`/api/admin/leaderboards/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    router.refresh();
  }

  return (
    <button onClick={toggle} className="text-xs px-2 py-1 rounded-full bg-white/10 hover:bg-white/20">
      {status === "ACTIVE" ? "Pause" : "Activate"}
    </button>
  );
}
