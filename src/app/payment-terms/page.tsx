export const metadata = { title: "Payment Terms" };

export default function PaymentTermsPage() {
  return (
    <main className="min-h-dvh px-4 pb-16 max-w-lg mx-auto pt-10 prose prose-invert prose-sm">
      <h1 className="text-2xl font-black mb-4">Payment Terms</h1>
      <p className="text-white/70">
        All payments are processed by a licensed third-party payment gateway. We never see or store your card, UPI,
        or bank credentials. A bid is only confirmed after the payment gateway verifies the transaction on our
        server — your device never confirms a payment on its own.
      </p>
      <h2 className="font-bold mt-6">Currency</h2>
      <p className="text-white/70">All amounts are in Indian Rupees (₹).</p>
      <h2 className="font-bold mt-6">Failed payments</h2>
      <p className="text-white/70">
        If a payment fails or cannot be verified, no bid is placed and you are not charged. If you believe you were
        charged without a confirmed bid, see our Refund Policy.
      </p>
    </main>
  );
}
