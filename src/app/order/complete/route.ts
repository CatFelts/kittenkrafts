import { NextResponse } from "next/server";

import { clearCart } from "@/lib/cart";
import { getOrderBySessionId, markOrderPaid } from "@/lib/db";
import { isStripeConfigured, stripe } from "@/lib/stripe";

/**
 * Stripe redirects the customer here after a successful payment.
 *
 * A Route Handler (not a page) so we can clear the cart cookie on the way
 * through — pages cannot set cookies in the App Router.
 *
 * This does NOT decide whether the order is paid. That is the webhook's job.
 * We only confirm the session here so the shopper sees the right thing even if
 * the webhook is a second or two behind, which is common in local dev.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");

  if (!sessionId || !isStripeConfigured) {
    return NextResponse.redirect(new URL("/", url.origin));
  }

  await clearCart();

  const order = await getOrderBySessionId(sessionId);
  if (!order) {
    return NextResponse.redirect(new URL("/order/success", url.origin));
  }

  // Belt and braces: if the webhook has not landed yet, ask Stripe directly.
  // markOrderPaid is idempotent, so the webhook arriving later is harmless.
  if (order.status !== "paid") {
    try {
      const session = await stripe().checkout.sessions.retrieve(sessionId);
      if (session.payment_status === "paid") {
        await markOrderPaid(order.id, session.customer_details?.email ?? null);
      }
    } catch {
      // Non-fatal: the webhook is the authority and will settle it.
    }
  }

  return NextResponse.redirect(
    new URL(`/order/success?order=${order.id}`, url.origin),
  );
}
