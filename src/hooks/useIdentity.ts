"use client";

import { useCallback, useEffect, useState } from "react";

export type Identity = {
  username: string;
  city: string | null;
  instagram: string | null;
  avatarUrl: string | null;
} | null;

/** Reads the caller's anonymous bidder identity (see src/lib/anonSession.ts). */
export function useIdentity() {
  const [identity, setIdentity] = useState<Identity>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/identity");
    const data = await res.json();
    setIdentity(data.identity ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { identity, loading, refresh };
}
