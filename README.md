# KittensKnits

A small storefront for selling handmade goods — knitten items, handspun yarn, and maybe 
even the occassional sewn bag. Built to be maintained by one person [ME!].

---

## Quick start

```bash
npm install
```

```bash
npm run dev
```

Open <http://localhost:3000>. That's it — **no configuration required** to browse.
With no `DATABASE_URL` set the shop runs in *enquiry mode*: the whole catalogue
and cart work, and the buy button opens a pre-filled order email.

To click the **full buy flow** with stock actually moving, point it at a database
first — see [Local development against Neon](#local-development-against-neon).

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
| Orders + stock | **Neon Postgres** | Serverless Postgres on a free tier. The live host has no writable disk, so orders must live off-box. Talks over HTTP, so there is no connection pool to manage on a serverless host. |
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
    db.ts          ← Neon Postgres: orders + how many of each item sold.
                      THE ONLY FILE THAT KNOWS ABOUT STORAGE.
    schema.ts      ← The table definitions, applied by `npm run db:init`.
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
  components/                    Header, Footer, ProductCard, Window (the
                                 retro chrome), Icons, image placeholder
scripts/init-db.ts               Creates the tables. `npm run db:init`.
```

---

## Day-to-day: adding a piece

Open `src/lib/products.ts` and append to the `products` array:

```ts
{
  slug: "storm-cloud-dk",        // URL + primary key. Never change after a sale.
  name: "Storm Cloud",
  category: "yarn",              // a key from CATEGORIES — see below
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

**Categories:** these live in one place — the `CATEGORIES` object at the top of
`products.ts`. There are three right now:

```ts
export const CATEGORIES = {
  yarn:  { label: "Kitten Spins", short: "Spins" },
  knits: { label: "Kitten Knits", short: "Knits" },
  bags:  { label: "Kitten Sews",  short: "Sews"  },
} as const;
```

`label` is the full name used for page headings and filter chips; `short` is the
compact one used in the header nav. To add a fourth (say, "prints"), add a line
there and you're done — the shop filters, the header nav, and the label on each
product page all read from this object. The `Category` type is derived from it,
so `category: "prints"` on a product is a compile error until the key exists.

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

Stripe needs **both** keys and a database: it writes a `pending` order before
handing the customer over, and the webhook finds that row again to mark it paid.
Keys with no `DATABASE_URL` deliberately falls back to enquiry mode rather than
taking money it cannot record.

Going live is step 6 of [Deploying](#deploying).

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

## The three checkout modes

The shop detects what its environment can actually do and picks one. You do not
configure this; see `src/lib/checkout-mode.ts`.

| Mode | When | What the cart button does |
| --- | --- | --- |
| `stripe` | Stripe keys **and** `DATABASE_URL` set | Hosted Stripe checkout; the webhook settles the order |
| `demo` | `DATABASE_URL`, no Stripe | Records a fake paid order and decrements stock |
| `enquiry` | No `DATABASE_URL` | Opens a pre-filled order email to you |

`enquiry` is the safety net: with nowhere to record an order, the shop refuses to
take money rather than charging a card it cannot reconcile. The whole
browse-and-add-to-cart experience still works — the cart is a cookie and never
touches the database.

Force a mode to test it: `CHECKOUT_MODE=enquiry npm run dev`. Do this before
deploying, or the first time you see production's code path is in production.

---

## Deploying

The live site is **Netlify** (hosting) + **Neon** (Postgres) + **Cloudflare
Registrar** (the domain `kittensknits.com`). That combination costs **$0/month**
— only the domain has a price, about $11/year — and Stripe charges nothing
monthly, only 2.9% + 30¢ when a sale actually happens. Nothing here bills you
for a quiet month.

> **Why not Vercel?** Its free Hobby plan forbids commercial use — its fair-use
> policy names "requesting or processing payment from visitors" as the exact
> thing that requires a paid plan. A shop on Hobby is a terms violation, and Pro
> is $20/month. Netlify's free tier permits commercial use.

### 1. The database

1. Sign up at <https://console.neon.tech> (free tier, no card).
2. Create a project. Any region near your customers.
3. **Connection Details** → copy the **pooled** connection string.
4. Put it in `.env.local` as `DATABASE_URL=...`, then create the tables:

```bash
npm run db:init
```

Safe to re-run any time — every statement is `IF NOT EXISTS` and nothing is ever
dropped, so it cannot destroy order history.

### 2. The domain

Buy `kittensknits.com` at <https://domains.cloudflare.com>. Cloudflare sells at
wholesale with no markup and includes WHOIS privacy free, which most registrars
charge $8–15/year for. Registering moves DNS to Cloudflare; you point it at
Netlify in step 5.

### 3. Deploy

Push to GitHub, then at <https://app.netlify.com> → **Add new site** → **Import
an existing project** → pick the repo. `netlify.toml` already sets the build
command and the Next.js plugin, so accept the defaults.

### 4. Environment variables

Netlify → **Site configuration** → **Environment variables**:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | the Neon pooled connection string |
| `NEXT_PUBLIC_SITE_URL` | `https://kittensknits.com` |
| `STRIPE_SECRET_KEY` | `sk_live_...` (or `sk_test_...` while rehearsing) |
| `STRIPE_WEBHOOK_SECRET` | from step 6 — add it after creating the endpoint |
| `ADMIN_PASSWORD` | something long and private |

`NEXT_PUBLIC_SITE_URL` is the one people get wrong. It builds the URL Stripe
sends customers back to, so if it still says `localhost` your paying customers
get bounced to a dead page.

### 5. Point the domain at Netlify

Netlify → **Domain management** → **Add a domain** → `kittensknits.com`. It will
show you the records to create. In the Cloudflare dashboard → **DNS**:

| Type | Name | Value | Proxy |
| --- | --- | --- | --- |
| `CNAME` | `www` | `<your-site>.netlify.app` | **DNS only** |
| `A` or `ALIAS` | `@` | whatever Netlify shows | **DNS only** |

Set the proxy toggle to **DNS only** (grey cloud, not orange). Leaving
Cloudflare's proxy on in front of Netlify causes redirect loops and breaks
certificate issuing. Netlify then provisions HTTPS automatically, usually within
a few minutes.

### 6. Stripe, for real money

1. <https://dashboard.stripe.com> → activate your account (Stripe needs your
   real identity and bank details before it will release funds).
2. Toggle out of **Test mode** and copy the live secret key into
   `STRIPE_SECRET_KEY` on Netlify.
3. **Developers → Webhooks → Add endpoint**:
   - URL: `https://kittensknits.com/api/stripe/webhook`
   - Events: `checkout.session.completed` and
     `checkout.session.async_payment_succeeded`
4. Copy that endpoint's **signing secret** into `STRIPE_WEBHOOK_SECRET` on
   Netlify and redeploy.

The webhook secret in production is a **different value** from the one the
Stripe CLI prints locally. Reusing the local one means every real webhook fails
signature checks and no order is ever marked paid.

### 7. Rehearse before you announce

Deploy with **test** keys first and buy something from your own live site with
card `4242 4242 4242 4242`. Then check:

- `/admin/orders` shows the order as `paid`
- the item's stock went down
- Stripe's dashboard shows the webhook delivering `200`

Then swap in the live keys. Test and live data are separate in Stripe, so the
rehearsal leaves no fake orders in your real books — though it does leave test
rows in Neon, which you can delete with
`DELETE FROM orders WHERE mode = 'demo';`.

---

## Local development against Neon

Use a **separate Neon branch** for development so test orders never touch real
sales. In the Neon console: **Branches → New Branch**, name it `dev`, and put
*that* branch's connection string in `.env.local`. Branches are copy-on-write,
so a dev branch costs essentially nothing on the free tier.

```bash
npm run db:init   # against the dev branch
npm run dev
```

With `DATABASE_URL` set and no Stripe keys you get `demo` mode: the full buy
flow, orders recorded, stock decremented, no money.

Before every deploy, check the mode the live site will actually use:

```bash
CHECKOUT_MODE=enquiry npm run dev
```

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
- **Neon's free tier sleeps after 5 minutes idle.** The first visitor after a
  quiet spell waits roughly half a second longer while it wakes. That trade is
  why a quiet month costs nothing.
- **Free-tier ceilings are real but distant:** Netlify gives 100 GB bandwidth
  and 125k function calls a month, Neon 0.5 GB of storage. A busy month for a
  shop this size uses a rounding error of that. Watch them only if you get
  written up somewhere.

---

## Troubleshooting

**`npm install` fails with EPERM on Windows.** This folder is inside OneDrive.
Pause syncing during install, or move the project to a non-synced path like
`C:\dev\kittensknits`.

**Port 3000 is busy.**

```bash
npm run dev -- --port 3001
```

**Stock looks wrong.** Sales live in Neon, the catalog in `products.ts`. To
reset every sale back to zero without touching the catalog, run
`TRUNCATE inventory;` in the Neon SQL editor — against your **dev** branch
unless you really mean it.

**An order is stuck on `pending`.** The webhook never landed. Check Stripe →
**Developers → Webhooks** for failed deliveries. A `400` there almost always
means `STRIPE_WEBHOOK_SECRET` doesn't match the endpoint — the local CLI secret
and the production endpoint secret are different values.

**Customers land on `localhost` after paying.** `NEXT_PUBLIC_SITE_URL` is wrong
on Netlify. It must be `https://kittensknits.com`. Redeploy after changing it —
it is baked in at build time.

**The site redirects forever, or HTTPS won't issue.** Cloudflare's proxy is on
in front of Netlify. Set those DNS records to **DNS only** (grey cloud).
