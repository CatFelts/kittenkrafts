import type { Metadata } from "next";
import Link from "next/link";

import { removeFromCart, setQuantity } from "@/app/actions/cart";
import { checkout } from "@/app/actions/checkout";
import { ProductImage } from "@/components/Placeholder";
import { getCart } from "@/lib/cart";
import { formatCents } from "@/lib/money";
import { site } from "@/lib/site";
import { isStripeConfigured } from "@/lib/stripe";

export const metadata: Metadata = { title: "Cart" };

const ERRORS: Record<string, string> = {
  empty: "Your cart is empty.",
  changed:
    "Something in your cart sold or changed. The cart below is up to date — check it, then try again.",
  cancelled: "Checkout cancelled. Your cart is still here.",
  stripe: "Could not reach the payment provider. Please try again.",
};

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; added?: string }>;
}) {
  const { error, added } = await searchParams;
  const cart = await getCart();

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="text-3xl">Your cart</h1>

      {added && (
        <p className="mt-5 rounded-md border border-moss/30 bg-moss/10 px-4 py-3 text-sm text-moss">
          Added to your cart.
        </p>
      )}
      {error && ERRORS[error] && (
        <p className="mt-5 rounded-md border border-clay/30 bg-clay/5 px-4 py-3 text-sm text-clay">
          {ERRORS[error]}
        </p>
      )}
      {cart.adjusted && !error && (
        <p className="mt-5 rounded-md border border-clay/30 bg-clay/5 px-4 py-3 text-sm text-clay">
          One or more items sold out and were removed or reduced.
        </p>
      )}

      {cart.items.length === 0 ? (
        <div className="mt-10">
          <p className="text-muted">Nothing in here yet.</p>
          <Link
            href="/shop"
            className="mt-5 inline-block rounded-full bg-clay px-6 py-3 text-sm text-white transition-colors hover:bg-clay-dark"
          >
            Browse the shop
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-8 divide-y divide-line border-y border-line">
            {cart.items.map((item) => (
              <li key={item.sku} className="flex gap-4 py-5">
                <Link
                  href={`/shop/${item.slug}`}
                  className="shrink-0 overflow-hidden rounded-md border border-line"
                >
                  <ProductImage
                    src={item.image}
                    alt={item.name}
                    seed={item.sku}
                    className="h-20 w-20"
                  />
                </Link>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/shop/${item.slug}`}
                    className="hover:text-clay"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted">
                    {formatCents(item.unitPriceCents)} each
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-4">
                    <form action={setQuantity} className="flex items-center gap-2">
                      <input type="hidden" name="sku" value={item.sku} />
                      <label
                        htmlFor={`qty-${item.sku}`}
                        className="text-sm text-muted"
                      >
                        Qty
                      </label>
                      <input
                        id={`qty-${item.sku}`}
                        name="qty"
                        type="number"
                        min={1}
                        max={item.available}
                        defaultValue={item.qty}
                        className="w-16 rounded-md border border-line bg-white px-2 py-1 text-sm"
                      />
                      <button
                        type="submit"
                        className="text-sm text-clay hover:underline"
                      >
                        Update
                      </button>
                    </form>

                    <form action={removeFromCart}>
                      <input type="hidden" name="sku" value={item.sku} />
                      <button
                        type="submit"
                        className="text-sm text-muted hover:text-clay hover:underline"
                      >
                        Remove
                      </button>
                    </form>
                  </div>
                </div>

                <p className="shrink-0 text-right">
                  {formatCents(item.lineTotalCents)}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-baseline justify-between">
            <span className="text-lg">Subtotal</span>
            <span className="text-lg">{formatCents(cart.subtotalCents)}</span>
          </div>
          <p className="mt-1 text-sm text-muted">
            Shipping is calculated at checkout. {site.shippingNote}
          </p>

          <form action={checkout} className="mt-8">
            <button
              type="submit"
              className="w-full rounded-full bg-clay px-6 py-4 text-white transition-colors hover:bg-clay-dark"
            >
              {isStripeConfigured
                ? "Checkout with Stripe"
                : "Place demo order (no payment)"}
            </button>
          </form>

          {!isStripeConfigured && (
            <p className="mt-3 text-center text-sm text-muted">
              Demo mode: no Stripe keys are set, so no money will move. Add
              STRIPE_SECRET_KEY to .env.local to enable real checkout.
            </p>
          )}
        </>
      )}
    </div>
  );
}
