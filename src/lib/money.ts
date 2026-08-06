export const CURRENCY = "usd";

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: CURRENCY.toUpperCase(),
});

/** 4800 -> "$48.00" */
export function formatCents(cents: number): string {
  return formatter.format(cents / 100);
}
