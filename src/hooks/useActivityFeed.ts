"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { ACTIVITY_CHANNEL, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, type ActivityEvent } from "@/lib/eventBus";

export function useActivityFeed(maxItems = 20) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
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
