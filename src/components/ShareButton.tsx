"use client";

export function ShareButton({
  username,
  amount,
  isTop,
  claim,
}: {
  username: string;
  amount: number;
  isTop: boolean;
  claim?: string;
}) {
  const headline = claim ?? (isTop ? "I'M #1" : "ON THE LEADERBOARD");
  const text = `🔥 ${headline} on BidKaroIndia with ₹${amount.toLocaleString("en-IN")}. Can you outbid me?`;

  async function share() {
    const url = `${window.location.origin}/out/${username}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "BidKaroIndia", text, url });
        return;
      } catch {
        // user cancelled — fall through to clipboard
      }
    }
    await navigator.clipboard.writeText(`${text} ${url}`);
    alert("Link copied! Paste it in your Instagram story or bio.");
  }

  return (
    <button onClick={share} className="w-full bg-saffron text-ink font-black rounded-full py-3 active:scale-95 transition">
      SHARE {isTop ? "MY WIN" : "MY RANK"}
    </button>
  );
}
