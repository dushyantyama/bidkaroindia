"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type AdminUser = {
  id: string;
  username: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  isAdmin: boolean;
  isBanned: boolean;
  isVerified: boolean;
};

export default function AdminUsersPage() {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/users${q ? `?q=${encodeURIComponent(q)}` : ""}`);
    if (res.ok) setUsers((await res.json()).users);
    setLoading(false);
  }, [q]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  async function act(userId: string, action: "ban" | "unban" | "verify" | "unverify") {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action }),
    });
    load();
  }

  return (
    <main className="min-h-dvh px-4 pb-16 max-w-2xl mx-auto">
      <div className="flex items-center justify-between pt-6 pb-4">
        <h1 className="text-xl font-black">Users</h1>
        <Link href="/admin" className="text-sm text-white/50 hover:text-white">
          ← Back
        </Link>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by username, email or phone…"
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-4 outline-none focus:border-saffron"
      />

      {loading && <p className="text-white/30 text-sm">Loading…</p>}

      <div className="flex flex-col gap-2">
        {users.map((u) => (
          <div key={u.id} className="flex items-center justify-between gap-2 bg-white/5 rounded-xl p-3">
            <div className="min-w-0">
              <p className="font-bold flex items-center gap-2 truncate">
                @{u.username}
                {u.isVerified && <span className="text-saffron text-xs shrink-0">✓</span>}
                {u.isBanned && <span className="text-red-400 text-xs shrink-0">banned</span>}
              </p>
              <p className="text-xs text-white/40 truncate">{u.email ?? u.phone ?? "—"}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => act(u.id, u.isVerified ? "unverify" : "verify")}
                className="text-xs px-2 py-1 rounded-full bg-white/10 hover:bg-white/20"
              >
                {u.isVerified ? "Unverify" : "Verify"}
              </button>
              <button
                onClick={() => act(u.id, u.isBanned ? "unban" : "ban")}
                className="text-xs px-2 py-1 rounded-full bg-white/10 hover:bg-white/20"
              >
                {u.isBanned ? "Unban" : "Ban"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
