import type { Metadata } from "next";
import Link from "next/link";

import { ProductCard } from "@/components/ProductCard";
import { withStock } from "@/lib/inventory";
import { CATEGORY_LABELS, type Category, listProducts } from "@/lib/products";

export const metadata: Metadata = { title: "Shop" };

/** Stock changes when things sell, so never serve this from a static cache. */
export const dynamic = "force-dynamic";

const FILTERS: { key: Category | "all"; label: string }[] = [
  { key: "all", label: "Everything" },
  { key: "yarn", label: CATEGORY_LABELS.yarn },
  { key: "bags", label: CATEGORY_LABELS.bags },
];

function isCategory(value: string | undefined): value is Category {
  return value === "yarn" || value === "bags";
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const active = isCategory(category) ? category : undefined;

  // Sort so sold-out pieces sink to the bottom.
  const items = withStock(listProducts(active)).sort(
    (a, b) => Number(a.soldOut) - Number(b.soldOut),
  );

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="text-3xl">
        {active ? CATEGORY_LABELS[active] : "The whole shop"}
      </h1>
      <p className="mt-2 text-muted">
        {items.filter((i) => !i.soldOut).length} available right now.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const isActive = (active ?? "all") === filter.key;
          return (
            <Link
              key={filter.key}
              href={filter.key === "all" ? "/shop" : `/shop?category=${filter.key}`}
              className={
                isActive
                  ? "rounded-full bg-ink px-4 py-1.5 text-sm text-white"
                  : "rounded-full border border-line bg-white px-4 py-1.5 text-sm text-muted transition-colors hover:border-clay hover:text-clay"
              }
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      {items.length === 0 ? (
        <p className="mt-16 text-muted">Nothing here yet — check back soon.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
