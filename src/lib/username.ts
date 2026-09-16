const RESERVED = new Set([
  "admin",
  "support",
  "india",
  "official",
  "outbid",
  "bidkaro",
  "bidkaroindia",
  "system",
  "root",
  "api",
  "www",
  "help",
  "settings",
  "login",
  "logout",
  "dashboard",
  "leaderboard",
  "activity",
  "out",
]);

// A small starter list — extend with a proper profanity-filter package before launch.
const BLOCKED_SUBSTRINGS = ["fuck", "madarchod", "bhosdi", "randi", "chutiya"];

// Matches Instagram's own handle rules since a BidKaroIndia username IS the
// bidder's Instagram handle (letters, numbers, periods, underscores).
const USERNAME_PATTERN = /^[a-zA-Z0-9._]{1,30}$/;

export function validateUsername(raw: string): { ok: true; username: string } | { ok: false; error: string } {
  const username = raw.trim().replace(/^@/, "");

  if (!USERNAME_PATTERN.test(username)) {
    return { ok: false, error: "That doesn't look like a valid Instagram handle." };
  }
  const lower = username.toLowerCase();
  if (RESERVED.has(lower)) {
    return { ok: false, error: "That username is reserved." };
  }
  if (BLOCKED_SUBSTRINGS.some((bad) => lower.includes(bad))) {
    return { ok: false, error: "That username isn't allowed." };
  }
  return { ok: true, username };
}
