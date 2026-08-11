import Link from "next/link";

import { CursorIcon, SparkleIcon } from "@/components/Icons";
import { ProductCard } from "@/components/ProductCard";
import { Window } from "@/components/Window";
import { withStock } from "@/lib/inventory";
import { featuredProducts } from "@/lib/products";
import { site } from "@/lib/site";

/** Shows live sold-out badges, so never serve from a static cache. */
export const dynamic = "force-dynamic";

export default function HomePage() {
  const featured = withStock(featuredProducts());

  return (
    <>
      {/* Scrolling banner. Pure decoration, so aria-hidden — a screen reader
          reading a looping marquee is a genuinely bad time. */}
      <div
        className="marquee border-b-2 border-clay bg-lime py-1 text-xs text-ink"
        aria-hidden="true"
      >
        <span>
          ⋆ welcome to {site.name} ⋆ everything here is made by hand ⋆ most
          pieces are one of a kind ⋆ once it&apos;s gone it&apos;s gone ⋆ thanks
          for visiting my corner of the web ⋆
        </span>
      </div>

      <section className="cheetah border-b-4 border-clay">
        <div className="mx-auto max-w-5xl px-4 py-14 text-center">
          <div className="mx-auto max-w-2xl">
            <Window title="welcome.html" className="text-left">
              <div className="bg-paper px-5 py-8 text-center sm:px-8">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
                  ⋆ small batch ⋆ made by hand ⋆
                </p>
                <h1 className="mt-3 text-3xl leading-tight text-clay sm:text-5xl">
                  {site.tagline}
                </h1>
                <p className="mx-auto mt-4 max-w-lg text-xs leading-relaxed text-muted">
                  Every skein is spun on my wheel and every bag is cut and sewn
                  at my table. Most pieces are one of a kind — once a listing
                  sells, that exact colourway is gone for good.
                </p>

                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <Link
                    href="/shop"
                    className="flex items-center gap-2 border-2 border-ink bg-clay px-5 py-2.5 text-sm text-white shadow-[3px_3px_0_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 hover:bg-clay-dark"
                  >
                    <CursorIcon className="h-4 w-3" />
                    Enter the shop
                  </Link>
                  <Link
                    href="/about"
                    className="border-2 border-ink bg-turq px-5 py-2.5 text-sm text-ink shadow-[3px_3px_0_0_var(--color-ink)] transition-transform hover:-translate-y-0.5"
                  >
                    How it&apos;s made
                  </Link>
                </div>
              </div>
            </Window>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-2xl text-clay">
            <SparkleIcon className="twinkle h-5 w-5 text-shock" />
            In the shop now
          </h2>
          <Link
            href="/shop"
            className="text-xs text-muted underline-offset-2 hover:text-clay hover:underline"
          >
            view all →
          </Link>
        </div>

        <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Spun to order of one",
              body: "Fibre is spun in single-skein batches. No two runs will match exactly.",
              tint: "bg-turq",
            },
            {
              title: "Made from the heart &hearts;",
              body: "This is my passion project, thanks for checking it out [:",
              tint: "bg-lime",
            },
            {
              title: "Packed carefully",
              body: site.shippingNote,
              tint: "bg-shock",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="border-2 border-ink bg-white shadow-[3px_3px_0_0_var(--color-ink)]"
            >
              <div className={`border-b-2 border-ink ${card.tint} px-3 py-1.5`}>
                <h3 className="text-base text-ink">{card.title}</h3>
              </div>
              <p className="px-3 py-3 text-xs leading-relaxed text-muted">
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
