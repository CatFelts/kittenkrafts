import "server-only";

import Stripe from "stripe";

/**
 * Stripe is OPTIONAL. With no STRIPE_SECRET_KEY the shop falls back to a demo
 * checkout that records the order and decrements stock without taking money,
 * so you can click the whole flow before you ever open a Stripe account.
 */

const secretKey = process.env.STRIPE_SECRET_KEY?.trim();

export const isStripeConfigured = Boolean(
  secretKey && secretKey.startsWith("sk_"),
);

let client: Stripe | null = null;

export function stripe(): Stripe {
  if (!isStripeConfigured) {
    throw new Error(
      "Stripe is not configured. Set STRIPE_SECRET_KEY in .env.local.",
    );
  }
  client ??= new Stripe(secretKey!);
  return client;
}

export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}
