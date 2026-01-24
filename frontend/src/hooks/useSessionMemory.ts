// src/hooks/useSessionMemory.ts
import * as React from "react";

type Session = {
  id: string;
  firstSeenAt: number;   // epoch ms
  lastSeenAt: number;    // epoch ms
  pageviews: number;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  referrer?: string;
  landingPath?: string;
};

const KEY = "gaja.session.v1";

function genId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// Safe accessors (avoid bare `location`)
const getWin = () => (typeof window !== "undefined" ? window : undefined);
const getLoc = () => {
  const w = getWin();
  return w && "location" in w ? w.location : undefined;
};
const getDoc = () => (typeof document !== "undefined" ? document : undefined);

function readUTM(): Session["utm"] {
  const loc = getLoc();
  const search = loc?.search ?? "";
  const p = new URLSearchParams(search);
  return {
    source: p.get("utm_source") || undefined,
    medium: p.get("utm_medium") || undefined,
    campaign: p.get("utm_campaign") || undefined,
    term: p.get("utm_term") || undefined,
    content: p.get("utm_content") || undefined,
  };
}

export function useSessionMemory() {
  const [session, setSession] = React.useState<Session>(() => {
    try {
      const raw = getWin()?.localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Session;
        parsed.pageviews = (parsed.pageviews || 0) + 1;
        parsed.lastSeenAt = Date.now();
        getWin()?.localStorage.setItem(KEY, JSON.stringify(parsed));
        return parsed;
      }
    } catch {
      // ignore storage errors (e.g., SSR or privacy mode)
    }

    const loc = getLoc();
    const doc = getDoc();

    const fresh: Session = {
      id: genId(),
      firstSeenAt: Date.now(),
      lastSeenAt: Date.now(),
      pageviews: 1,
      utm: readUTM(),
      referrer: doc?.referrer || undefined,
      landingPath: (loc?.pathname || "") + (loc?.search || ""),
    };

    try {
      getWin()?.localStorage.setItem(KEY, JSON.stringify(fresh));
    } catch {
      // ignore
    }
    return fresh;
  });

  // keep state in sync if another tab updates it
  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY && e.newValue) {
        try {
          setSession(JSON.parse(e.newValue) as Session);
        } catch {
          // ignore parse errors
        }
      }
    };
    getWin()?.addEventListener("storage", onStorage);
    return () => getWin()?.removeEventListener("storage", onStorage);
  }, []);

  const update = React.useCallback((patch: Partial<Session>) => {
    setSession((prev) => {
      const next = { ...prev, ...patch, lastSeenAt: Date.now() };
      try {
        getWin()?.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  return { session, update };
}
