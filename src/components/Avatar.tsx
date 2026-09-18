"use client";

import { useState } from "react";
import { resolveAvatarUrl, instagramProfileUrl } from "@/lib/instagram";

const SIZES = {
  xs: { box: "w-6 h-6", initial: "text-[10px]", badge: "w-2.5 h-2.5 text-[6px]" },
  sm: { box: "w-11 h-11", initial: "text-sm", badge: "w-4 h-4 text-[8px]" },
  lg: { box: "w-20 h-20", initial: "text-2xl", badge: "w-6 h-6 text-[11px]" },
};

export function Avatar({
  username,
  avatarUrl,
  instagram,
  size = "sm",
  ring = false,
  link = true,
}: {
  username: string;
  avatarUrl?: string | null;
  instagram?: string | null;
  size?: keyof typeof SIZES;
  ring?: boolean;
  link?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const s = SIZES[size];

  const src = resolveAvatarUrl(username, avatarUrl, instagram);
  const ringClass = ring ? "ring-2 ring-saffron/40" : "";

  const face =
    !failed ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={`@${username}`}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`${s.box} ${ringClass} rounded-full object-cover bg-white/10`}
      />
    ) : (
      <span className={`${s.box} ${s.initial} ${ringClass} rounded-full bg-white/10 flex items-center justify-center font-black`}>
        {username[0]?.toUpperCase()}
      </span>
    );

  const inner = (
    <span className={`relative inline-flex shrink-0 ${s.box}`}>
      {face}
      {instagram && (
        <span
          aria-hidden
          className={`absolute -bottom-0.5 -right-0.5 ${s.badge} rounded-full ring-2 ring-ink flex items-center justify-center bg-gradient-to-tr from-amber-400 via-pink-500 to-fuchsia-600`}
        >
          📷
        </span>
      )}
    </span>
  );

  if (!link || !instagram) return inner;

  return (
    <a
      href={instagramProfileUrl(instagram)}
      target="_blank"
      rel="noopener noreferrer nofollow"
      title={`Open @${instagram} on Instagram`}
      onClick={(e) => e.stopPropagation()}
      className="shrink-0"
    >
      {inner}
    </a>
  );
}
