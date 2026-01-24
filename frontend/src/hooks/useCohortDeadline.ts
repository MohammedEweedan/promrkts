// src/hooks/useCohortDeadline.ts
import * as React from "react";

type Options = {
  hours?: number;               // default 1
  storageKey?: string;          // default 'gaja.cohort.deadline'
  // optionally accept a fixed deadline from backend (epoch ms)
  fixedDeadlineMs?: number;     // if provided, overrides rolling
};

export function useCohortDeadline(opts: Options = {}) {
  const {
    hours = 1,
    storageKey = "gaja.cohort.deadline",
    fixedDeadlineMs,
  } = opts;

  const hoursMs = hours * 60 * 60 * 1000;

  const initial = React.useMemo<number>(() => {
    const now = Date.now();
    if (fixedDeadlineMs && fixedDeadlineMs > now) {
      // Never exceed the configured window
      return Math.min(fixedDeadlineMs, now + hoursMs);
    }
    const saved = Number(localStorage.getItem(storageKey));
    if (saved && saved > now) {
      // Clamp any historical value to at most now + hoursMs
      return Math.min(saved, now + hoursMs);
    }
    // rolling deadline (now + window)
    return now + hoursMs;
  }, [hoursMs, storageKey, fixedDeadlineMs]);

  const [deadline, setDeadline] = React.useState<number>(initial);
  const [remain, setRemain] = React.useState<number>(Math.max(0, initial - Date.now()));

  // persist once if new
  React.useEffect(() => {
    const now = Date.now();
    // Ensure we persist a clamped value and migrate old oversized values
    const clamped = Math.min(deadline, now + hoursMs);
    const saved = Number(localStorage.getItem(storageKey));
    if (!saved || saved !== clamped) {
      localStorage.setItem(storageKey, String(clamped));
      if (clamped !== deadline) setDeadline(clamped);
    }
  }, [deadline, storageKey, hoursMs]);

  // sync across tabs
  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        const d = Number(e.newValue);
        if (d && d !== deadline) setDeadline(d);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [deadline, storageKey]);

  // tick on second boundaries
  React.useEffect(() => {
    const id = setInterval(() => {
      const next = Math.max(0, deadline - Date.now());
      setRemain((prev) =>
        Math.floor(prev / 1000) === Math.floor(next / 1000) ? prev : next
      );
    }, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  const reset = React.useCallback((newDeadlineMs?: number) => {
    const d = newDeadlineMs && newDeadlineMs > Date.now()
      ? newDeadlineMs
      : Date.now() + hours * 60 * 60 * 1000;
    setDeadline(d);
    localStorage.setItem(storageKey, String(d));
  }, [hours, storageKey]);

  return {
    deadline,
    remain,
    reset,
    isExpired: remain <= 0,
  };
}
