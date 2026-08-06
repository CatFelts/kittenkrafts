import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { timingSafeEqual } from "node:crypto";

import { isDbAvailable, listOrders } from "@/lib/db";
import { withStock } from "@/lib/inventory";
import { formatCents } from "@/lib/money";

export const metadata: Metadata = { title: "Orders", robots: { index: false } };

const COOKIE = "kk_admin";

/**
 * PROTOTYPE AUTH — a single shared password from ADMIN_PASSWORD, kept in an
 * httpOnly cookie. Good enough for a private prototype on your own machine.
 * Replace with a real auth provider before this handles real customer data.
 */
function checkPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function signIn(formData: FormData): Promise<void> {
  "use server";
  const password = formData.get("password");
  if (typeof password !== "string" || !checkPassword(password)) {
    redirect("/admin/orders?error=1");
  }
  const store = await cookies();
  store.set(COOKIE, password, {
    httpOnly: true,
    sameSite: "lax",
    path: "/admin",
    maxAge: 60 * 60 * 8,
    secure: process.env.NODE_ENV === "production",
  });
  redirect("/admin/orders");
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const store = await cookies();
  const authed = checkPassword(store.get(COOKIE)?.value ?? "");

  // No database means no orders to show and no stock to reconcile — this whole
  // page is meaningless. Say so plainly rather than rendering an empty table
  // that looks like "you have made no sales".
  if (!isDbAvailable()) {
    return (
      <div className="mx-auto max-w-md px-5 py-20">
        <h1 className="text-2xl">Orders</h1>
        <p className="mt-4 text-sm text-muted">
          This deployment has no database, so orders aren&apos;t recorded here.
          Purchases arrive by email, and available stock is whatever{" "}
          <code className="text-ink">src/lib/products.ts</code> says.
        </p>
        <p className="mt-3 text-sm text-muted">
          Run the site locally to use this dashboard.
        </p>
      </div>
    );
  }

  if (!process.env.ADMIN_PASSWORD) {
    return (
      <div className="mx-auto max-w-md px-5 py-20">
        <h1 className="text-2xl">Orders</h1>
        <p className="mt-4 text-sm text-muted">
          Set <code className="text-ink">ADMIN_PASSWORD</code> in{" "}
          <code className="text-ink">.env.local</code> and restart the dev server
          to enable this page.
        </p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-sm px-5 py-20">
        <h1 className="text-2xl">Orders</h1>
        <form action={signIn} className="mt-6 space-y-3">
          <input
            type="password"
            name="password"
            placeholder="Admin password"
            autoComplete="current-password"
            className="w-full rounded-md border border-line bg-white px-3 py-2"
          />
          <button
            type="submit"
            className="w-full rounded-full bg-clay px-6 py-2.5 text-sm text-white hover:bg-clay-dark"
          >
            Sign in
          </button>
          {error && <p className="text-sm text-clay">Incorrect password.</p>}
        </form>
      </div>
    );
  }

  const orders = listOrders();
  const stock = withStock();

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="text-3xl">Orders</h1>

      <h2 className="mt-10 text-xl">Stock</h2>
      <table className="mt-4 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-line text-left text-muted">
            <th className="py-2 font-normal">Item</th>
            <th className="py-2 font-normal">Made</th>
            <th className="py-2 font-normal">Available</th>
          </tr>
        </thead>
        <tbody>
          {stock.map((p) => (
            <tr key={p.slug} className="border-b border-line">
              <td className="py-2">{p.name}</td>
              <td className="py-2">{p.stock}</td>
              <td className={`py-2 ${p.soldOut ? "text-clay" : ""}`}>
                {p.soldOut ? "sold out" : p.available}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="mt-12 text-xl">Recent orders</h2>
      {orders.length === 0 ? (
        <p className="mt-4 text-muted">No orders yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {orders.map((order) => (
            <li
              key={order.id}
              className="rounded-lg border border-line bg-white p-4 text-sm"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-mono">{order.id}</span>
                <span className="text-muted">{order.created_at} UTC</span>
              </div>
              <div className="mt-1 flex flex-wrap gap-3 text-muted">
                <span
                  className={order.status === "paid" ? "text-moss" : "text-clay"}
                >
                  {order.status}
                </span>
                <span>{order.mode}</span>
                <span>{order.email ?? "no email"}</span>
                <span className="ml-auto text-ink">
                  {formatCents(order.total_cents)}
                </span>
              </div>
              <p className="mt-2 text-muted">
                {order.items
                  .map((i) => `${i.name}${i.qty > 1 ? ` ×${i.qty}` : ""}`)
                  .join(", ")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
