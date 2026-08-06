# Kittens Krafts

A small storefront for selling handmade goods — handspun yarn, sewn bags, and
whatever else comes off the table. Built to be maintained by one person.

---

## Quick start

```bash
npm install
```

```bash
npm run dev
```

Open <http://localhost:3000>. That's it — **no configuration required**. With no
Stripe keys set, checkout runs in *demo mode*: orders are recorded and stock is
decremented, but no money moves. You can click the entire buy flow immediately.

Requires **Node 22.5 or newer** (Node 24 LTS recommended). There are no native
modules, so `npm install` never needs Python or a C++ compiler.

### The three commands you'll actually use

```bash
npm run dev
```

```bash
npm run build
```

```bash
npm run typecheck
```

---

## The stack, and why

| Piece | Choice | Why this one |
| --- | --- | --- |
| Framework | Next.js 15 (App Router) | Pages are **Server Components** — plain async functions that run on the server. You write TypeScript that queries data and returns HTML. Almost no browser JavaScript to reason about. |
| Mutations | **Server Actions** | A `<form action={someFunction}>` calls a server function directly. No REST endpoints, no `fetch`, no client state library, no loading spinners to wire up. |
| Styling | Tailwind v4 | Every colour and font is declared once in `src/app/globals.css`. Change a value there, the whole site follows. |
| Catalog | A TypeScript file | Your inventory is a handful of one-off pieces, not a database problem. `src/lib/products.ts` is typed, diffable, and greppable. No CMS to host or admin UI to build. |
| Orders + stock | SQLite via `node:sqlite` | Built into Node. One file on disk, real SQL, zero setup, nothing to compile. |
| Payments | Stripe Checkout (hosted) | Stripe hosts the payment page. Card numbers never touch your server, so PCI scope stays near zero and there is no payment form to build. |

**The one idea worth internalising:** there is no client/server split to keep in
sync. A page is a function that runs on the server. A button is a form that
calls another function on the server. That's the whole architecture.

---

## Where things live

```
src/
  lib/
    products.ts    ← THE CATALOG. Edit this to add or change what you sell.
    site.ts        ← Shop name, email, shipping blurb.
    db.ts          ← SQLite: orders + how many of each item sold.
    cart.ts        ← Cart, stored in a cookie.
    inventory.ts   ← Joins the catalog against what's sold.
    money.ts       ← Cents → "$48.00".
    stripe.ts      ← Stripe client; detects whether keys are configured.
  app/
    page.tsx                     Home
    shop/page.tsx                Product grid + category filter
    shop/[slug]/page.tsx         Product detail
    cart/page.tsx                Cart + checkout button
    about/page.tsx               About
    admin/orders/page.tsx        Your orders + stock dashboard
    order/complete/route.ts      Post-payment landing; clears the cart
    order/success/page.tsx       Receipt
    api/stripe/webhook/route.ts  Stripe webhook — the authority on "paid"
    actions/cart.ts              add / update / remove
    actions/checkout.ts          cart → order
  components/                    Header, Footer, ProductCard, image placeholder
data/shop.db                     Created on first run. Gitignored.
```

---

## Day-to-day: adding a piece

Open `src/lib/products.ts` and append to the `products` array:

```ts
{
  slug: "storm-cloud-dk",        // URL + primary key. Never change after a sale.
  name: "Storm Cloud",
  category: "yarn",              // "yarn" | "bags"
  priceCents: 5200,              // $52.00 — cents, so no float bugs
  stock: 1,                      // how many exist. One-of-a-kind = 1
  blurb: "DK two-ply in slate and pewter.",
  description: "Longer paragraph shown on the product page.",
  details: {
    Fibre: "100% Shetland",
    Yardage: "230 yd (210 m)",
  },
  image: "/images/storm-cloud.jpg",  // or null for a generated placeholder
  featured: true,                     // optional: show on the homepage
},
```

Save. In `dev` it appears on refresh.

**Photos:** drop files into `public/images/` and point `image` at
`/images/yourfile.jpg`. Leave `image: null` and you get a coloured placeholder
tile — the site looks finished before you've shot anything. Square images at
about 1200×1200 work best.

**Stock:** you only ever edit `stock` if you physically make more. Sales are
tracked separately in the database, and the shop displays `stock − sold`.

**Categories:** to add a third (say, "prints"), add it to the `Category` union
and `CATEGORY_LABELS` in `products.ts`, then add a filter entry in
`src/app/shop/page.tsx`. Two small edits; TypeScript will point at both.

---

## Changing how it looks

Everything visual starts in `src/app/globals.css`:

```css
@theme {
  --color-clay: #a4553a;   /* buttons and links */
  --color-paper: #faf7f2;  /* page background */
  --color-ink: #241f1b;    /* body text */
  ...
}
```

Those names become utility classes automatically — `--color-clay` gives you
`bg-clay`, `text-clay`, `border-clay`. Change the hex, and every button on the
site changes.

Shop name, contact email and the shipping line live in `src/lib/site.ts`.

---

## Your orders dashboard

Set a password in `.env.local`:

```
ADMIN_PASSWORD=something-long-and-private
```

Restart the dev server, then visit <http://localhost:3000/admin/orders> for a
live stock table and every order placed.

> This is a single shared password held in an httpOnly cookie — fine for a
> private prototype, not real auth. Put it behind a proper identity provider
> before it guards real customer data.

---

## Taking real payments

1. Make a Stripe account and grab your **test** keys from
   <https://dashboard.stripe.com/test/apikeys>.
2. Copy `.env.example` to `.env.local` and set `STRIPE_SECRET_KEY=sk_test_...`.
3. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and forward
   webhooks to your machine:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

4. Paste the `whsec_...` it prints into `STRIPE_WEBHOOK_SECRET` in `.env.local`.
5. Restart `npm run dev`. The checkout button now says "Checkout with Stripe".
   Pay with test card `4242 4242 4242 4242`, any future expiry, any CVC.

Go live by swapping the test keys for live ones and pointing a real webhook
endpoint at `https://yourdomain.com/api/stripe/webhook`.

### How payment actually settles

The browser redirect after payment is a **convenience**, not proof. The customer
can close the tab, lose signal, or fake the URL. The webhook
(`api/stripe/webhook/route.ts`) is the only thing that marks an order paid, and
`markOrderPaid()` is idempotent, so Stripe's retries can't sell the same skein
twice.

### Why the cart cookie isn't signed

It holds only `[{sku, qty}]` — never a price. Every total, including the amount
charged, is recomputed server-side from `products.ts`. A customer editing their
own cookie can only change *which* items they're buying, at your prices.

---

## Deploying

**Vercel** is the least-effort host for Next.js, but note that its filesystem is
ephemeral — a SQLite file will be wiped on redeploy. On Vercel, swap `db.ts` for
a hosted database (Vercel Postgres, Turso, Neon). `db.ts` is the only file that
knows about storage.

**To keep SQLite**, deploy to a host with a real disk — a $5 VPS, Fly.io with a
volume, or Railway:

```bash
npm run build
```

```bash
npm run start
```

Set `NEXT_PUBLIC_SITE_URL` to your real origin so Stripe redirects land in the
right place. **Back up `data/shop.db`** — it's your order history.

---

## Known limits of the prototype

Honest list, so nothing surprises you later:

- **No shipping calculation.** Stripe collects an address; postage is a flat
  assumption. Add Stripe `shipping_options` when you know your rates.
- **No transactional email.** Stripe sends a payment receipt; you don't send a
  "your order shipped" note yet. Resend or Postmark drops in easily.
- **Stock is checked, not reserved.** Two people can hold the same one-off item
  in their carts; the second one to pay wins and the first gets a "sold while
  you were looking at it" message. Reserving at cart-add time is the fix, and
  it's overkill until you're actually losing sales to it.
- **Admin auth is a shared password.** See above.
- **No tax handling.** Stripe Tax is a config change when you need it.
- **Single-node only** while it's on SQLite.

---

## Troubleshooting

**`npm install` fails with EPERM on Windows.** This folder is inside OneDrive.
Pause syncing during install, or move the project to a non-synced path like
`C:\dev\kittenskrafts`.

**Port 3000 is busy.**

```bash
npm run dev -- --port 3001
```

**Stock looks wrong.** Delete `data/shop.db` to reset every sale back to zero.
The catalog is untouched — it's just a file.
