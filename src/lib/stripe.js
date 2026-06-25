/**
 * ⟡ STRIPE INTEGRATION — Ready to activate
 * 
 * SETUP:
 * 1. Create Stripe account at stripe.com
 * 2. Get your publishable key from Dashboard → Developers → API keys
 * 3. Create a product "Active Mirror Pro" at $10/month
 * 4. Get the price ID (starts with price_...)
 * 5. Update the constants below
 * 6. Replace the mock checkout with real Stripe
 * 
 * For v1, we use Stripe Payment Links (no backend needed)
 * For v2, we'll add full Stripe Checkout with webhooks
 */

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION — UPDATE THESE
// ═══════════════════════════════════════════════════════════════

export const STRIPE_CONFIG = {
  // Replace with your Stripe publishable key (pk_live_... or pk_test_...)
  publishableKey: 'pk_test_YOUR_KEY_HERE',
  
  // Replace with your Stripe Payment Link URL
  // Create at: Dashboard → Products → Add Product → $10/month → Get Payment Link
  paymentLinkUrl: 'https://buy.stripe.com/YOUR_LINK_HERE',
  
  // Price ID for API checkout (optional, for v2)
  priceId: 'price_YOUR_PRICE_ID',
  
  // Success/cancel URLs
  successUrl: 'https://activemirror.ai/mirror?upgraded=true',
  cancelUrl: 'https://activemirror.ai/pricing',
};

// ═══════════════════════════════════════════════════════════════
// CHECKOUT FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * v1: Simple Payment Link redirect
 * No backend needed, Stripe handles everything
 */
export function redirectToCheckout(userEmail) {
  const url = new URL(STRIPE_CONFIG.paymentLinkUrl);
  
  // Pre-fill email if available
  if (userEmail) {
    url.searchParams.set('prefilled_email', userEmail);
  }
  
  window.open(url.toString(), '_blank');
}

/**
 * v2: Full Stripe Checkout (requires backend)
 * Uncomment when ready to add webhook handling
 */
/*
export async function createCheckoutSession(userEmail) {
  const response = await fetch('/api/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: userEmail,
      priceId: STRIPE_CONFIG.priceId,
      successUrl: STRIPE_CONFIG.successUrl,
      cancelUrl: STRIPE_CONFIG.cancelUrl,
    }),
  });
  
  const { sessionUrl } = await response.json();
  window.location.href = sessionUrl;
}
*/

/**
 * Check if user just upgraded (from success URL)
 */
export function checkUpgradeSuccess() {
  const params = new URLSearchParams(window.location.search);
  return params.get('upgraded') === 'true';
}

/**
 * Clear upgrade param from URL
 */
export function clearUpgradeParam() {
  const url = new URL(window.location);
  url.searchParams.delete('upgraded');
  window.history.replaceState({}, '', url);
}

// ═══════════════════════════════════════════════════════════════
// USAGE EXAMPLE
// ═══════════════════════════════════════════════════════════════

/*
import { redirectToCheckout, checkUpgradeSuccess, clearUpgradeParam } from '../lib/stripe';

// In your component:
const handleUpgrade = () => {
  redirectToCheckout(user?.email);
};

// On mount:
useEffect(() => {
  if (checkUpgradeSuccess()) {
    // User just upgraded! Update their tier
    const upgraded = upgradeToPro(user);
    setUser(upgraded);
    clearUpgradeParam();
    
    // Show success toast
    toast.success('Welcome to Pro! 🎉');
  }
}, []);
*/

// ═══════════════════════════════════════════════════════════════
// WEBHOOK HANDLER (for v2 backend)
// ═══════════════════════════════════════════════════════════════

/*
// backend/stripe-webhook.js (Node.js example)

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function handleWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(
    req.body, 
    sig, 
    process.env.STRIPE_WEBHOOK_SECRET
  );
  
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const email = session.customer_email;
      // Update user to Pro in your database
      await upgradeToPro(email);
      break;
      
    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      // Downgrade user when subscription ends
      await downgradeToFree(subscription.customer);
      break;
  }
  
  res.json({ received: true });
}
*/
