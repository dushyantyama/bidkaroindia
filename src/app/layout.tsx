import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

const APP_URL = "https://bidkaroindia.lol";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "BidKaroIndia — Who deserves the top spot? 🇮🇳",
    template: "%s — BidKaroIndia",
  },
  description: "India's most chaotic leaderboard. Pay ₹1 more, take #1. Someone will take it back.",
  openGraph: {
    title: "BidKaroIndia — Who deserves the top spot? 🇮🇳",
    description: "India's most chaotic leaderboard. Pay ₹1 more, take #1.",
    url: APP_URL,
    siteName: "BidKaroIndia",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BidKaroIndia — Who deserves the top spot? 🇮🇳",
    description: "India's most chaotic leaderboard. Pay ₹1 more, take #1.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-ink text-paper antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
