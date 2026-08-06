import Link from "next/link";

import { ProductImage } from "@/components/Placeholder";
import type { Stocked } from "@/lib/inventory";
import { formatCents } from "@/lib/money";

export function ProductCard({ product }: { product: Stocked }) {
  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group block overflow-hidden rounded-lg border border-line bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden">
        <ProductImage
          src={product.image}
          alt={product.name}
          seed={product.slug}
          className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {product.soldOut && (
          <span className="absolute left-3 top-3 rounded-full bg-ink/85 px-3 py-1 text-xs uppercase tracking-wide text-white">
            Sold
          </span>
        )}
        {!product.soldOut && product.stock === 1 && (
          <span className="absolute left-3 top-3 rounded-full bg-moss px-3 py-1 text-xs uppercase tracking-wide text-white">
            One of a kind
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{product.blurb}</p>
        <p className="mt-3 text-sm font-medium text-clay">
          {formatCents(product.priceCents)}
        </p>
      </div>
    </Link>
  );
}
