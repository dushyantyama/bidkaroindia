export const metadata = { title: "Refund Policy" };

export default function RefundPolicyPage() {
  return (
    <main className="min-h-dvh px-4 pb-16 max-w-lg mx-auto pt-10 prose prose-invert prose-sm">
      <h1 className="text-2xl font-black mb-4">Refund Policy</h1>
      <p className="text-white/70">
        Because a bid buys a leaderboard placement at the moment it's confirmed, refunds are limited to cases where
        something went wrong on our end:
      </p>
      <ul className="text-white/70 list-disc pl-5 space-y-1">
        <li>You were charged but your bid was never confirmed (e.g. a race condition rejected it after payment).</li>
        <li>A duplicate charge occurred due to a technical error.</li>
        <li>The payment gateway reports the transaction as failed after money was debited.</li>
      </ul>
      <p className="text-white/70 mt-4">
        Being outbid by someone else afterwards is expected behavior, not eligible for a refund. To request a refund
        for one of the cases above, contact support with your transaction ID.
      </p>
    </main>
  );
}
