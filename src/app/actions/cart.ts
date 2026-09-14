"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { readCartLines, writeCartLines } from "@/lib/cart";
import { stockFor } from "@/lib/inventory";
import { getProduct } from "@/lib/products";

/**
 * Every cart mutation is a Server Action invoked by a plain <form action={...}>.
 * No client-side JavaScript, no fetch calls, no API routes to keep in sync.
 */

function readSku(formData: FormData): string | null {
  const sku = formData.get("sku");
  return typeof sku === "string" && sku.length > 0 ? sku : null;
}

export async function addToCart(formData: FormData): Promise<void> {
  const sku = readSku(formData);
  if (!sku) return;

  const product = getProduct(sku);
  if (!product) return;

  const { available } = await stockFor(product);
  if (available < 1) {
    redirect(`/shop/${sku}?error=sold-out`);
  }

  const lines = await readCartLines();
  const existing = lines.find((l) => l.sku === sku);
  const nextQty = Math.min((existing?.qty ?? 0) + 1, available);

  if (existing) {
    existing.qty = nextQty;
  } else {
    lines.push({ sku, qty: nextQty });
  }

  await writeCartLines(lines);
  revalidatePath("/", "layout");
  redirect("/cart?added=" + encodeURIComponent(sku));
}

export async function setQuantity(formData: FormData): Promise<void> {
  const sku = readSku(formData);
  const raw = formData.get("qty");
  if (!sku || typeof raw !== "string") return;

  const requested = Number.parseInt(raw, 10);
  if (!Number.isFinite(requested)) return;

  const product = getProduct(sku);
  if (!product) return;

  const { available } = await stockFor(product);
  const qty = Math.max(0, Math.min(requested, available));

  const lines = (await readCartLines()).filter((l) => l.sku !== sku);
  if (qty > 0) lines.push({ sku, qty });

  await writeCartLines(lines);
  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

export async function removeFromCart(formData: FormData): Promise<void> {
  const sku = readSku(formData);
  if (!sku) return;

  await writeCartLines((await readCartLines()).filter((l) => l.sku !== sku));
  revalidatePath("/cart");
  revalidatePath("/", "layout");
}
