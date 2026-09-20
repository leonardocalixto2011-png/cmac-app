import Stripe from "stripe";

let cached: Stripe | null = null;

/**
 * Returns a Stripe client for CMAC Beauty's OWN account, or null when
 * STRIPE_SECRET_KEY is not configured (checkout then shows a graceful
 * "payment not configured" message).
 */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!cached) cached = new Stripe(key);
  return cached;
}

export const stripeConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY);
