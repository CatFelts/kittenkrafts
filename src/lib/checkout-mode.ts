import "server-only";

import { isDbAvailable } from "@/lib/db";
import { isStripeConfigured } from "@/lib/stripe";

/**
 * WHICH BUY FLOW THE SITE SHOWS.
 *
 * The shop can run in three modes, and it works out which one on its own from
 * what the environment actually provides. Nothing to configure by hand:
 *
 *   "stripe"   Stripe keys are set. Real hosted checkout, webhook settles the
 *              order. Not in use yet.
 *
 *   "demo"     No Stripe, but a writable database. Checkout records a fake paid
 *              order and decrements stock, so you can click the whole flow.
 *              This is what you get on your laptop.
 *
 *   "enquiry"  No Stripe and no database — a read-only host like Vercel. There
 *              is nowhere to record an order, so the cart hands the customer a
 *              pre-filled email instead of a payment button. This is what the
 *              live site runs.
 *
 * To force a mode, set CHECKOUT_MODE in .env.local. Use that to test the
 * enquiry flow locally BEFORE deploying — otherwise the first time you ever see
 * production's code path is in production.
 *
 *     CHECKOUT_MODE=enquiry npm run dev
 *
 * (Deliberately NOT named NEXT_PUBLIC_*. Those get frozen into the bundle at
 * build time and shipped to the browser. This value is server-only and should
 * be readable at runtime, so a plain variable is the right choice.)
 */

export type CheckoutMode = "stripe" | "demo" | "enquiry";

const MODES: readonly string[] = ["stripe", "demo", "enquiry"];

function isMode(value: string | undefined): value is CheckoutMode {
  return typeof value === "string" && MODES.includes(value);
}

export function checkoutMode(): CheckoutMode {
  const override = process.env.CHECKOUT_MODE?.trim();
  if (isMode(override)) return override;

  if (isStripeConfigured) return "stripe";
  return isDbAvailable() ? "demo" : "enquiry";
}
