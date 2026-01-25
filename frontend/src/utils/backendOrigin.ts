const normalize = (url: string) => url.replace(/\/$/, "");

export const resolveBackendOrigin = (): string => {
  const envUrl =
    process.env.REACT_APP_BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.VITE_BACKEND_URL ||
    "";

  if (envUrl) {
    return normalize(envUrl);
  }

  if (typeof window !== "undefined" && typeof window.location !== "undefined") {
    const { origin, hostname } = window.location;
    const normalizedOrigin = normalize(origin);
    const isLocalhost = /(?:^|\.)localhost$/i.test(hostname);
    const ispromrkts = /(?:\.|^)promrkts\.ai$/i.test(hostname);

    if (isLocalhost || ispromrkts) {
      return `${normalizedOrigin}/api`;
    }
  }

  return "https://promrkts.onrender.com";
};

export const resolveBackendAsset = (path: string): string => {
  const base = resolveBackendOrigin();
  if (!path) {
    return base;
  }
  const trimmed = path.startsWith("/") ? path : `/${path}`;
  return `${base}${trimmed}`;
};
