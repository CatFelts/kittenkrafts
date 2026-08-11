import Link from "next/link";

import { ProductImage } from "@/components/Placeholder";
import { Window } from "@/components/Window";
import type { Stocked } from "@/lib/inventory";
import { formatCents } from "@/lib/money";

/** Turns "moss-agate-worsted" into "moss_agate.jpg" for the title bar. */
function fileName(slug: string): string {
  return `${slug.replace(/-/g, "_").slice(0, 22)}.jpg`;
}

export function ProductCard({ product }: { product: Stocked }) {
  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group block transition-transform hover:-translate-y-1"
    >
      <Window title={fileName(product.slug)}>
        <div className="win-inset relative aspect-square w-full overflow-hidden bg-white">
          <ProductImage
            src={product.image}
            alt={product.name}
            seed={product.slug}
            className="h-full w-full transition-transform duration-300 group-hover:scale-[1.04]"
          />
          {product.soldOut && (
            <span className="absolute left-2 top-2 border-2 border-ink bg-ink px-2 py-1 text-xs uppercase tracking-wide text-white">
              Sold!
            </span>
          )}
          {!product.soldOut && product.stock === 1 && (
            <span className="absolute left-2 top-2 border-2 border-white bg-moss px-2 py-1 text-xs uppercase tracking-wide text-white">
              1 of 1 ⋆
            </span>
          )}
        </div>

        <div className="px-2 pb-2 pt-3">
          <h3 className="text-lg leading-tight">{product.name}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
            {product.blurb}
          </p>
          <p className="mt-3 inline-block border-2 border-clay bg-white px-2 py-0.5 text-sm font-bold text-clay">
            {formatCents(product.priceCents)}
          </p>
        </div>
      </Window>
    </Link>
  );
}
