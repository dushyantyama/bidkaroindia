import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

export function CategoryNav({ activeSlug }: { activeSlug: string }) {
  return (
    <div className="w-full max-w-6xl mx-auto overflow-x-auto scrollbar-none px-4 sm:px-6 lg:px-8 mb-6">
      <div className="flex gap-2 w-max lg:w-full lg:flex-wrap">
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={c.slug === "india" ? "/" : `/leaderboard/${c.slug}`}
            className={`shrink-0 text-sm font-semibold rounded-full px-4 py-2 border transition-colors ${
              c.slug === activeSlug ? "bg-saffron text-ink border-saffron" : "bg-white/5 border-white/10 text-white/70 hover:text-white"
            }`}
          >
            {c.emoji} {c.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
