import { prisma } from "@/lib/prisma";
import { computeMinNextBid, type IncrementTier } from "@/lib/currency";
import { publishActivity } from "@/lib/eventBus";
import { getPaymentProvider } from "@/lib/payments";
import { randomUUID } from "crypto";
import type { Payment } from "@prisma/client";

export class BidError extends Error {
  constructor(message: string, public code: string) {
    super(message);
  }
}

/**
 * Phase 1: validate the bid is currently winning, then create a payment
 * order with the provider. No money moves and no bid exists yet — the
 * client takes the returned order to a checkout widget (or, for the
 * simulated provider, straight to confirmBidOrder).
 */
export async function createBidOrder(params: { userId: string; leaderboardSlug: string; amount: number }) {
  const { userId, leaderboardSlug, amount } = params;

  if (!Number.isInteger(amount) || amount <= 0) {
    throw new BidError("Bid amount must be a positive whole number of rupees.", "INVALID_AMOUNT");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.isBanned) {
    throw new BidError("This account cannot place bids.", "FORBIDDEN");
  }

  const board = await prisma.leaderboard.findUnique({ where: { slug: leaderboardSlug } });
  if (!board) throw new BidError("Leaderboard not found.", "NOT_FOUND");

  const minNext = computeMinNextBid(board.currentAmount, board.incrementConfig as IncrementTier[], board.minStartingBid);
  if (amount < minNext) {
    throw new BidError(`Minimum next bid is ₹${minNext}.`, "TOO_LOW");
  }

  const provider = getPaymentProvider();
  const idempotencyKey = randomUUID();
  const order = await provider.createOrder({
    userId,
    amount,
    idempotencyKey,
    notes: { leaderboardSlug, userId },
  });

  const payment = await prisma.payment.create({
    data: {
      userId,
      leaderboardSlug,
      provider: provider.name,
      providerOrderId: order.providerOrderId,
      amount,
      idempotencyKey,
      status: "PENDING",
    },
  });

  return {
    paymentId: payment.id,
    provider: provider.name,
    providerOrderId: order.providerOrderId,
    clientPayload: order.clientPayload,
  };
}

/**
 * Phase 2 (client-driven): the checkout widget has returned a payment id
 * and signature — verify them and, only on success, place the bid.
 */
export async function confirmBidOrder(params: {
  userId: string;
  paymentId: string;
  providerPaymentId: string;
  signature?: string;
}) {
  const { userId, paymentId, providerPaymentId, signature } = params;

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment || payment.userId !== userId) {
    throw new BidError("Payment not found.", "NOT_FOUND");
  }

  if (payment.status !== "PENDING") {
    // A concurrent webhook (or a duplicate client call) may have already
    // finalized this exact payment — that's success, not an error.
    const existingBid = await prisma.bid.findUnique({ where: { paymentId: payment.id } });
    if (existingBid) return existingBid;
    throw new BidError("This payment was already processed.", "PAYMENT_FAILED");
  }

  const provider = getPaymentProvider();
  const verification = await provider.verifyPayment({
    providerOrderId: payment.providerOrderId ?? "",
    providerPaymentId,
    signature,
  });

  if (!verification.ok) {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } }).catch(() => {});
    throw new BidError("Payment could not be verified.", "PAYMENT_FAILED");
  }

  const claimed = await claimPendingPayment(payment.id, providerPaymentId);
  if (!claimed) {
    const existingBid = await prisma.bid.findUnique({ where: { paymentId: payment.id } });
    if (existingBid) return existingBid;
    throw new BidError("This payment was already processed.", "PAYMENT_FAILED");
  }

  return placeBidForPayment(payment, userId);
}

/**
 * Phase 2 (webhook-driven, defense in depth): Razorpay confirms a payment
 * server-to-server independent of whether the buyer's browser ever called
 * confirmBidOrder (they may have closed the tab right after paying). Only
 * ever called after the webhook signature has been verified by the caller.
 */
export async function finalizeBidFromWebhook(params: { providerOrderId: string; providerPaymentId: string }) {
  const payment = await prisma.payment.findFirst({ where: { providerOrderId: params.providerOrderId } });
  if (!payment) return;

  const claimed = await claimPendingPayment(payment.id, params.providerPaymentId);
  if (!claimed) return;

  try {
    await placeBidForPayment(payment, payment.userId);
  } catch (err) {
    console.error("Webhook-driven bid placement failed", err);
  }
}

/** Atomically moves a payment from PENDING -> SUCCESS so exactly one caller (client confirm vs. webhook) proceeds to place the bid. */
async function claimPendingPayment(paymentId: string, providerPaymentId: string): Promise<boolean> {
  const res = await prisma.payment.updateMany({
    where: { id: paymentId, status: "PENDING" },
    data: { status: "SUCCESS", providerPaymentId, verifiedAt: new Date() },
  });
  return res.count === 1;
}

/**
 * Places a bid on a leaderboard for an already-paid, already-claimed
 * Payment row.
 *
 * Concurrency safety: two users racing to outbid #1 must never both win.
 * We take an explicit row lock on the leaderboard (`SELECT ... FOR UPDATE`)
 * inside a single transaction, re-read the current amount under that lock,
 * validate the new bid against it, and only then write the new state. Any
 * concurrent caller blocks on the lock until the first transaction commits,
 * so the second caller re-validates against the just-updated amount and is
 * correctly rejected if it's no longer high enough.
 */
async function placeBidForPayment(payment: Payment, userId: string) {
  const { leaderboardSlug, amount } = payment;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new BidError("User not found.", "FORBIDDEN");

  try {
    const result = await prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<{ id: string; currentAmount: number; incrementConfig: IncrementTier[]; minStartingBid: number; currentUserId: string | null }[]>`
        SELECT id, "currentAmount", "incrementConfig", "minStartingBid", "currentUserId"
        FROM "Leaderboard"
        WHERE slug = ${leaderboardSlug}
        FOR UPDATE
      `;
      const board = rows[0];
      if (!board) throw new BidError("Leaderboard not found.", "NOT_FOUND");

      const minNext = computeMinNextBid(board.currentAmount, board.incrementConfig, board.minStartingBid);
      if (amount < minNext) {
        throw new BidError(`Minimum next bid is ₹${minNext}.`, "TOO_LOW");
      }

      const previousUserId = board.currentUserId;
      const wasEntering = previousUserId !== userId;

      const bid = await tx.bid.create({
        data: {
          userId,
          leaderboardId: board.id,
          amount,
          paymentId: payment.id,
          rankBefore: null,
          rankAfter: 1,
        },
      });

      await tx.leaderboard.update({
        where: { id: board.id },
        data: { currentAmount: amount, currentUserId: userId, currentBidAt: new Date() },
      });

      await tx.leaderboardEvent.create({
        data: {
          leaderboardId: board.id,
          userId,
          eventType: previousUserId ? "NEW_TOP" : "ENTERED",
          amount,
        },
      });

      if (previousUserId && previousUserId !== userId) {
        await tx.leaderboardEvent.create({
          data: { leaderboardId: board.id, userId: previousUserId, eventType: "OUTBID", amount },
        });
        await tx.notification.create({
          data: {
            userId: previousUserId,
            type: "OUTBID",
            title: "You got outbid!",
            message: `@${user.username} just took #1 with ₹${amount.toLocaleString("en-IN")}.`,
          },
        });
      }

      return { bid, leaderboardId: board.id, wasEntering };
    });

    publishActivity({
      id: result.bid.id,
      type: result.wasEntering ? "ENTERED" : "NEW_TOP",
      leaderboardSlug,
      username: user.username,
      instagram: user.instagram,
      amount,
      createdAt: new Date().toISOString(),
    });

    return result.bid;
  } catch (err) {
    // The bid failed after payment succeeded — for a real gateway this is
    // the point at which a refund would be issued. Record it as failed so
    // it's auditable rather than silently lost.
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } }).catch(() => {});
    throw err;
  }
}
