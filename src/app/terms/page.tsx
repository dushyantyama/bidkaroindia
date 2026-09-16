export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <main className="min-h-dvh px-4 pb-16 max-w-lg mx-auto pt-10 prose prose-invert prose-sm">
      <h1 className="text-2xl font-black mb-4">Terms of Service</h1>
      <p className="text-white/70">
        BidKaroIndia ("we", "us") operates bidkaroindia.lol, a public leaderboard where users pay to increase their
        visibility and ranking position. By using this site you agree to the following:
      </p>
      <h2 className="font-bold mt-6">1. What you're paying for</h2>
      <p className="text-white/70">
        A bid is a payment for a leaderboard placement and public visibility. It is not a wager, a stake in a prize
        pool, or an entry into any game of chance. Outbidding another user does not entitle you to any of their money,
        and no user ever receives money paid by another user. There is no random winner selection of any kind.
      </p>
      <h2 className="font-bold mt-6">2. No refunds for being outbid</h2>
      <p className="text-white/70">
        Your placement lasts only until someone bids higher — that's the entire mechanic. Being outbid is not a
        service failure and is not refundable on its own. See our Refund Policy for the limited cases where refunds
        do apply.
      </p>
      <h2 className="font-bold mt-6">3. Accounts</h2>
      <p className="text-white/70">
        You must provide accurate information and are responsible for activity on your account. We may suspend or ban
        accounts that abuse the platform, attempt payment fraud, or use prohibited usernames.
      </p>
      <h2 className="font-bold mt-6">4. Changes</h2>
      <p className="text-white/70">
        We may update these terms as the product evolves. Continued use after an update means you accept the revised
        terms.
      </p>
    </main>
  );
}
