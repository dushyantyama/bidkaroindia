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
