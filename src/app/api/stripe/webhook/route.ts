import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { getOrderBySessionId, markOrderPaid } from "@/lib/db";
import { isStripeConfigured, stripe } from "@/lib/stripe";

/**
 * Stripe's webhook. This is the ONLY authority on whether an order is paid —
 * the browser redirect can be closed, faked, or lost, but this cannot.
 *
 * Local testing:
 *   stripe listen --forward-to localhost:3000/api/stripe/webhook
 */

// Never cache, and never pre-render.
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!isStripeConfigured || !secret) {
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }

  // The signature is computed over the RAW body, so read text, not json.
  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(payload, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object;
      if (session.payment_status === "paid") {
        const order =
          (await getOrderBySessionId(session.id)) ??
          (session.client_reference_id
            ? { id: session.client_reference_id }
            : null);

        if (order) {
          await markOrderPaid(order.id, session.customer_details?.email ?? null);
        }
      }
      break;
    }
    default:
      // Everything else is acknowledged and ignored.
      break;
  }

  return NextResponse.json({ received: true });
}
