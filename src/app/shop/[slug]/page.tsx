import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { addToCart } from "@/app/actions/cart";
import { ProductImage } from "@/components/Placeholder";
import { stockFor } from "@/lib/inventory";
import { formatCents } from "@/lib/money";
import { CATEGORY_LABELS, getProduct } from "@/lib/products";
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

  const product = stockFor(base);

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <Link href="/shop" className="text-sm text-muted hover:text-clay">
        ← Back to shop
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div className="overflow-hidden rounded-lg border border-line">
          <ProductImage
            src={product.image}
            alt={product.name}
            seed={product.slug}
            className="aspect-square w-full"
          />
        </div>

        <div>
          <p className="text-sm uppercase tracking-[0.15em] text-muted">
            {CATEGORY_LABELS[product.category]}
          </p>
          <h1 className="mt-2 text-3xl">{product.name}</h1>
          <p className="mt-3 text-2xl text-clay">
            {formatCents(product.priceCents)}
          </p>

          <p className="mt-6 leading-relaxed text-muted">
            {product.description}
          </p>

          <dl className="mt-8 divide-y divide-line border-y border-line text-sm">
            {Object.entries(product.details).map(([label, value]) => (
              <div key={label} className="flex justify-between gap-6 py-2.5">
                <dt className="text-muted">{label}</dt>
                <dd className="text-right">{value}</dd>
              </div>
            ))}
          </dl>

          {error === "sold-out" && (
            <p className="mt-6 rounded-md border border-clay/30 bg-clay/5 px-4 py-3 text-sm text-clay">
              Sorry — that one sold while you were looking at it.
            </p>
          )}

          <div className="mt-8">
            {product.soldOut ? (
              <div>
                <p className="rounded-md border border-line bg-cream px-4 py-3 text-sm text-muted">
                  Sold out. This piece was one of a kind, but similar fibres turn
                  up regularly.
                </p>
                <a
                  href={`mailto:${site.email}?subject=${encodeURIComponent(
                    `Something like ${product.name}`,
                  )}`}
                  className="mt-3 inline-block text-sm text-clay hover:underline"
                >
                  Ask me about a commission →
                </a>
              </div>
            ) : (
              <form action={addToCart}>
                <input type="hidden" name="sku" value={product.slug} />
                <button
                  type="submit"
                  className="w-full rounded-full bg-clay px-6 py-3.5 text-white transition-colors hover:bg-clay-dark sm:w-auto sm:px-10"
                >
                  Add to cart
                </button>
                <p className="mt-3 text-sm text-muted">
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
