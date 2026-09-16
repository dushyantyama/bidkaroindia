"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatRupees } from "@/lib/currency";
import { getCategoryMeta } from "@/lib/categories";
import { useIdentity } from "@/hooks/useIdentity";
import { ShareButton } from "@/components/ShareButton";
import { loadRazorpayCheckout, type RazorpayCheckoutResponse } from "@/lib/razorpayClient";

type Props = {
  open: boolean;
  onClose: () => void;
  leaderboardSlug: string;
  currentTopUsername: string | null;
  currentAmount: number;
  minNextBid: number;
  onSuccess: (amount: number) => void;
};

type Phase = "claim" | "form" | "submitting" | "success" | "beaten" | "error";

export function OutbidModal({ open, onClose, leaderboardSlug, currentTopUsername, currentAmount, minNextBid, onSuccess }: Props) {
  const { identity, loading, refresh } = useIdentity();
  const [amount, setAmount] = useState(minNextBid);
  const [phase, setPhase] = useState<Phase>("form");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [claimUsername, setClaimUsername] = useState("");
  const [claiming, setClaiming] = useState(false);

  if (!open) return null;

  const effectivePhase: Phase = !loading && !identity && (phase === "form" || phase === "claim") ? "claim" : phase;

  async function submitClaim(e: React.FormEvent) {
    e.preventDefault();
    setClaiming(true);
    setErrorMsg(null);
    const res = await fetch("/api/identity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instagram: claimUsername }),
    });
    const data = await res.json();
    setClaiming(false);
    if (!res.ok) {
      setErrorMsg(data.error ?? "Could not claim that username.");
      return;
    }
    await refresh();
    setPhase("form");
  }

  async function submit() {
    setPhase("submitting");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaderboardSlug, amount }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "TOO_LOW") {
          setPhase("beaten");
          setErrorMsg(data.error);
        } else {
          setPhase("error");
          setErrorMsg(data.error ?? "Something went wrong.");
        }
        return;
      }

      if (data.provider === "razorpay") {
        await loadRazorpayCheckout();
        const rzp = new window.Razorpay!({
          key: data.clientPayload.keyId,
          amount: data.clientPayload.amount,
          currency: data.clientPayload.currency,
          order_id: data.providerOrderId,
          name: "BidKaroIndia",
          description: `Take #1 in ${getCategoryMeta(leaderboardSlug).name}`,
          theme: { color: "#FF9933" },
          handler: (response: RazorpayCheckoutResponse) => {
            void confirmPayment(data.paymentId, response.razorpay_payment_id, response.razorpay_signature);
          },
          modal: {
            ondismiss: () => {
              setPhase("error");
              setErrorMsg("Payment was cancelled.");
            },
          },
        });
        rzp.on("payment.failed", () => {
          setPhase("error");
          setErrorMsg("Payment failed. Please try again.");
        });
        rzp.open();
        return;
      }

      // Simulated provider — no real gateway, confirm straight away.
      await confirmPayment(data.paymentId, `sim_payment_${data.paymentId}`);
    } catch {
      setPhase("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  async function confirmPayment(paymentId: string, providerPaymentId: string, signature?: string) {
    try {
      const res = await fetch("/api/bids/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, providerPaymentId, signature }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "TOO_LOW" || data.code === "PAYMENT_FAILED") {
          setPhase("beaten");
          setErrorMsg(data.error);
        } else {
          setPhase("error");
          setErrorMsg(data.error ?? "Something went wrong.");
        }
        return;
      }
      setPhase("success");
      onSuccess(amount);
    } catch {
      setPhase("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl bg-neutral-950 border border-white/10 p-6 pb-8"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {effectivePhase === "claim" && (
            <form onSubmit={submitClaim}>
              <p className="text-saffron font-bold tracking-wide text-sm mb-1">🔥 ONE STEP</p>
              <h2 className="text-2xl font-black mb-1">Enter your Instagram handle to bid</h2>
              <p className="text-white/40 text-xs mb-4">This becomes your @username here — and links your profile to your real Instagram.</p>
              <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 mb-3 focus-within:border-saffron">
                <span className="text-white/40 text-lg">@</span>
                <input
                  autoFocus
                  value={claimUsername}
                  onChange={(e) => setClaimUsername(e.target.value.replace(/^@/, ""))}
                  placeholder="yourhandle"
                  className="flex-1 bg-transparent py-3 pl-1 outline-none"
                />
                <span className="text-white/20 text-lg">📷</span>
              </div>
              {errorMsg && <p className="text-red-400 text-sm mb-3">{errorMsg}</p>}
              <button
                type="submit"
                disabled={claiming || claimUsername.length < 1}
                className="w-full bg-saffron text-ink font-bold rounded-full py-3 active:scale-95 transition disabled:opacity-40"
              >
                {claiming ? "Claiming…" : "Claim it & continue"}
              </button>
              <p className="text-xs text-white/30 mt-3 text-center">No password, no email. Just your Instagram handle.</p>
            </form>
          )}

          {effectivePhase === "form" && (
            <>
              <p className="text-saffron font-bold tracking-wide text-sm mb-1">🔥 YOU'RE GOING FOR #1</p>
              <h2 className="text-2xl font-black mb-4">Take the top spot</h2>

              <div className="flex justify-between items-center bg-white/5 rounded-xl p-4 mb-4">
                <div>
                  <p className="text-xs text-white/50">Current #1</p>
                  <p className="font-semibold">{currentTopUsername ? `@${currentTopUsername}` : "Nobody yet"}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/50">Current bid</p>
                  <p className="font-semibold">{formatRupees(currentAmount)}</p>
                </div>
              </div>

              <label className="text-xs text-white/50 block mb-1">Your bid (minimum {formatRupees(minNextBid)})</label>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl font-black">₹</span>
                <input
                  type="number"
                  className="flex-1 bg-transparent border-b-2 border-white/20 focus:border-saffron outline-none text-2xl font-black py-1"
                  value={amount}
                  min={minNextBid}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </div>

              <button
                disabled={amount < minNextBid}
                onClick={submit}
                className="w-full bg-saffron text-ink font-bold rounded-full py-3 active:scale-95 transition disabled:opacity-40"
              >
                OUTBID NOW — {formatRupees(amount)}
              </button>
              {identity && <p className="text-xs text-white/30 mt-3 text-center">Bidding as 📷 @{identity.username}</p>}
            </>
          )}

          {effectivePhase === "submitting" && (
            <div className="py-10 text-center">
              <p className="text-xl font-bold animate-pulse">Confirming your bid…</p>
            </div>
          )}

          {effectivePhase === "success" && (
            <div className="py-6 text-center">
              <p className="text-4xl mb-2">🔥</p>
              <h2 className="text-2xl font-black mb-1">YOU DID IT.</h2>
              <p className="text-white/70 mb-1">You're #1. For now.</p>
              <p className="text-sm font-black text-saffron mb-3 tracking-wide">&ldquo;{getCategoryMeta(leaderboardSlug).claim}&rdquo;</p>
              <p className="text-3xl font-black text-saffron mb-6">{formatRupees(amount)}</p>
              {identity && (
                <div className="mb-2">
                  <ShareButton username={identity.username} amount={amount} isTop claim={getCategoryMeta(leaderboardSlug).claim} />
                </div>
              )}
              <button onClick={onClose} className="w-full text-white/50 text-sm py-2">
                Keep watching
              </button>
            </div>
          )}

          {effectivePhase === "beaten" && (
            <div className="py-6 text-center">
              <p className="text-4xl mb-2">😬</p>
              <h2 className="text-2xl font-black mb-1">SOMEONE BEAT YOU.</h2>
              <p className="text-white/70 mb-4">{errorMsg}</p>
              <button onClick={() => setPhase("form")} className="w-full bg-saffron text-ink font-bold rounded-full py-3">
                Try again
              </button>
            </div>
          )}

          {effectivePhase === "error" && (
            <div className="py-6 text-center">
              <p className="text-4xl mb-2">⚠️</p>
              <h2 className="text-xl font-black mb-1">Something went wrong.</h2>
              <p className="text-white/70 mb-4 text-sm">{errorMsg}</p>
              <button onClick={() => setPhase("form")} className="w-full bg-white text-ink font-bold rounded-full py-3">
                Try again
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
