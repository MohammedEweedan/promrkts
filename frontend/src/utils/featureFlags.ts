/**
 * Feature Flag System
 * 
 * Lightweight feature flag implementation with:
 * - Local overrides (localStorage for dev/testing)
 * - Remote config (fetched from backend)
 * - Default values for all flags
 * - React hook for reactive updates
 * 
 * Usage:
 *   import { isEnabled, useFeatureFlag } from './featureFlags';
 *   
 *   // Imperative check
 *   if (isEnabled('new_checkout_flow')) { ... }
 *   
 *   // React hook (reactive)
 *   const showNewCheckout = useFeatureFlag('new_checkout_flow');
 */

import { useState, useEffect } from 'react';
import { resolveBackendOrigin } from './backendOrigin';

const API_BASE = resolveBackendOrigin();
const LOCAL_STORAGE_KEY = 'promrkts_feature_flags';
const REMOTE_CACHE_KEY = 'promrkts_feature_flags_remote';
const REMOTE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ============================================================================
// Feature Flag Definitions
// ============================================================================

/**
 * All feature flags with their default values.
 * Add new flags here with sensible defaults (usually false for new features).
 */
export const FLAG_DEFAULTS = {
  // Checkout & Payment
  new_checkout_flow: false,
  usdt_trc20_enabled: true,
  usdt_erc20_enabled: true,
  stripe_enabled: true,
  
  // Onboarding
  onboarding_checklist: false,
  dashboard_presets: false,
  guided_tour: false,
  
  // Conversion
  exit_intent_popup: true,
  spin_wheel_enabled: true,
  urgency_countdown: false,
  social_proof_notifications: false,
  
  // Broker
  broker_hub_v2: false,
  broker_progress_tracking: false,
  
  // VIP
  vip_preview_enabled: false,
  vip_trial_enabled: false,
  
  // Analytics
  enhanced_tracking: true,
  session_replay: false,
  
  // UI Experiments
  pricing_page_v2: false,
  simplified_registration: false,
  dark_mode_default: true,
  
  // Performance
  lazy_load_tradingview: true,
  code_splitting: true,
} as const;

export type FeatureFlagName = keyof typeof FLAG_DEFAULTS;

// ============================================================================
// State Management
// ============================================================================

type FlagValues = Record<FeatureFlagName, boolean>;
type Listener = (flags: FlagValues) => void;

let currentFlags: FlagValues = { ...FLAG_DEFAULTS };
let listeners: Set<Listener> = new Set();
let remoteConfigLoaded = false;
let remoteConfigPromise: Promise<void> | null = null;

function notifyListeners() {
  listeners.forEach(listener => listener(currentFlags));
}

// ============================================================================
// Local Overrides (for development/testing)
// ============================================================================

function loadLocalOverrides(): Partial<FlagValues> {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return {};
}

function saveLocalOverrides(overrides: Partial<FlagValues>) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(overrides));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Set a local override for a feature flag.
 * Useful for development and testing.
 */
export function setLocalOverride(flag: FeatureFlagName, value: boolean) {
  const overrides = loadLocalOverrides();
  overrides[flag] = value;
  saveLocalOverrides(overrides);
  currentFlags[flag] = value;
  notifyListeners();
}

/**
 * Clear a local override for a feature flag.
 */
export function clearLocalOverride(flag: FeatureFlagName) {
  const overrides = loadLocalOverrides();
  delete overrides[flag];
  saveLocalOverrides(overrides);
  // Recompute from defaults + remote
  recomputeFlags();
}

/**
 * Clear all local overrides.
 */
export function clearAllLocalOverrides() {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  recomputeFlags();
}

/**
 * Get all current local overrides.
 */
export function getLocalOverrides(): Partial<FlagValues> {
  return loadLocalOverrides();
}

// ============================================================================
// Remote Config
// ============================================================================

type RemoteCacheEntry = {
  flags: Partial<FlagValues>;
  timestamp: number;
};

function loadRemoteCache(): Partial<FlagValues> {
  try {
    const stored = localStorage.getItem(REMOTE_CACHE_KEY);
    if (stored) {
      const entry: RemoteCacheEntry = JSON.parse(stored);
      // Check if cache is still valid
      if (Date.now() - entry.timestamp < REMOTE_CACHE_TTL) {
        return entry.flags;
      }
    }
  } catch {
    // Ignore parse errors
  }
  return {};
}

function saveRemoteCache(flags: Partial<FlagValues>) {
  try {
    const entry: RemoteCacheEntry = {
      flags,
      timestamp: Date.now(),
    };
    localStorage.setItem(REMOTE_CACHE_KEY, JSON.stringify(entry));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Fetch feature flags from the backend.
 * Results are cached for 5 minutes.
 */
export async function fetchRemoteFlags(): Promise<Partial<FlagValues>> {
  try {
    const response = await fetch(`${API_BASE}/config/feature-flags`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    const flags = data?.flags || data || {};
    
    // Validate and filter to known flags
    const validFlags: Partial<FlagValues> = {};
    for (const key of Object.keys(FLAG_DEFAULTS) as FeatureFlagName[]) {
      if (typeof flags[key] === 'boolean') {
        validFlags[key] = flags[key];
      }
    }
    
    saveRemoteCache(validFlags);
    return validFlags;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[FeatureFlags] Failed to fetch remote config:', error);
    }
    // Return cached values on error
    return loadRemoteCache();
  }
}

/**
 * Initialize feature flags by loading remote config.
 * Call this early in app startup.
 */
export async function initializeFlags(): Promise<void> {
  if (remoteConfigPromise) {
    return remoteConfigPromise;
  }
  
  remoteConfigPromise = (async () => {
    // First, apply cached remote config immediately
    const cachedRemote = loadRemoteCache();
    const localOverrides = loadLocalOverrides();
    
    currentFlags = {
      ...FLAG_DEFAULTS,
      ...cachedRemote,
      ...localOverrides, // Local overrides take precedence
    };
    notifyListeners();
    
    // Then fetch fresh remote config in background
    const freshRemote = await fetchRemoteFlags();
    
    currentFlags = {
      ...FLAG_DEFAULTS,
      ...freshRemote,
      ...localOverrides,
    };
    remoteConfigLoaded = true;
    notifyListeners();
  })();
  
  return remoteConfigPromise;
}

function recomputeFlags() {
  const cachedRemote = loadRemoteCache();
  const localOverrides = loadLocalOverrides();
  
  currentFlags = {
    ...FLAG_DEFAULTS,
    ...cachedRemote,
    ...localOverrides,
  };
  notifyListeners();
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Check if a feature flag is enabled.
 */
export function isEnabled(flag: FeatureFlagName): boolean {
  return currentFlags[flag] ?? FLAG_DEFAULTS[flag] ?? false;
}

/**
 * Get all current flag values.
 */
export function getAllFlags(): FlagValues {
  return { ...currentFlags };
}

/**
 * React hook for reactive feature flag checks.
 * Re-renders component when flag value changes.
 */
export function useFeatureFlag(flag: FeatureFlagName): boolean {
  const [value, setValue] = useState(() => isEnabled(flag));
  
  useEffect(() => {
    const listener = (flags: FlagValues) => {
      setValue(flags[flag] ?? FLAG_DEFAULTS[flag] ?? false);
    };
    
    listeners.add(listener);
    
    // Initialize flags if not already done
    if (!remoteConfigLoaded && !remoteConfigPromise) {
      initializeFlags();
    }
    
    return () => {
      listeners.delete(listener);
    };
  }, [flag]);
  
  return value;
}

/**
 * React hook for multiple feature flags.
 */
export function useFeatureFlags<T extends FeatureFlagName[]>(
  flags: T
): Record<T[number], boolean> {
  const [values, setValues] = useState(() => {
    const result: Record<string, boolean> = {};
    for (const flag of flags) {
      result[flag] = isEnabled(flag);
    }
    return result as Record<T[number], boolean>;
  });
  
  useEffect(() => {
    const listener = (allFlags: FlagValues) => {
      const result: Record<string, boolean> = {};
      for (const flag of flags) {
        result[flag] = allFlags[flag] ?? FLAG_DEFAULTS[flag] ?? false;
      }
      setValues(result as Record<T[number], boolean>);
    };
    
    listeners.add(listener);
    
    if (!remoteConfigLoaded && !remoteConfigPromise) {
      initializeFlags();
    }
    
    return () => {
      listeners.delete(listener);
    };
  }, [flags]);
  
  return values;
}

// ============================================================================
// Dev Tools
// ============================================================================

/**
 * Development helper to toggle a flag.
 * Available in browser console as window.__toggleFlag('flag_name')
 */
export function toggleFlag(flag: FeatureFlagName): boolean {
  const newValue = !isEnabled(flag);
  setLocalOverride(flag, newValue);
  console.log(`[FeatureFlags] ${flag} = ${newValue}`);
  return newValue;
}

/**
 * Development helper to list all flags.
 * Available in browser console as window.__listFlags()
 */
export function listFlags(): void {
  console.table(
    Object.entries(currentFlags).map(([flag, value]) => ({
      flag,
      value,
      default: FLAG_DEFAULTS[flag as FeatureFlagName],
      overridden: loadLocalOverrides()[flag as FeatureFlagName] !== undefined,
    }))
  );
}

// Expose dev tools in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__toggleFlag = toggleFlag;
  (window as any).__listFlags = listFlags;
  (window as any).__setFlag = setLocalOverride;
  (window as any).__clearFlag = clearLocalOverride;
  (window as any).__clearAllFlags = clearAllLocalOverrides;
}

// ============================================================================
// Auto-initialize on import
// ============================================================================

// Start loading remote config immediately
if (typeof window !== 'undefined') {
  initializeFlags().catch(() => {
    // Ignore initialization errors, defaults will be used
  });
}

const featureFlags = {
  isEnabled,
  getAllFlags,
  useFeatureFlag,
  useFeatureFlags,
  setLocalOverride,
  clearLocalOverride,
  clearAllLocalOverrides,
  getLocalOverrides,
  initializeFlags,
  fetchRemoteFlags,
  toggleFlag,
  listFlags,
  FLAG_DEFAULTS,
};

export default featureFlags;
