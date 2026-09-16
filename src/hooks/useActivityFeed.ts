"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { ACTIVITY_CHANNEL, type ActivityEvent } from "@/lib/eventBus";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function useActivityFeed(maxItems = 20) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    if (!supabaseUrl || !supabaseAnonKey) return;

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const channel = supabase
      .channel(ACTIVITY_CHANNEL)
      .on("broadcast", { event: ACTIVITY_CHANNEL }, ({ payload }) => {
        setEvents((prev) => [payload as ActivityEvent, ...prev].slice(0, maxItems));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [maxItems]);

  return events;
}
