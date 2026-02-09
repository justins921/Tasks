"use client";

import { useState, useEffect } from "react";

/** Forces a re-render every `ms` milliseconds. Useful for live timers. */
export function useTick(ms: number = 1000): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
  return tick;
}
