/**
 * Unified Analytics & Event Tracking Layer
 * 
 * Extends Vercel Analytics + custom backend tracking.
 * All funnel events flow through this module for consistent measurement.
 * 
 * Event Taxonomy:
 * - Funnel events: signup_*, login_*, checkout_*, broker_*, product_*
 * - Engagement events: dashboard_*, widget_*, course_*
 * - Revenue events: purchase_*, subscription_*
 */

import { track as vercelTrack } from '@vercel/analytics';
import { resolveBackendOrigin } from './backendOrigin';

const API_BASE = resolveBackendOrigin();

// ============================================================================
// Types
// ============================================================================

export type EventCategory = 
  | 'funnel'
  | 'engagement'
  | 'revenue'
  | 'broker'
  | 'error';

export type FunnelStep =
  // Signup funnel
  | 'signup_started'
  | 'signup_step_1_completed'
  | 'signup_step_2_completed'
  | 'signup_step_3_completed'
  | 'signup_email_sent'
  | 'signup_email_verified'
  | 'signup_completed'
  // Login funnel
  | 'login_started'
  | 'login_completed'
  | 'login_failed'
  // Checkout funnel
  | 'checkout_started'
  | 'checkout_payment_method_selected'
  | 'checkout_network_selected'
  | 'checkout_promo_applied'
  | 'checkout_payment_initiated'
  | 'checkout_proof_submitted'
  | 'checkout_completed'
  | 'checkout_abandoned'
  // Product funnel
  | 'product_list_viewed'
  | 'product_viewed'
  | 'product_add_to_cart'
  // Broker funnel
  | 'broker_page_viewed'
  | 'broker_cta_clicked'
  | 'broker_link_opened'
  // Dashboard engagement
  | 'dashboard_viewed'
  | 'dashboard_widget_added'
  | 'dashboard_widget_removed'
  | 'dashboard_layout_saved'
  | 'dashboard_preset_applied'
  // Onboarding
  | 'onboarding_started'
  | 'onboarding_step_completed'
  | 'onboarding_completed'
  | 'onboarding_skipped'
  // VIP
  | 'vip_promo_viewed'
  | 'vip_preview_clicked'
  | 'vip_trial_started';

export type EventProperties = {
  // Common
  category?: EventCategory;
  label?: string;
  value?: number;
  
  // User context
  userId?: string;
  sessionId?: string;
  
  // Product context
  productId?: string;
  productName?: string;
  productType?: 'course' | 'subscription' | 'challenge' | 'bundle';
  productPrice?: number;
  
  // Checkout context
  paymentMethod?: 'usdt' | 'stripe';
  network?: 'erc20' | 'trc20';
  promoCode?: string;
  discountPercent?: number;
  
  // Broker context
  brokerId?: string;
  brokerName?: string;
  
  // Funnel context
  funnelName?: string;
  stepNumber?: number;
  stepName?: string;
  
  // Error context
  errorMessage?: string;
  errorCode?: string;
  
  // Custom properties
  [key: string]: string | number | boolean | undefined;
};

// ============================================================================
// Session & User Management
// ============================================================================

let currentUserId: string | null = null;
let currentSessionId: string | null = null;

function getSessionId(): string {
  if (currentSessionId) return currentSessionId;
  
  let sid = sessionStorage.getItem('tracking_session_id');
  if (!sid) {
    sid = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem('tracking_session_id', sid);
  }
  currentSessionId = sid;
  return sid;
}

function getPersistentId(): string {
  let pid = localStorage.getItem('tracking_persistent_id');
  if (!pid) {
    pid = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('tracking_persistent_id', pid);
  }
  return pid;
}

/**
 * Identify the current user for analytics.
 * Call this after login/signup.
 */
export function identify(userId: string, traits?: Record<string, string | number | boolean>) {
  currentUserId = userId;
  localStorage.setItem('tracking_user_id', userId);
  
  // Send identify event to backend
  sendToBackend('identify', {
    userId,
    sessionId: getSessionId(),
    persistentId: getPersistentId(),
    traits,
  });
}

/**
 * Clear user identification on logout.
 */
export function resetIdentity() {
  currentUserId = null;
  localStorage.removeItem('tracking_user_id');
  currentSessionId = null;
  sessionStorage.removeItem('tracking_session_id');
}

/**
 * Get current user ID if identified.
 */
export function getUserId(): string | null {
  if (currentUserId) return currentUserId;
  return localStorage.getItem('tracking_user_id');
}

// ============================================================================
// Core Tracking Functions
// ============================================================================

/**
 * Track an event with unified handling.
 * Sends to both Vercel Analytics and custom backend.
 */
export function track(eventName: FunnelStep | string, properties?: EventProperties) {
  const enrichedProps = enrichProperties(properties);
  
  // Send to Vercel Analytics
  try {
    vercelTrack(eventName, enrichedProps);
  } catch (e) {
    console.warn('[Analytics] Vercel track failed:', e);
  }
  
  // Send to custom backend
  sendToBackend('track', {
    event: eventName,
    properties: enrichedProps,
    timestamp: Date.now(),
  });
  
  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', eventName, enrichedProps);
  }
}

/**
 * Track a page view.
 */
export function trackPageView(pageName: string, properties?: EventProperties) {
  track('page_viewed', {
    ...properties,
    pageName,
    path: window.location.pathname,
    referrer: document.referrer || undefined,
  });
}

/**
 * Track funnel step progression.
 */
export function trackFunnelStep(
  funnelName: string,
  stepNumber: number,
  stepName: FunnelStep,
  properties?: EventProperties
) {
  track(stepName, {
    ...properties,
    category: 'funnel',
    funnelName,
    stepNumber,
    stepName,
  });
}

/**
 * Track a revenue event (purchase, subscription).
 */
export function trackRevenue(
  eventName: string,
  amount: number,
  currency: string = 'USD',
  properties?: EventProperties
) {
  track(eventName, {
    ...properties,
    category: 'revenue',
    value: amount,
    currency,
  });
}

/**
 * Track an error event.
 */
export function trackError(
  errorType: string,
  errorMessage: string,
  properties?: EventProperties
) {
  track('error_occurred', {
    ...properties,
    category: 'error',
    errorType,
    errorMessage,
  });
}

// ============================================================================
// Funnel-Specific Tracking Helpers
// ============================================================================

/**
 * Signup funnel tracking.
 */
export const signupFunnel = {
  started: (source?: string) => 
    trackFunnelStep('signup', 1, 'signup_started', { source }),
  
  step1Completed: (email: string) => 
    trackFunnelStep('signup', 2, 'signup_step_1_completed', { hasEmail: !!email }),
  
  step2Completed: () => 
    trackFunnelStep('signup', 3, 'signup_step_2_completed'),
  
  step3Completed: () => 
    trackFunnelStep('signup', 4, 'signup_step_3_completed'),
  
  emailSent: () => 
    trackFunnelStep('signup', 5, 'signup_email_sent'),
  
  emailVerified: () => 
    trackFunnelStep('signup', 6, 'signup_email_verified'),
  
  completed: (userId: string) => {
    identify(userId);
    trackFunnelStep('signup', 7, 'signup_completed', { userId });
  },
};

/**
 * Login funnel tracking.
 */
export const loginFunnel = {
  started: () => 
    trackFunnelStep('login', 1, 'login_started'),
  
  completed: (userId: string) => {
    identify(userId);
    trackFunnelStep('login', 2, 'login_completed', { userId });
  },
  
  failed: (reason?: string) => 
    trackFunnelStep('login', 2, 'login_failed', { errorMessage: reason }),
};

/**
 * Checkout funnel tracking.
 */
export const checkoutFunnel = {
  started: (productId: string, productName: string, productType: string, price: number) =>
    trackFunnelStep('checkout', 1, 'checkout_started', {
      productId,
      productName,
      productType: productType as EventProperties['productType'],
      productPrice: price,
    }),
  
  paymentMethodSelected: (method: 'usdt' | 'stripe') =>
    trackFunnelStep('checkout', 2, 'checkout_payment_method_selected', { paymentMethod: method }),
  
  networkSelected: (network: 'erc20' | 'trc20') =>
    trackFunnelStep('checkout', 3, 'checkout_network_selected', { network }),
  
  promoApplied: (code: string, discountPercent: number) =>
    trackFunnelStep('checkout', 4, 'checkout_promo_applied', { promoCode: code, discountPercent }),
  
  paymentInitiated: (method: 'usdt' | 'stripe', amount: number) =>
    trackFunnelStep('checkout', 5, 'checkout_payment_initiated', { paymentMethod: method, value: amount }),
  
  proofSubmitted: () =>
    trackFunnelStep('checkout', 6, 'checkout_proof_submitted'),
  
  completed: (purchaseId: string, amount: number, method: 'usdt' | 'stripe') => {
    trackFunnelStep('checkout', 7, 'checkout_completed', { purchaseId, value: amount, paymentMethod: method });
    trackRevenue('purchase_completed', amount, 'USD', { purchaseId, paymentMethod: method });
  },
  
  abandoned: (step: number, reason?: string) =>
    trackFunnelStep('checkout', step, 'checkout_abandoned', { errorMessage: reason }),
};

/**
 * Product funnel tracking.
 */
export const productFunnel = {
  listViewed: (category?: string) =>
    track('product_list_viewed', { category: 'funnel' as EventCategory, label: category }),
  
  viewed: (productId: string, productName: string, productType: string, price: number) =>
    track('product_viewed', {
      productId,
      productName,
      productType: productType as EventProperties['productType'],
      productPrice: price,
    }),
  
  addToCart: (productId: string, productName: string, price: number) =>
    track('product_add_to_cart', { productId, productName, productPrice: price }),
};

/**
 * Broker funnel tracking.
 */
export const brokerFunnel = {
  pageViewed: (brokerId: string = 'anax', brokerName: string = 'ANAX Capital') =>
    track('broker_page_viewed', { category: 'broker', brokerId, brokerName }),
  
  ctaClicked: (ctaType: string) =>
    track('broker_cta_clicked', { category: 'broker', label: ctaType }),
  
  linkOpened: (brokerId: string = 'anax', linkType: 'register' | 'login' | 'demo') =>
    track('broker_link_opened', { category: 'broker', brokerId, label: linkType }),
};

/**
 * Dashboard engagement tracking.
 */
export const dashboardTracking = {
  viewed: (isFirstVisit: boolean = false) =>
    track('dashboard_viewed', { category: 'engagement', isFirstVisit }),
  
  widgetAdded: (widgetType: string) =>
    track('dashboard_widget_added', { category: 'engagement', label: widgetType }),
  
  widgetRemoved: (widgetType: string) =>
    track('dashboard_widget_removed', { category: 'engagement', label: widgetType }),
  
  layoutSaved: (layoutName: string) =>
    track('dashboard_layout_saved', { category: 'engagement', label: layoutName }),
  
  presetApplied: (presetName: string) =>
    track('dashboard_preset_applied', { category: 'engagement', label: presetName }),
};

/**
 * Onboarding tracking.
 */
export const onboardingTracking = {
  started: () =>
    track('onboarding_started', { category: 'engagement' }),
  
  stepCompleted: (stepNumber: number, stepName: string) =>
    track('onboarding_step_completed', { category: 'engagement', stepNumber, stepName }),
  
  completed: () =>
    track('onboarding_completed', { category: 'engagement' }),
  
  skipped: (atStep: number) =>
    track('onboarding_skipped', { category: 'engagement', stepNumber: atStep }),
};

// ============================================================================
// Internal Helpers
// ============================================================================

function enrichProperties(properties?: EventProperties): EventProperties {
  return {
    ...properties,
    sessionId: getSessionId(),
    persistentId: getPersistentId(),
    userId: getUserId() || undefined,
    timestamp: Date.now(),
    url: window.location.href,
    path: window.location.pathname,
    userAgent: navigator.userAgent,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    language: navigator.language,
  };
}

async function sendToBackend(type: 'track' | 'identify', payload: Record<string, unknown>) {
  try {
    await fetch(`${API_BASE}/analytics/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
      credentials: 'include',
    });
  } catch {
    // Best-effort; ignore failures
  }
}

// ============================================================================
// Pricing Tiers Reference (for analytics context)
// ============================================================================

export const PRICING_TIERS = {
  courses: {
    free: { id: 'course_free', name: 'Free Course', price: 0, type: 'course' },
    basic: { id: 'course_basic', name: 'Basic Course', price: 50, type: 'course' },
    advanced: { id: 'course_advanced', name: 'Advanced Course', price: 100, type: 'course' },
    bundle: { id: 'course_bundle', name: 'Course Bundle', price: 125, type: 'bundle' },
  },
  subscriptions: {
    telegram: { id: 'sub_telegram', name: 'VIP Telegram', price: 10, type: 'subscription', period: 'month' },
    discord: { id: 'sub_discord', name: 'VIP Discord', price: 10, type: 'subscription', period: 'month' },
    bundle: { id: 'sub_bundle', name: 'VIP Bundle (TG + Discord)', price: 15, type: 'subscription', period: 'month' },
  },
} as const;

const analytics = {
  track,
  trackPageView,
  trackFunnelStep,
  trackRevenue,
  trackError,
  identify,
  resetIdentity,
  getUserId,
  signupFunnel,
  loginFunnel,
  checkoutFunnel,
  productFunnel,
  brokerFunnel,
  dashboardTracking,
  onboardingTracking,
  PRICING_TIERS,
};

export default analytics;
