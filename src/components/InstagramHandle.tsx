import { instagramProfileUrl } from "@/lib/instagram";

/**
 * Renders "@username" — as a link straight to their real Instagram profile
 * when one is on file (true for every account claimed since usernames
 * became Instagram handles), with a small 📷 badge so it's obvious this
 * links out to a real person, not just an internal page.
 */
export function InstagramHandle({ username, instagram, className }: { username: string; instagram?: string | null; className?: string }) {
  if (!instagram) return <span className={className}>@{username}</span>;

  return (
    <a
      href={instagramProfileUrl(instagram)}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className={`${className ?? ""} hover:underline decoration-saffron underline-offset-2 inline-flex items-center gap-1`}
      title={`Open @${instagram} on Instagram`}
    >
      @{username} <span className="text-saffron">📷</span>
    </a>
  );
}
