/**
 * The database schema, in one place.
 *
 * Deliberately NOT applied on cold start — that would add a round trip to every
 * request to re-learn something that never changes. `npm run db:init` applies
 * it, and every statement is IF NOT EXISTS so re-running is always safe.
 *
 * No `server-only` import here: the init script runs outside Next.js.
 */
export const SCHEMA: readonly string[] = [
  `CREATE TABLE IF NOT EXISTS orders (
     id                TEXT PRIMARY KEY,
     status            TEXT NOT NULL,          -- 'pending' | 'paid' | 'cancelled'
     mode              TEXT NOT NULL,          -- 'stripe' | 'demo'
     email             TEXT,
     total_cents       INTEGER NOT NULL,
     currency          TEXT NOT NULL,
     items_json        JSONB NOT NULL,         -- what was bought, at the price paid
     stripe_session_id TEXT UNIQUE,
     created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
     paid_at           TIMESTAMPTZ
   )`,
  `CREATE TABLE IF NOT EXISTS inventory (
     sku  TEXT PRIMARY KEY,
     sold INTEGER NOT NULL DEFAULT 0
   )`,
  `CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`,
  `CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC)`,
];
