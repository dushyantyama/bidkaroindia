"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { instagramProfileUrl } from "@/lib/instagram";

type Initial = { city: string; instagram: string; avatarUrl: string };

export function ProfileEditForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [city, setCity] = useState(initial.city);
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    const res = await fetch("/api/identity", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city, avatarUrl }),
    });
    setSaving(false);
    if (!res.ok) {
      setError((await res.json()).error ?? "Failed to save.");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 bg-white/5 rounded-xl p-4">
      {initial.instagram && (
        <div className="flex items-center justify-between bg-black/30 rounded-lg px-3 py-2 mb-1">
          <span className="text-sm">
            📷 Linked to{" "}
            <a href={instagramProfileUrl(initial.instagram)} target="_blank" rel="noopener noreferrer nofollow" className="text-saffron hover:underline">
              @{initial.instagram}
            </a>
          </span>
          <span className="text-xs text-white/30">locked</span>
        </div>
      )}
      <label className="text-xs text-white/40">City</label>
      <input
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="e.g. Ahmedabad"
        className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm"
      />
      <label className="text-xs text-white/40 mt-1">Logo / avatar image URL (optional)</label>
      <input
        value={avatarUrl}
        onChange={(e) => setAvatarUrl(e.target.value)}
        placeholder="https://example.com/logo.png"
        className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm"
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <button disabled={saving} className="bg-white text-ink font-bold rounded-lg py-2 text-sm mt-1 disabled:opacity-40">
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save"}
      </button>
    </form>
  );
}
