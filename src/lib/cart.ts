import "server-only";

import { cookies } from "next/headers";

import { withStock } from "@/lib/inventory";
import { getProduct } from "@/lib/products";

/**
 * The cart lives in a plain cookie holding only [{sku, qty}].
 *
 * SECURITY NOTE: the cookie is not signed, and it does not need to be. It never
 * carries a price. Every total on every page — and the amount charged at
 * checkout — is recomputed from src/lib/products.ts server-side. A customer
 * editing their own cookie can only change *which* items they are buying, and
 * they will be charged this catalog's price for them.
 */

const COOKIE = "kk_cart";
const MAX_QTY_PER_LINE = 20;

export type CartLine = { sku: string; qty: number };

export type CartItem = {
  sku: string;
  name: string;
  slug: string;
  qty: number;
  /** Clamped to what is actually still available. */
  available: number;
  unitPriceCents: number;
  lineTotalCents: number;
  image: string | null;
};

export type Cart = {
  items: CartItem[];
  subtotalCents: number;
  count: number;
  /** True if any line had to be trimmed because stock ran out. */
  adjusted: boolean;
};

function parse(raw: string | undefined): CartLine[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((entry): CartLine[] => {
      if (typeof entry !== "object" || entry === null) return [];
      const { sku, qty } = entry as Record<string, unknown>;
      if (typeof sku !== "string" || typeof qty !== "number") return [];
      const clean = Math.floor(qty);
      if (!Number.isFinite(clean) || clean < 1) return [];
      return [{ sku, qty: Math.min(clean, MAX_QTY_PER_LINE) }];
    });
  } catch {
    return [];
  }
}

/** Raw cookie contents. Safe to call from pages. */
export async function readCartLines(): Promise<CartLine[]> {
  const store = await cookies();
  return parse(store.get(COOKIE)?.value);
}

/** Only callable from a Server Action or Route Handler. */
export async function writeCartLines(lines: CartLine[]): Promise<void> {
  const store = await cookies();
  const kept = lines.filter((l) => l.qty > 0);

  if (kept.length === 0) {
    store.delete(COOKIE);
    return;
  }

  store.set(COOKIE, JSON.stringify(kept), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearCart(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

/**
 * Resolve the cookie into a priced cart. Drops items that no longer exist in
 * the catalog and trims quantities down to what is still in stock.
 */
export async function getCart(): Promise<Cart> {
  const lines = await readCartLines();
  const stocked = new Map(
    (await withStock()).map((p) => [p.slug, p]),
  );

  let adjusted = false;
  const items: CartItem[] = [];

  for (const line of lines) {
    const product = stocked.get(line.sku);
    if (!product) {
      adjusted = true;
      continue;
    }

    const qty = Math.min(line.qty, product.available);
    if (qty !== line.qty) adjusted = true;
    if (qty < 1) continue;

    items.push({
      sku: product.slug,
      slug: product.slug,
      name: product.name,
      qty,
      available: product.available,
      unitPriceCents: product.priceCents,
      lineTotalCents: product.priceCents * qty,
      image: product.image,
    });
  }

  return {
    items,
    subtotalCents: items.reduce((sum, i) => sum + i.lineTotalCents, 0),
    count: items.reduce((sum, i) => sum + i.qty, 0),
    adjusted,
  };
}

/** Cheap badge count for the header — avoids a full price/stock join. */
export async function cartCount(): Promise<number> {
  const lines = await readCartLines();
  return lines
    .filter((l) => getProduct(l.sku))
    .reduce((sum, l) => sum + l.qty, 0);
}
