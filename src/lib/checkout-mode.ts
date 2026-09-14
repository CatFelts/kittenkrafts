import "server-only";

import { isDbAvailable } from "@/lib/db";
import { isStripeConfigured } from "@/lib/stripe";

/**
 * WHICH BUY FLOW THE SITE SHOWS.
 *
 * The shop can run in three modes, and it works out which one on its own from
 * what the environment actually provides. Nothing to configure by hand:
 *
 *   "stripe"   Stripe keys are set AND DATABASE_URL is set. Real hosted
 *              checkout, webhook settles the order.
 *
 *              Both halves are required. checkout() writes a 'pending' order row
 *              before handing the customer to Stripe, and the webhook looks that
 *              row up again to mark it paid. With no database the write throws —
 *              which would mean taking money with no record of the sale. So keys
 *              alone are not enough to enable this mode.
 *
 *   "demo"     A database but no Stripe. Checkout records a fake paid order and
 *              decrements stock, so you can click the whole flow. This is what
 *              you get locally when .env.local points at your Neon dev branch.
 *
 *   "enquiry"  No DATABASE_URL at all. There is nowhere to record an order, so
 *              the cart hands the customer a pre-filled email instead of a
 *              payment button. This is what a fresh clone runs, before you have
 *              signed up for anything.
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

  const hasDb = isDbAvailable();

  // Stripe needs a database to record the order against; see above. Setting the
  // keys on Netlify but forgetting DATABASE_URL is a real and easy mistake, and
  // the failure is expensive and silent, so say so loudly at startup.
  if (isStripeConfigured && !hasDb) {
    warnOnce(
      "STRIPE_SECRET_KEY is set but there is no writable database, so orders " +
        "cannot be recorded. Falling back to enquiry checkout. Set DATABASE_URL " +
        "to your Neon connection string to take card payments here.",
    );
    return "enquiry";
  }

  if (isStripeConfigured) return "stripe";
  return hasDb ? "demo" : "enquiry";
}

let warned = false;

/** checkoutMode() runs on every cart render; the warning should not. */
function warnOnce(message: string): void {
  if (warned) return;
  warned = true;
  console.warn(`[checkout-mode] ${message}`);
}
