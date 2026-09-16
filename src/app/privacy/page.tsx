export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <main className="min-h-dvh px-4 pb-16 max-w-lg mx-auto pt-10 prose prose-invert prose-sm">
      <h1 className="text-2xl font-black mb-4">Privacy Policy</h1>
      <p className="text-white/70">
        We collect the minimum data needed to run the leaderboard: your username, city (optional), phone or email
        used to sign in, your bid history, and payment metadata (never full card details — those are handled entirely
        by our payment provider).
      </p>
      <h2 className="font-bold mt-6">What's public</h2>
      <p className="text-white/70">
        Your username, city, current rank, and bid amounts are public by design — this is a public leaderboard.
        Your phone number and email are never shown publicly.
      </p>
      <h2 className="font-bold mt-6">What we don't do</h2>
      <p className="text-white/70">We don't sell your personal data to third parties.</p>
      <h2 className="font-bold mt-6">Contact</h2>
      <p className="text-white/70">For data requests, contact us via the details on our support page.</p>
    </main>
  );
}
