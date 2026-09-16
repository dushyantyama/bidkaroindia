"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateLeaderboardForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [minStartingBid, setMinStartingBid] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/leaderboards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, minStartingBid }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to create leaderboard.");
      return;
    }
    setName("");
    setSlug("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 bg-white/5 rounded-xl p-4">
      <p className="text-sm font-bold">New leaderboard</p>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name (e.g. Chai)"
        className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm"
      />
      <input
        value={slug}
        onChange={(e) => setSlug(e.target.value.toLowerCase())}
        placeholder="slug (e.g. chai)"
        className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm"
      />
      <input
        type="number"
        value={minStartingBid}
        onChange={(e) => setMinStartingBid(Number(e.target.value))}
        placeholder="Minimum starting bid (₹)"
        className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm"
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <button disabled={saving || !name || !slug} className="bg-saffron text-ink font-bold rounded-lg py-2 text-sm disabled:opacity-40">
        {saving ? "Creating…" : "Create"}
      </button>
    </form>
  );
}
