import Link from "next/link";

import { ProductCard } from "@/components/ProductCard";
import { withStock } from "@/lib/inventory";
import { featuredProducts } from "@/lib/products";
import { site } from "@/lib/site";

/** Shows live sold-out badges, so never serve from a static cache. */
export const dynamic = "force-dynamic";

export default function HomePage() {
  const featured = withStock(featuredProducts());

  return (
    <>
      <section className="border-b border-line bg-cream">
        <div className="mx-auto max-w-5xl px-5 py-20 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-muted">
            Small batch · made by hand
          </p>
          <h1 className="mx-auto mt-4 max-w-2xl text-4xl leading-tight sm:text-5xl">
            {site.tagline}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-muted">
            Every skein is spun on my wheel and every bag is cut and sewn at my
            table. Most pieces are one of a kind — once a listing sells, that
            exact colourway is gone.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/shop"
              className="rounded-full bg-clay px-6 py-3 text-sm text-white transition-colors hover:bg-clay-dark"
            >
              Shop everything
            </Link>
            <Link
              href="/about"
              className="rounded-full border border-line bg-white px-6 py-3 text-sm transition-colors hover:border-clay hover:text-clay"
            >
              How it's made
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-16">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl">In the shop now</h2>
          <Link href="/shop" className="text-sm text-clay hover:underline">
            View all →
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-4">
        <div className="grid gap-6 rounded-lg border border-line bg-white p-8 sm:grid-cols-3">
          {[
            {
              title: "Spun to order of one",
              body: "Fibre is dyed, carded and spun in single-skein batches. No two runs match.",
            },
            {
              title: "Built to be used",
              body: "Bags use waxed canvas, linen and real hardware — meant to be carried, not shelved.",
            },
            {
              title: "Packed carefully",
              body: site.shippingNote,
            },
          ].map((card) => (
            <div key={card.title}>
              <h3 className="text-lg">{card.title}</h3>
              <p className="mt-2 text-sm text-muted">{card.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
