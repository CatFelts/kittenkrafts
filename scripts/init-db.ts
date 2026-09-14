/**
 * Create the tables in Neon. Run once when you set the database up, and again
 * after any schema change:
 *
 *   npm run db:init
 *
 * Safe to re-run — every statement is IF NOT EXISTS. It never drops anything,
 * so it cannot destroy order history.
 */
import { neon } from "@neondatabase/serverless";

import { SCHEMA } from "../src/lib/schema.ts";

const url = process.env.DATABASE_URL?.trim();

if (!url) {
  console.error(
    "No DATABASE_URL.\n\n" +
      "Put your Neon connection string in .env.local:\n" +
      "  DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require\n",
  );
  process.exit(1);
}

const sql = neon(url);

for (const statement of SCHEMA) {
  const label = statement.trim().split("\n")[0].trim();
  await sql.query(statement);
  console.log(`  ok  ${label}`);
}

const [{ count }] = (await sql`SELECT count(*)::int AS count FROM orders`) as {
  count: number;
}[];

console.log(`\nSchema is up to date. ${count} order(s) recorded.`);
