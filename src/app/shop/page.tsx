import type { Metadata } from "next";
import Link from "next/link";

import { FolderIcon, FolderOpenIcon } from "@/components/Icons";
import { ProductCard } from "@/components/ProductCard";
import { withStock } from "@/lib/inventory";
import {
  CATEGORIES,
  CATEGORY_KEYS,
  type Category,
  listProducts,
} from "@/lib/products";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Shop" };

/** Stock changes when things sell, so never serve this from a static cache. */
export const dynamic = "force-dynamic";

/** Built from CATEGORIES, so a new category gets a folder for free. */
const FILTERS: { key: Category | "all"; label: string }[] = [
  { key: "all", label: "Everything" },
  ...CATEGORY_KEYS.map((key) => ({ key, label: CATEGORIES[key].label })),
];

function isCategory(value: string | undefined): value is Category {
  return value !== undefined && value in CATEGORIES;
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

  const available = items.filter((i) => !i.soldOut).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Faux address bar. Sets the file-explorer frame the folders live in. */}
      <div className="win flex items-center gap-2 px-2 py-1.5 text-xs">
        <span className="shrink-0 text-muted">Address</span>
        <span className="win-inset flex-1 truncate bg-white px-2 py-1 font-mono text-ink">
          C:\{site.name.toLowerCase().replace(/\s+/g, "")}\{active ?? "all"}\
        </span>
      </div>

      <h1 className="mt-6 text-3xl text-clay">
        {active ? CATEGORIES[active].label : "The whole shop"}
      </h1>
      <p className="mt-1 text-xs text-muted">
        {available} available right now.
      </p>

      {/* Category folders. Each is a real link, so it works without JS and
          middle-click opens in a new tab like any other link. */}
      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const isActive = (active ?? "all") === filter.key;
          const Icon = isActive ? FolderOpenIcon : FolderIcon;
          return (
            <Link
              key={filter.key}
              href={filter.key === "all" ? "/shop" : `/shop?category=${filter.key}`}
              aria-current={isActive ? "page" : undefined}
              className={
                isActive
                  ? "flex w-24 flex-col items-center gap-1 border-2 border-dotted border-ink bg-cream px-2 py-2 text-center"
                  : "flex w-24 flex-col items-center gap-1 border-2 border-dotted border-transparent px-2 py-2 text-center transition-colors hover:border-line hover:bg-cream/60"
              }
            >
              <Icon className="h-8 w-10" />
              <span
                className={
                  isActive
                    ? "bg-clay px-1 text-[11px] leading-tight text-white"
                    : "px-1 text-[11px] leading-tight text-muted"
                }
              >
                {filter.label}
              </span>
            </Link>
          );
        })}
      </div>

      {items.length === 0 ? (
        <div className="win mt-10 p-6 text-center">
          <p className="text-sm text-muted">
            This folder is empty — check back soon.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
