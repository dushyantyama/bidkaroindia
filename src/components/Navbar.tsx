"use client";

import Link from "next/link";
import { useIdentity } from "@/hooks/useIdentity";

export function Navbar() {
  const { identity, loading } = useIdentity();

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-white/5 bg-ink/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between py-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="font-black tracking-tight text-lg">
          🇮🇳 BidKaroIndia
        </Link>
        {!loading && identity && (
          <Link href={`/${identity.username}`} className="text-sm text-white/70 hover:text-white">
            @{identity.username}
          </Link>
        )}
      </div>
    </nav>
  );
}
