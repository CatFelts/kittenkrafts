import "server-only";

import { soldCounts } from "@/lib/db";
import { type Product, products } from "@/lib/products";

export type Stocked = Product & { available: number; soldOut: boolean };

/** Join the static catalog against what the database says has sold. */
export function withStock(list: Product[] = products): Stocked[] {
  const sold = soldCounts();
  return list.map((p) => {
    const available = Math.max(0, p.stock - (sold.get(p.slug) ?? 0));
    return { ...p, available, soldOut: available === 0 };
  });
}

export function stockFor(product: Product): Stocked {
  return withStock([product])[0];
}
