import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { addToCart } from "@/app/actions/cart";
import { CursorIcon, SparkleIcon } from "@/components/Icons";
import { ProductImage } from "@/components/Placeholder";
import { Window } from "@/components/Window";
import { stockFor } from "@/lib/inventory";
import { formatCents } from "@/lib/money";
import { CATEGORIES, getProduct } from "@/lib/products";
import { site } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
};

/**
 * Render on every request, never from a static cache.
 *
 * Stock lives in the database and changes the moment something sells. If this
 * page were prerendered it would keep offering an "Add to cart" button for a
 * skein that is already gone. At this scale a per-request render costs
 * ~1ms, so correctness wins.
 *
 * (Do not replace this with generateStaticParams unless you also add
 * revalidation after every purchase.)
 */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Not found" };
  return { title: product.name, description: product.blurb };
}

export default async function ProductPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { error } = await searchParams;

  const base = getProduct(slug);
  if (!base) notFound();

  const product = await stockFor(base);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link
        href="/shop"
        className="text-xs text-muted underline-offset-2 hover:text-clay hover:underline"
      >
        ← back to the shop
      </Link>

      <div className="mt-5 grid gap-8 md:grid-cols-2">
        <Window title={`${slug.replace(/-/g, "_").slice(0, 22)}.jpg`}>
          <div className="win-inset bg-white">
            <ProductImage
              src={product.image}
              alt={product.name}
              seed={product.slug}
              className="aspect-square w-full"
            />
          </div>
        </Window>

        <div>
          <p className="text-[11px] uppercase tracking-[0.15em] text-muted">
            {CATEGORIES[product.category].label}
          </p>
          <h1 className="mt-1 text-3xl text-clay">{product.name}</h1>

          <p className="mt-3 inline-block border-2 border-ink bg-lime px-3 py-1 text-2xl text-ink shadow-[3px_3px_0_0_var(--color-ink)]">
            {formatCents(product.priceCents)}
          </p>

          <p className="mt-6 text-xs leading-relaxed text-muted">
            {product.description}
          </p>

          {/* Spec table, styled as a sunken window panel. */}
          <dl className="win-inset mt-7 divide-y-2 divide-line bg-white text-xs">
            {Object.entries(product.details).map(([label, value]) => (
              <div key={label} className="flex justify-between gap-5 px-3 py-2">
                <dt className="text-muted">{label}</dt>
                <dd className="text-right text-ink">{value}</dd>
              </div>
            ))}
          </dl>

          {error === "sold-out" && (
            <p className="mt-6 border-2 border-clay bg-cream px-3 py-2.5 text-xs text-clay">
              Sorry — that one sold while you were looking at it.
            </p>
          )}

          <div className="mt-7">
            {product.soldOut ? (
              <div>
                <p className="win px-4 py-3 text-xs text-muted">
                  Sold out. This piece was one of a kind, but similar fibres
                  turn up regularly.
                </p>
                <a
                  href={`mailto:${site.email}?subject=${encodeURIComponent(
                    `Something like ${product.name}`,
                  )}`}
                  className="mt-3 inline-block text-xs text-clay underline-offset-2 hover:underline"
                >
                  Ask me about a commission →
                </a>
              </div>
            ) : (
              <form action={addToCart}>
                <input type="hidden" name="sku" value={product.slug} />
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 border-2 border-ink bg-clay px-6 py-3 text-white shadow-[4px_4px_0_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 hover:bg-clay-dark active:translate-y-0 active:shadow-[2px_2px_0_0_var(--color-ink)] sm:w-auto sm:px-10"
                >
                  <CursorIcon className="h-4 w-3" />
                  Add to cart
                </button>
                <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
                  <SparkleIcon className="h-3 w-3 text-shock" />
                  {product.available === 1
                    ? "Only one available."
                    : `${product.available} available.`}{" "}
                  {site.shippingNote}
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
