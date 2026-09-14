import type { Metadata } from "next";
import Link from "next/link";

import { removeFromCart, setQuantity } from "@/app/actions/cart";
import { checkout } from "@/app/actions/checkout";
import { CursorIcon, SparkleIcon } from "@/components/Icons";
import { ProductImage } from "@/components/Placeholder";
import { Window } from "@/components/Window";
import { getCart } from "@/lib/cart";
import { checkoutMode } from "@/lib/checkout-mode";
import { formatCents } from "@/lib/money";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Cart" };

const ERRORS: Record<string, string> = {
  empty: "Your cart is empty.",
  changed:
    "Something in your cart sold or changed. The cart below is up to date — check it, then try again.",
  cancelled: "Checkout cancelled. Your cart is still here.",
  stripe: "Could not reach the payment provider. Please try again.",
  enquiry:
    "This shop takes orders by email. Use the button below and I'll reply to confirm.",
};

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; added?: string }>;
}) {
  const { error, added } = await searchParams;
  const cart = await getCart();
  const mode = checkoutMode();

  // Plain-text order summary. Used twice: as the body of the mailto link, and
  // as the copy-and-paste fallback for anyone whose browser has no mail app
  // wired up — which is a lot of people, and without the fallback they would
  // click the button, nothing would happen, and they would leave.
  const enquiryText = [
    "Hi — I'd like to order:",
    "",
    ...cart.items.map(
      (item) =>
        `  ${item.qty} x ${item.name} — ${formatCents(item.lineTotalCents)}`,
    ),
    "",
    `Subtotal: ${formatCents(cart.subtotalCents)}`,
    "",
    "Ship to:",
    "(please add your address)",
  ].join("\n");

  const enquiryMailto =
    `mailto:${site.email}` +
    `?subject=${encodeURIComponent(`Order — ${site.name}`)}` +
    `&body=${encodeURIComponent(enquiryText)}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="flex items-center gap-2 text-3xl text-clay">
        <SparkleIcon className="twinkle h-5 w-5 text-turq" />
        Your cart
      </h1>

      {added && (
        <p className="mt-5 border-2 border-moss bg-turq/25 px-3 py-2.5 text-xs text-ink">
          ⋆ Added to your cart.
        </p>
      )}
      {error && ERRORS[error] && (
        <p className="mt-5 border-2 border-clay bg-cream px-3 py-2.5 text-xs text-clay">
          {ERRORS[error]}
        </p>
      )}
      {cart.adjusted && !error && (
        <p className="mt-5 border-2 border-clay bg-cream px-3 py-2.5 text-xs text-clay">
          One or more items sold out and were removed or reduced.
        </p>
      )}

      {cart.items.length === 0 ? (
        <div className="win mt-8 p-6 text-center">
          <p className="text-xs text-muted">Nothing in here yet.</p>
          <Link
            href="/shop"
            className="mt-5 inline-flex items-center gap-2 border-2 border-ink bg-clay px-5 py-2.5 text-sm text-white shadow-[3px_3px_0_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 hover:bg-clay-dark"
          >
            <CursorIcon className="h-4 w-3" />
            Browse the shop
          </Link>
        </div>
      ) : (
        <>
          <Window title="cart.txt" className="mt-7">
            <ul className="win-inset divide-y-2 divide-line bg-white">
              {cart.items.map((item) => (
                <li key={item.sku} className="flex gap-3 p-3">
                  <Link
                    href={`/shop/${item.slug}`}
                    className="shrink-0 border-2 border-line"
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
                      className="text-sm text-ink underline-offset-2 hover:text-clay hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 text-xs text-muted">
                      {formatCents(item.unitPriceCents)} each
                    </p>

                    <div className="mt-2.5 flex flex-wrap items-center gap-3">
                      <form
                        action={setQuantity}
                        className="flex items-center gap-1.5"
                      >
                        <input type="hidden" name="sku" value={item.sku} />
                        <label
                          htmlFor={`qty-${item.sku}`}
                          className="text-xs text-muted"
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
                          className="win-inset w-14 bg-white px-1.5 py-1 text-xs"
                        />
                        <button
                          type="submit"
                          className="win px-2 py-1 text-xs text-ink"
                        >
                          Update
                        </button>
                      </form>

                      <form action={removeFromCart}>
                        <input type="hidden" name="sku" value={item.sku} />
                        <button
                          type="submit"
                          className="text-xs text-muted underline-offset-2 hover:text-clay hover:underline"
                        >
                          Remove
                        </button>
                      </form>
                    </div>
                  </div>

                  <p className="shrink-0 text-right text-sm text-ink">
                    {formatCents(item.lineTotalCents)}
                  </p>
                </li>
              ))}
            </ul>
          </Window>

          <div className="mt-5 flex items-baseline justify-between border-t-2 border-clay pt-4">
            <span className="font-display text-xl text-ink">Subtotal</span>
            <span className="border-2 border-ink bg-lime px-3 py-1 text-xl text-ink shadow-[3px_3px_0_0_var(--color-ink)]">
              {formatCents(cart.subtotalCents)}
            </span>
          </div>
          <p className="mt-2 text-xs text-muted">{site.shippingNote}</p>

          {mode === "enquiry" ? (
            <div className="mt-7">
              <a
                href={enquiryMailto}
                className="flex w-full items-center justify-center gap-2 border-2 border-ink bg-clay px-6 py-3.5 text-white shadow-[4px_4px_0_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 hover:bg-clay-dark"
              >
                <CursorIcon className="h-4 w-3" />
                Email me this order
              </a>
              <p className="mt-3 text-center text-xs text-muted">
                This opens your email with the order filled in. I&apos;ll reply
                with payment details and postage.
              </p>

              <details className="win mt-5 p-3">
                <summary className="cursor-pointer text-xs text-muted">
                  Nothing happened? Copy the order instead
                </summary>
                <p className="mt-3 text-xs text-muted">
                  Send this to{" "}
                  <a
                    href={`mailto:${site.email}`}
                    className="text-clay underline-offset-2 hover:underline"
                  >
                    {site.email}
                  </a>
                </p>
                <pre className="win-inset mt-2 overflow-x-auto whitespace-pre-wrap bg-white p-2.5 text-xs text-ink">{enquiryText}</pre>
              </details>
            </div>
          ) : (
            <>
              <form action={checkout} className="mt-7">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 border-2 border-ink bg-clay px-6 py-3.5 text-white shadow-[4px_4px_0_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 hover:bg-clay-dark"
                >
                  <CursorIcon className="h-4 w-3" />
                  {mode === "stripe"
                    ? "Checkout with Stripe"
                    : "Place demo order (no payment)"}
                </button>
              </form>

              {mode === "demo" && (
                <p className="mt-3 text-center text-xs text-muted">
                  Demo mode: no Stripe keys are set, so no money will move. Add
                  STRIPE_SECRET_KEY to .env.local to enable real checkout.
                </p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
