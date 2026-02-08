# Analytics & Event Tracking Documentation

## Overview

This document describes the analytics and event tracking system implemented for promrkts frontend. The system extends Vercel Analytics with custom backend tracking to provide comprehensive funnel measurement.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Event                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              tracking.ts (Unified Layer)                    │
│  - Enriches events with session/user context                │
│  - Sends to both Vercel Analytics + Backend                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│ Vercel Analytics│     │ Backend API     │
│ (Client-side)   │     │ /analytics/track│
└─────────────────┘     └─────────────────┘
```

## Files

- `src/utils/tracking.ts` - Core analytics module
- `src/utils/featureFlags.ts` - Feature flag system
- `src/utils/ANALYTICS_DOCS.md` - This documentation

---

## Event Taxonomy

### Signup Funnel

| Event | Description | Properties |
|-------|-------------|------------|
| `signup_started` | User lands on registration page | `source` |
| `signup_step_1_completed` | Basic info (name, email, password) submitted | `hasEmail` |
| `signup_step_2_completed` | Email verification completed | - |
| `signup_step_3_completed` | Contact info (phone) completed | - |
| `signup_email_sent` | Confirmation email sent | - |
| `signup_email_verified` | Email code verified | - |
| `signup_completed` | Account fully created | `userId` |

### Login Funnel

| Event | Description | Properties |
|-------|-------------|------------|
| `login_started` | User lands on login page | - |
| `login_completed` | Successful login | `userId` |
| `login_failed` | Failed login attempt | `errorMessage` |

### Checkout Funnel

| Event | Description | Properties |
|-------|-------------|------------|
| `checkout_started` | User enters checkout | `productId`, `productName`, `productType`, `productPrice` |
| `checkout_payment_method_selected` | USDT or Stripe selected | `paymentMethod` |
| `checkout_network_selected` | ERC-20 or TRC-20 selected | `network` |
| `checkout_promo_applied` | Promo code successfully applied | `promoCode`, `discountPercent` |
| `checkout_payment_initiated` | Payment process started | `paymentMethod`, `value` |
| `checkout_proof_submitted` | USDT proof of payment submitted | - |
| `checkout_completed` | Purchase confirmed | `purchaseId`, `value`, `paymentMethod` |
| `checkout_abandoned` | User left checkout | `stepNumber`, `errorMessage` |

### Product Funnel

| Event | Description | Properties |
|-------|-------------|------------|
| `product_list_viewed` | Products page loaded | `category` |
| `product_viewed` | Single product detail viewed | `productId`, `productName`, `productType`, `productPrice` |
| `product_add_to_cart` | Product added to cart | `productId`, `productName`, `productPrice` |

### Broker Funnel (IB)

| Event | Description | Properties |
|-------|-------------|------------|
| `broker_page_viewed` | Broker page loaded | `brokerId`, `brokerName` |
| `broker_cta_clicked` | CTA button clicked | `label` (cta type) |
| `broker_link_opened` | External broker link opened | `brokerId`, `linkType` |

### Dashboard Engagement

| Event | Description | Properties |
|-------|-------------|------------|
| `dashboard_viewed` | Dashboard loaded | `isFirstVisit` |
| `dashboard_widget_added` | Widget added to dashboard | `label` (widget type) |
| `dashboard_widget_removed` | Widget removed | `label` |
| `dashboard_layout_saved` | Layout saved | `label` (layout name) |
| `dashboard_preset_applied` | Preset layout applied | `label` (preset name) |

### Onboarding

| Event | Description | Properties |
|-------|-------------|------------|
| `onboarding_started` | Onboarding flow started | - |
| `onboarding_step_completed` | Single step completed | `stepNumber`, `stepName` |
| `onboarding_completed` | All steps completed | - |
| `onboarding_skipped` | User skipped onboarding | `stepNumber` |

---

## Common Properties (Auto-enriched)

All events automatically include:

| Property | Description |
|----------|-------------|
| `sessionId` | Unique session identifier |
| `persistentId` | Cross-session device identifier |
| `userId` | Authenticated user ID (if logged in) |
| `timestamp` | Event timestamp (ms) |
| `url` | Full page URL |
| `path` | URL path |
| `userAgent` | Browser user agent |
| `screenWidth` | Screen width |
| `screenHeight` | Screen height |
| `language` | Browser language |

---

## Pricing Tiers Reference

### Courses

| Tier | ID | Price (USD) |
|------|-----|-------------|
| Free Course | `course_free` | $0 |
| Basic Course | `course_basic` | $50 |
| Advanced Course | `course_advanced` | $100 |
| Course Bundle | `course_bundle` | $125 |

### Subscriptions

| Tier | ID | Price (USD/month) |
|------|-----|-------------------|
| VIP Telegram | `sub_telegram` | $10 |
| VIP Discord | `sub_discord` | $10 |
| VIP Bundle | `sub_bundle` | $15 |

---

## Usage Examples

### Track a custom event

```typescript
import { track } from '../utils/tracking';

track('custom_event', {
  category: 'engagement',
  label: 'some_action',
  value: 42,
});
```

### Use funnel helpers

```typescript
import { signupFunnel, checkoutFunnel } from '../utils/tracking';

// Signup
signupFunnel.started('google_ads');
signupFunnel.step1Completed('user@example.com');
signupFunnel.completed('user_123');

// Checkout
checkoutFunnel.started('course_basic', 'Basic Course', 'course', 50);
checkoutFunnel.paymentMethodSelected('usdt');
checkoutFunnel.networkSelected('trc20');
checkoutFunnel.completed('purchase_abc', 50, 'usdt');
```

### Identify user

```typescript
import { identify, resetIdentity } from '../utils/tracking';

// On login
identify('user_123', { email: 'user@example.com', name: 'John' });

// On logout
resetIdentity();
```

---

## Feature Flags

Feature flags are managed via `src/utils/featureFlags.ts`.

### Available Flags

| Flag | Default | Description |
|------|---------|-------------|
| `usdt_trc20_enabled` | `true` | Enable TRC-20 USDT payments |
| `usdt_erc20_enabled` | `true` | Enable ERC-20 USDT payments |
| `stripe_enabled` | `true` | Enable Stripe card payments |
| `onboarding_checklist` | `false` | Show onboarding checklist |
| `exit_intent_popup` | `true` | Show exit-intent popups |
| `spin_wheel_enabled` | `true` | Enable spin wheel on landing |
| `enhanced_tracking` | `true` | Enable enhanced analytics |
| `lazy_load_tradingview` | `true` | Lazy load TradingView widgets |

### Usage

```typescript
import { isEnabled, useFeatureFlag } from '../utils/featureFlags';

// Imperative check
if (isEnabled('usdt_trc20_enabled')) {
  // Show TRC-20 option
}

// React hook (reactive)
function MyComponent() {
  const showOnboarding = useFeatureFlag('onboarding_checklist');
  return showOnboarding ? <OnboardingChecklist /> : null;
}
```

### Dev Tools (Browser Console)

```javascript
// Toggle a flag
__toggleFlag('onboarding_checklist')

// List all flags
__listFlags()

// Set specific flag
__setFlag('usdt_erc20_enabled', true)

// Clear override
__clearFlag('usdt_erc20_enabled')
```

---

## Backend Endpoints Required

The tracking system expects these backend endpoints:

### POST /api/analytics/track

Receives tracked events.

```json
{
  "event": "signup_completed",
  "properties": {
    "userId": "user_123",
    "sessionId": "sess_abc",
    "timestamp": 1707350400000,
    ...
  },
  "timestamp": 1707350400000
}
```

### POST /api/analytics/identify

Receives user identification.

```json
{
  "userId": "user_123",
  "sessionId": "sess_abc",
  "persistentId": "device_xyz",
  "traits": {
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### GET /api/config/feature-flags

Returns feature flag configuration.

```json
{
  "flags": {
    "onboarding_checklist": true,
    "usdt_trc20_enabled": true,
    ...
  }
}
```

---

## KPIs to Track

### Conversion Metrics

- **Signup Conversion Rate**: `signup_completed / signup_started`
- **Login Success Rate**: `login_completed / login_started`
- **Checkout Conversion Rate**: `checkout_completed / checkout_started`
- **Broker Click-through Rate**: `broker_link_opened / broker_page_viewed`

### Funnel Drop-off Points

- Signup Step 1 → Step 2 drop-off
- Checkout payment method → payment initiated drop-off
- Product view → checkout started conversion

### Revenue Metrics

- ARPU (Average Revenue Per User)
- Revenue by payment method (USDT vs Stripe)
- Promo code usage rate

---

## Broker Partner: ANAX Capital

Current IB partner with tracking:

- **Broker ID**: `anax`
- **Broker Name**: ANAX Capital
- **Link Types**: `register`, `login`, `demo`

Future brokers can be added by extending the `brokerFunnel` helper.
