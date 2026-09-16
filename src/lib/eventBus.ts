/**
 * Live activity pub/sub via Supabase Realtime Broadcast.
 * publishActivity() posts to Realtime's REST broadcast endpoint (no persistent
 * connection needed), so it works from any serverless function invocation.
 * Subscribing happens client-side in useActivityFeed via the Supabase JS client.
 */

export type ActivityEvent = {
  id: string;
  type: "NEW_TOP" | "MOVED" | "ENTERED" | "OUTBID";
  leaderboardSlug: string;
  username: string;
  instagram: string | null;
  amount: number;
  createdAt: string;
};

export const ACTIVITY_CHANNEL = "activity";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function publishActivity(event: ActivityEvent) {
  if (!supabaseUrl || !supabaseAnonKey) return;

  try {
    await fetch(`${supabaseUrl}/realtime/v1/api/broadcast`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        messages: [{ topic: ACTIVITY_CHANNEL, event: ACTIVITY_CHANNEL, payload: event, private: false }],
      }),
    });
  } catch (err) {
    console.error("Failed to publish activity event", err);
  }
}
