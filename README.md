# BidKaroIndia 🇮🇳

> Who deserves the top spot?

India's chaotic, pay-to-outrank public leaderboard. Domain: **bidkaroindia.lol**

## Stack

- Next.js 16 (App Router, TypeScript, Turbopack) — frontend + API routes in one app
- PostgreSQL via Prisma
- NextAuth (Google OAuth + a dev-only phone "OTP" stub)
- Supabase Realtime for live activity broadcasting (see note below)
- Payments abstracted behind a swappable provider interface (Razorpay implementation included but not active yet)

## Local setup

1. `npm install`
2. Copy `.env.example` to `.env` if you haven't already (already done for you) and fill in real values as needed. Defaults assume a local Postgres database named `bidkaroindia` with user/pass `postgres`/`postgres` on port 5432.
3. `npm run db:push` — syncs the Prisma schema to your database.
4. `npm run db:seed` — creates the default "India" leaderboard and grants admin access to `yash.yamatech@gmail.com` (sign in with Google using that address to reach `/admin`).
5. `npm run dev` — starts the app (falls back to another port if 3000 is busy).

## What's real vs. stubbed right now

Per current build scope, this is a **full-stack app with no live payment gateway wired up yet**:

- **Bidding, leaderboard, concurrency safety, notifications, auth, admin** — all real, backed by Postgres, tested end-to-end.
- **Payments** — `PAYMENTS_PROVIDER=simulated` (default) auto-approves every "payment" so the full order → verify → confirm-bid architecture can be exercised without a merchant account. Flip to `PAYMENTS_PROVIDER=razorpay` and set the `RAZORPAY_*` env vars once you have Razorpay keys — `src/lib/payments/razorpayProvider.ts` is ready, including webhook signature verification. No other code needs to change.
- **Phone OTP** — accepts any phone number as long as the code matches `DEV_OTP_BYPASS_CODE` in `.env`. There's no SMS provider wired up. Swap `src/lib/auth.ts`'s `phone-otp` provider for MSG91/Twilio before launch.
- **Live activity** — broadcasts over Supabase Realtime (`src/lib/eventBus.ts` publishes via the REST broadcast endpoint, `src/hooks/useActivityFeed.ts` subscribes client-side), so it works across Vercel's serverless instances. The Supabase URL/publishable key are hardcoded in `src/lib/eventBus.ts` (they're public, client-exposed values, not secrets).
- **Email notifications** — not implemented; only in-app notifications exist today (`Notification` table + `/dashboard`).

## Key architecture notes

- **Concurrency-safe bidding** (`src/lib/bidding.ts`): every bid takes a `SELECT ... FOR UPDATE` row lock on the leaderboard inside a transaction, so two simultaneous outbid attempts can never both win — the loser gets a `TOO_LOW` error naming the new minimum.
- **Bid increments** are configurable per leaderboard via the admin panel (`incrementConfig` JSON tiers), not hardcoded in the frontend — see `src/lib/currency.ts`.
- **Money safety**: the frontend never confirms a bid. `/api/bids` always re-validates server-side against the current DB state regardless of what the client sends.

## Structure

```
src/app/            Pages + API routes (App Router)
src/components/      Client UI components
src/lib/             Core logic: auth, bidding, payments, currency, events
prisma/schema.prisma Database schema
```
