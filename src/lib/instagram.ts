const HANDLE_PATTERN = /^[a-zA-Z0-9._]{1,30}$/;

/**
 * Accepts a bare handle ("chaiwala"), an @-prefixed handle ("@chaiwala"), or
 * a full profile URL ("https://instagram.com/chaiwala/") and normalizes to
 * the bare handle. Returns null if it doesn't look like a valid handle.
 */
export function normalizeInstagramHandle(raw: string): string | null {
  let value = raw.trim();

  const urlMatch = value.match(/^https?:\/\/(www\.)?instagram\.com\/([^/?#]+)/i);
  if (urlMatch) value = urlMatch[2];

  value = value.replace(/^@/, "");

  if (!HANDLE_PATTERN.test(value)) return null;
  return value;
}

export function instagramProfileUrl(handle: string): string {
  return `https://instagram.com/${handle}`;
}

/**
 * Instagram does not expose profile pictures for arbitrary handles — the Graph
 * API only covers accounts that authorized the app, and unavatar's Instagram
 * provider is paid-only — so anyone without a custom image gets a generated
 * avatar seeded on their handle instead of a blank circle.
 */
export function resolveAvatarUrl(
  username: string,
  avatarUrl?: string | null,
  instagram?: string | null,
  format: "svg" | "png" = "svg",
): string {
  if (avatarUrl) return avatarUrl;

  const seed = encodeURIComponent(instagram || username);
  return `https://api.dicebear.com/9.x/notionists/${format}?seed=${seed}&backgroundColor=ff7a1a,f59e0b,ec4899,8b5cf6&backgroundType=gradientLinear&radius=50`;
}
