"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";

import { clearCart, getCart } from "@/lib/cart";
import { checkoutMode } from "@/lib/checkout-mode";
import { createOrder, markOrderPaid, type OrderItem } from "@/lib/db";
import { CURRENCY } from "@/lib/money";
import { siteUrl, stripe } from "@/lib/stripe";

function newOrderId(): string {
  return "KK-" + randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase();
}

/**
 * Turn the cart into an order.
 *
 * Which path runs is decided by checkoutMode(), the SAME function the cart page
 * uses to choose which button to render. That shared source of truth matters:
 * if this branched on `isStripeConfigured` directly it could disagree with the
 * page — the cart could offer an email link while this tried to charge a card,
 * or offer a card button on a host with nowhere to record the sale.
 *
 *   stripe   -> create a hosted Checkout Session, save the order as 'pending',
 *               hand the customer to Stripe. The webhook marks it paid.
 *   demo     -> record the order as paid immediately, so the prototype is
 *               clickable end to end without any account setup.
 *   enquiry  -> nothing to do here; the cart page renders a mailto link instead.
 *
 * Prices come from the catalog, never from the request.
 */
export async function checkout(): Promise<void> {
  const cart = await getCart();

  if (cart.items.length === 0) {
    redirect("/cart?error=empty");
  }
  if (cart.adjusted) {
    // Stock changed under us while they were shopping. Show the trimmed cart
    // and make them confirm rather than silently charging for something else.
    redirect("/cart?error=changed");
  }

  const items: OrderItem[] = cart.items.map((i) => ({
    sku: i.sku,
    name: i.name,
    qty: i.qty,
    unitPriceCents: i.unitPriceCents,
  }));

  const mode = checkoutMode();

  // No database, so no order can be recorded. The cart page renders a mailto
  // link rather than a submit button in this mode, so getting here means a
  // stale page or a hand-made POST. Send them back rather than throwing a 500
  // — or worse, charging a card with nothing to reconcile it against.
  if (mode === "enquiry") {
    redirect("/cart?error=enquiry");
  }

  const orderId = newOrderId();

  if (mode === "demo") {
    await createOrder({
      id: orderId,
      mode: "demo",
      items,
      totalCents: cart.subtotalCents,
      currency: CURRENCY,
      status: "pending",
    });
    await markOrderPaid(orderId, null);
    await clearCart();
    redirect(`/order/success?order=${orderId}`);
  }

  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    line_items: cart.items.map((i) => ({
      quantity: i.qty,
      price_data: {
        currency: CURRENCY,
        unit_amount: i.unitPriceCents,
        product_data: {
          name: i.name,
          metadata: { sku: i.sku },
        },
      },
    })),
    shipping_address_collection: { allowed_countries: ["US", "CA", "GB"] },
    success_url: `${siteUrl()}/order/complete?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl()}/cart?error=cancelled`,
    metadata: { orderId },
    client_reference_id: orderId,
  });

  await createOrder({
    id: orderId,
    mode: "stripe",
    items,
    totalCents: cart.subtotalCents,
    currency: CURRENCY,
    stripeSessionId: session.id,
    status: "pending",
  });

  if (!session.url) {
    redirect("/cart?error=stripe");
  }
  redirect(session.url);
}
