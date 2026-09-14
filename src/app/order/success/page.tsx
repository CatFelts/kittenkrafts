import type { Metadata } from "next";
import Link from "next/link";

import { getOrder } from "@/lib/db";
import { formatCents } from "@/lib/money";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Order confirmed" };

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;
  const order = orderId ? await getOrder(orderId) : null;

  return (
    <div className="mx-auto max-w-2xl px-5 py-20 text-center">
      <h1 className="text-3xl">Thank you.</h1>
      <p className="mt-4 text-muted">
        {order
          ? "Your order is confirmed. I'll email you a shipping note once it's on its way."
          : "Your order went through. Check your email for the receipt."}
      </p>

      {order && (
        <div className="mt-10 rounded-lg border border-line bg-white p-6 text-left">
          <div className="flex items-baseline justify-between border-b border-line pb-3">
            <span className="text-sm text-muted">Order</span>
            <span className="font-mono text-sm">{order.id}</span>
          </div>

          <ul className="divide-y divide-line">
            {order.items.map((item) => (
              <li key={item.sku} className="flex justify-between gap-4 py-3">
                <span>
                  {item.name}
                  {item.qty > 1 && (
                    <span className="text-muted"> × {item.qty}</span>
                  )}
                </span>
                <span className="shrink-0">
                  {formatCents(item.unitPriceCents * item.qty)}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex justify-between border-t border-line pt-3">
            <span>Total</span>
            <span>{formatCents(order.total_cents)}</span>
          </div>

          {order.mode === "demo" && (
            <p className="mt-4 rounded-md bg-cream px-3 py-2 text-sm text-muted">
              Demo order — no payment was taken. Stock was still decremented so
              you can see the sold-out state.
            </p>
          )}
        </div>
      )}

      <div className="mt-10 flex justify-center gap-4">
        <Link
          href="/shop"
          className="rounded-full bg-clay px-6 py-3 text-sm text-white transition-colors hover:bg-clay-dark"
        >
          Keep browsing
        </Link>
        <a
          href={`mailto:${site.email}`}
          className="rounded-full border border-line bg-white px-6 py-3 text-sm transition-colors hover:border-clay hover:text-clay"
        >
          Questions?
        </a>
      </div>
    </div>
  );
}
