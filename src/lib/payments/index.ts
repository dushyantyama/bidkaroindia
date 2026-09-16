import type { PaymentProvider } from "./types";
import { simulatedProvider } from "./simulatedProvider";
import { razorpayProvider } from "./razorpayProvider";

export function getPaymentProvider(): PaymentProvider {
  const configured = process.env.PAYMENTS_PROVIDER ?? "simulated";
  if (configured === "razorpay") return razorpayProvider;
  return simulatedProvider;
}

export * from "./types";
