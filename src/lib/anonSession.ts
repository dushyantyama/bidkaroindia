import crypto from "crypto";
import { cookies } from "next/headers";

/**
 * BidKaroIndia doesn't require an account to browse OR to bid — anyone can
 * claim a @username on the spot and start bidding. To keep "claim a
 * username" from being spoofable (someone setting a cookie to someone
 * else's user id and bidding/editing as them), the cookie carries an HMAC
 * signature over the user id, keyed by NEXTAUTH_SECRET. There's no
 * password and no recovery — losing the cookie means losing the identity,
 * which is an accepted tradeoff for a friction-free, anonymous product.
 *
 * (NextAuth itself is kept around separately, only for the site owner's
 * admin login via Google — see src/lib/auth.ts.)
 */

const COOKIE_NAME = "bki_uid";

function secret(): string {
  const s = process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("NEXTAUTH_SECRET is not set");
  return s;
}

function sign(userId: string): string {
  const mac = crypto.createHmac("sha256", secret()).update(userId).digest("hex");
  return `${userId}.${mac}`;
}

function verify(token: string): string | null {
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;
  const userId = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  const expected = crypto.createHmac("sha256", secret()).update(userId).digest("hex");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return userId;
}

/** Server Components / Route Handlers running in the request's cookie context. */
export async function getAnonUserId(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verify(token);
}

export async function setAnonUserCookie(userId: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, sign(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
}

export async function clearAnonUserCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
