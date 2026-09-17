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

export const SUPABASE_URL = "https://xbybtekfepvikmwiymnp.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_D0jEQT7V1kWMt3unAjDujQ_O44Ar5H_";

export async function publishActivity(event: ActivityEvent) {
  try {
    await fetch(`${SUPABASE_URL}/realtime/v1/api/broadcast`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        messages: [{ topic: ACTIVITY_CHANNEL, event: ACTIVITY_CHANNEL, payload: event, private: false }],
      }),
    });
  } catch (err) {
    console.error("Failed to publish activity event", err);
  }
}
