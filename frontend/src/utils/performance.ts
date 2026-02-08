// src/utils/performance.ts
// Performance optimization utilities for ProMrkts

/**
 * Defers execution of a callback until the browser is idle
 * Falls back to setTimeout if requestIdleCallback is not available
 */
export const whenIdle = (callback: () => void, timeout = 2000): void => {
  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, 100);
  }
};

/**
 * Preloads an image in the background
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Preloads multiple images in parallel
 */
export const preloadImages = (srcs: string[]): Promise<void[]> => {
  return Promise.all(srcs.map(preloadImage));
};

/**
 * Defers loading of non-critical resources
 */
export const deferLoad = <T>(
  loader: () => Promise<T>,
  delay = 0
): Promise<T> => {
  return new Promise((resolve, reject) => {
    if (delay > 0) {
      setTimeout(() => loader().then(resolve).catch(reject), delay);
    } else {
      whenIdle(() => loader().then(resolve).catch(reject));
    }
  });
};

/**
 * Creates a debounced version of a function
 */
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Creates a throttled version of a function
 */
export const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Measures and logs performance of a function
 */
export const measurePerformance = async <T>(
  name: string,
  fn: () => Promise<T> | T
): Promise<T> => {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  
  if (process.env.NODE_ENV === "development") {
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
  }
  
  return result;
};

/**
 * Preconnects to a URL for faster subsequent requests
 */
export const preconnect = (url: string, crossOrigin = true): void => {
  if (typeof document === "undefined") return;
  
  const link = document.createElement("link");
  link.rel = "preconnect";
  link.href = url;
  if (crossOrigin) {
    link.crossOrigin = "anonymous";
  }
  document.head.appendChild(link);
};

/**
 * Prefetches a resource for faster loading
 */
export const prefetch = (url: string, as?: string): void => {
  if (typeof document === "undefined") return;
  
  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = url;
  if (as) {
    link.as = as;
  }
  document.head.appendChild(link);
};

/**
 * Checks if the user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Checks if the user is on a slow connection
 */
export const isSlowConnection = (): boolean => {
  if (typeof navigator === "undefined") return false;
  const connection = (navigator as any).connection;
  if (!connection) return false;
  
  return (
    connection.saveData ||
    connection.effectiveType === "slow-2g" ||
    connection.effectiveType === "2g"
  );
};

/**
 * Returns optimized image quality based on connection
 */
export const getOptimalImageQuality = (): "low" | "medium" | "high" => {
  if (isSlowConnection()) return "low";
  
  const connection = (navigator as any).connection;
  if (connection?.effectiveType === "3g") return "medium";
  
  return "high";
};

/**
 * Defers Three.js initialization until idle
 */
export const deferThreeJS = (initFn: () => void): void => {
  // Wait for first contentful paint, then initialize Three.js
  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(initFn, { timeout: 3000 });
  } else {
    // Fallback: wait 1 second after load
    setTimeout(initFn, 1000);
  }
};

/**
 * Creates a resource hint for critical resources
 */
export const addResourceHint = (
  url: string,
  type: "preload" | "prefetch" | "preconnect",
  options: { as?: string; crossOrigin?: boolean } = {}
): void => {
  if (typeof document === "undefined") return;
  
  const existing = document.querySelector(`link[href="${url}"][rel="${type}"]`);
  if (existing) return;
  
  const link = document.createElement("link");
  link.rel = type;
  link.href = url;
  
  if (options.as) link.as = options.as;
  if (options.crossOrigin) link.crossOrigin = "anonymous";
  
  document.head.appendChild(link);
};

/**
 * Optimizes scroll performance by using passive listeners
 */
export const addPassiveScrollListener = (
  element: HTMLElement | Window,
  handler: (e: Event) => void
): (() => void) => {
  element.addEventListener("scroll", handler, { passive: true });
  return () => element.removeEventListener("scroll", handler);
};

/**
 * Batch DOM reads and writes to prevent layout thrashing
 */
export const batchDOMUpdates = (
  reads: (() => void)[],
  writes: (() => void)[]
): void => {
  // Execute all reads first
  reads.forEach((read) => read());
  
  // Then execute all writes in a single frame
  requestAnimationFrame(() => {
    writes.forEach((write) => write());
  });
};

/**
 * Reports Web Vitals metrics
 */
export const reportWebVitals = (onReport: (metric: any) => void): void => {
  if (typeof window === "undefined") return;
  
  // LCP
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    onReport({ name: "LCP", value: lastEntry.startTime });
  });
  lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
  
  // FID
  const fidObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry: any) => {
      onReport({ name: "FID", value: entry.processingStart - entry.startTime });
    });
  });
  fidObserver.observe({ type: "first-input", buffered: true });
  
  // CLS
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry: any) => {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
      }
    });
    onReport({ name: "CLS", value: clsValue });
  });
  clsObserver.observe({ type: "layout-shift", buffered: true });
};
