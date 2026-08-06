import "server-only";

import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

/**
 * SQLite holds the things that CHANGE: orders, and how many of each item have
 * sold. The catalog itself lives in src/lib/products.ts, not here.
 *
 * This uses `node:sqlite`, which ships INSIDE Node (>= 22.5, stable in 24).
 * That means no native module to compile — `npm install` never needs Python or
 * Visual Studio Build Tools. If you ever outgrow it, this file is the only one
 * that knows about the database; swap it for better-sqlite3 or Postgres and
 * nothing else changes.
 */

const DB_PATH =
  process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "shop.db");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS orders (
  id                TEXT PRIMARY KEY,
  status            TEXT NOT NULL,          -- 'pending' | 'paid' | 'cancelled'
  mode              TEXT NOT NULL,          -- 'stripe' | 'demo'
  email             TEXT,
  total_cents       INTEGER NOT NULL,
  currency          TEXT NOT NULL,
  items_json        TEXT NOT NULL,          -- what was bought, at the price paid
  stripe_session_id TEXT UNIQUE,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  paid_at           TEXT
);

CREATE TABLE IF NOT EXISTS inventory (
  sku  TEXT PRIMARY KEY,
  sold INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
`;

// Next.js reloads modules on every edit in dev. Cache the handle on globalThis
// so we don't leak a new SQLite connection per hot reload.
const globalForDb = globalThis as unknown as { __kkDb?: DatabaseSync };

export function db(): DatabaseSync {
  if (globalForDb.__kkDb) return globalForDb.__kkDb;

  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const handle = new DatabaseSync(DB_PATH);
  handle.exec("PRAGMA journal_mode = WAL");
  handle.exec("PRAGMA foreign_keys = ON");
  handle.exec(SCHEMA);

  globalForDb.__kkDb = handle;
  return handle;
}

/** Run `fn` inside a transaction, rolling back if it throws. */
function transaction<T>(fn: () => T): T {
  const handle = db();
  handle.exec("BEGIN");
  try {
    const result = fn();
    handle.exec("COMMIT");
    return result;
  } catch (err) {
    handle.exec("ROLLBACK");
    throw err;
  }
}

// --- inventory ---------------------------------------------------------------

/** sku -> units already sold. Missing rows mean zero sold. */
export function soldCounts(): Map<string, number> {
  const rows = db().prepare("SELECT sku, sold FROM inventory").all() as {
    sku: string;
    sold: number;
  }[];
  return new Map(rows.map((r) => [r.sku, Number(r.sold)]));
}

export function soldCount(sku: string): number {
  const row = db()
    .prepare("SELECT sold FROM inventory WHERE sku = ?")
    .get(sku) as { sold: number } | undefined;
  return row ? Number(row.sold) : 0;
}

// --- orders ------------------------------------------------------------------

export type OrderItem = {
  sku: string;
  name: string;
  qty: number;
  unitPriceCents: number;
};

type OrderRow = {
  id: string;
  status: string;
  mode: string;
  email: string | null;
  total_cents: number;
  currency: string;
  items_json: string;
  stripe_session_id: string | null;
  created_at: string;
  paid_at: string | null;
};

export type Order = {
  id: string;
  status: "pending" | "paid" | "cancelled";
  mode: "stripe" | "demo";
  email: string | null;
  total_cents: number;
  currency: string;
  stripe_session_id: string | null;
  created_at: string;
  paid_at: string | null;
  items: OrderItem[];
};

function hydrate(row: OrderRow | undefined): Order | null {
  if (!row) return null;
  return {
    id: row.id,
    status: row.status as Order["status"],
    mode: row.mode as Order["mode"],
    email: row.email,
    total_cents: Number(row.total_cents),
    currency: row.currency,
    stripe_session_id: row.stripe_session_id,
    created_at: row.created_at,
    paid_at: row.paid_at,
    items: JSON.parse(row.items_json) as OrderItem[],
  };
}

export function createOrder(input: {
  id: string;
  mode: "stripe" | "demo";
  items: OrderItem[];
  totalCents: number;
  currency: string;
  stripeSessionId?: string | null;
  status?: "pending" | "paid";
  email?: string | null;
}): void {
  const status = input.status ?? "pending";
  db()
    .prepare(
      `INSERT INTO orders
         (id, status, mode, email, total_cents, currency, items_json, stripe_session_id, paid_at)
       VALUES
         (?, ?, ?, ?, ?, ?, ?, ?, CASE WHEN ? = 'paid' THEN datetime('now') ELSE NULL END)`,
    )
    .run(
      input.id,
      status,
      input.mode,
      input.email ?? null,
      input.totalCents,
      input.currency,
      JSON.stringify(input.items),
      input.stripeSessionId ?? null,
      status,
    );
}

export function getOrder(id: string): Order | null {
  return hydrate(
    db().prepare("SELECT * FROM orders WHERE id = ?").get(id) as
      | OrderRow
      | undefined,
  );
}

export function getOrderBySessionId(sessionId: string): Order | null {
  return hydrate(
    db()
      .prepare("SELECT * FROM orders WHERE stripe_session_id = ?")
      .get(sessionId) as OrderRow | undefined,
  );
}

/**
 * Mark an order paid and decrement inventory, in one transaction.
 *
 * Idempotent: Stripe retries webhooks, and a retry must not sell the same skein
 * twice. Orders already 'paid' are a no-op. Returns true if this call is the
 * one that applied the change.
 */
export function markOrderPaid(orderId: string, email?: string | null): boolean {
  return transaction(() => {
    const row = db()
      .prepare("SELECT status, items_json FROM orders WHERE id = ?")
      .get(orderId) as { status: string; items_json: string } | undefined;

    if (!row) return false;
    if (row.status === "paid") return false; // already applied

    db()
      .prepare(
        `UPDATE orders
            SET status = 'paid',
                paid_at = datetime('now'),
                email = COALESCE(?, email)
          WHERE id = ?`,
      )
      .run(email ?? null, orderId);

    const bump = db().prepare(
      `INSERT INTO inventory (sku, sold) VALUES (?, ?)
       ON CONFLICT(sku) DO UPDATE SET sold = sold + excluded.sold`,
    );
    for (const item of JSON.parse(row.items_json) as OrderItem[]) {
      bump.run(item.sku, item.qty);
    }
    return true;
  });
}

export function listOrders(limit = 100): Order[] {
  const rows = db()
    .prepare("SELECT * FROM orders ORDER BY created_at DESC, id DESC LIMIT ?")
    .all(limit) as OrderRow[];
  return rows.map((r) => hydrate(r)!);
}
