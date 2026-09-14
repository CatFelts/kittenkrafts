/**
 * THE CATALOG.
 *
 * This file is the single source of truth for what you sell. To add a piece,
 * append an object to `products` below and save — the shop picks it up on the
 * next request (in dev) or the next build (in prod).
 *
 * Prices are in CENTS to avoid floating-point money bugs. 4800 = $48.00.
 *
 * `stock` is how many you made. The database tracks how many have SOLD; the
 * shop shows `stock - sold` as available. So you never edit stock after a sale —
 * you only edit it if you actually spin/sew more.
 */

/**
 * THE CATEGORIES. Add one here and the whole site follows: the shop filters,
 * the header nav, and the label on each product page all read from this object.
 * Nothing else needs editing.
 *
 *   `label` — the full name, used as page headings and filter chips
 *   `short` — the compact name, used in the header nav where space is tight
 */
export const CATEGORIES = {
  yarn: { label: "Kitten Spins", short: "Spins" },
  knits: { label: "Kitten Knits", short: "Knits" },
  bags: { label: "Kitten Sews", short: "Sews" },
} as const;

/**
 * Derived from CATEGORIES rather than written out by hand, so the two can never
 * drift apart. Setting `category: "hats"` on a product is now a compile error
 * until "hats" exists above.
 */
export type Category = keyof typeof CATEGORIES;

/** Ordered list, for building nav and filter UI. */
export const CATEGORY_KEYS = Object.keys(CATEGORIES) as Category[];

export type Product = {
  /** URL slug and primary key. Must be unique and never change once sold. */
  slug: string;
  name: string;
  category: Category;
  priceCents: number;
  /** How many of this exact item exist. One-of-a-kind pieces are 1. */
  stock: number;
  /** One-line teaser shown on cards. */
  blurb: string;
  /** Full description shown on the product page. Plain text, one paragraph. */
  description: string;
  /** Spec rows shown as a table on the product page. */
  details: Record<string, string>;
  /**
   * Path to a photo in /public, e.g. "/images/moss-single.jpg".
   * Leave null and a generated placeholder tile is shown instead.
   */
  image: string | null;
  /** Show on the homepage. */
  featured?: boolean;
};

/**
 * ============================================================================
 * YOUR PRODUCTS GO HERE.
 * ============================================================================
 *
 * Below is ONE worked example per category. They are real, valid entries — the
 * site runs on them right now — but they are placeholders. Replace them with
 * your own pieces, then delete whichever examples you don't need.
 *
 * TO ADD A PIECE: copy an entry, paste it, edit the values. Save. In `npm run
 * dev` it appears on the next refresh.
 *
 * THE ONLY FIELD THAT IS DANGEROUS TO CHANGE is `slug`. It's the URL and the
 * primary key that sales are recorded against, so once a piece has sold, that
 * slug is frozen. Everything else is safe to edit whenever you like.
 *
 * If you get a red squiggle, read it — the type on line 39 spells out exactly
 * which fields are required, and `npm run typecheck` will list any you missed.
 */
export const products: Product[] = [
  {
    // ---- handspun yarn ------------------------------------------------
    // Lowercase, hyphens, no spaces. This becomes /shop/cyberpunk-dk
    // and is the key sales are recorded against. Freeze it after a sale.
    slug: "cyberpunk-dk",

    // What the customer sees. Change this freely, even after a sale.
    name: "Cyberpunk DK",

    // Must be a key from CATEGORIES at the top of this file. Typos here are a
    // compile error, not a broken page.
    category: "yarn",

    // CENTS, always. 4800 = $48.00. Integers mean no floating-point money bugs.
    priceCents: 4800,

    // How many you physically made. For a one-of-a-kind piece this is 1.
    // You only change this if you make MORE. Sales are tracked separately and
    // the shop displays (stock - sold), so never decrement this by hand after
    // a sale... unless you're deployed with no database, which is the current
    // setup — see README, "The three checkout modes".
    stock: 1,

    // One line, shown on the grid tile. Gets clamped to two lines, so keep it
    // short enough to read at a glance.
    blurb: "Two-ply fractal spun DK weight",

    // The full pitch, shown on the product page. Plain text, one paragraph.
    // Say what it's made of and what it's good for.
    description:
      "A classic 1:2 fractal spun yarn from a super soft and bouncy blended braid of 60% Polwarth, 20% Cashmere, and 20% Tussah silk. The color changes create a somewhat self striping yarn, with lengths of barber poling as well as some color pooling. Colors shift from bright purples, vivid blues, and pops of vibrant green.",

    // Free-form spec table. The labels are yours — add, rename or drop rows to
    // suit the piece. Yarn wants yardage; a bag wants dimensions.
    details: {
      Fibre: "60% Polwarth, 20% Cashmere, 20% Tussah Silk",
      Weight: "DK",
      Yardage: "161 yd (148 m)",
      Skein: "1.9 oz (55 g)",
      Ply: "2-ply, worsted spun",
      Care: "Hand wash cool, dry flat",
    },

    // A real photo from public/images/. Leave this null and you get a generated
    // colour tile derived from the slug instead, so a piece you haven't shot yet
    // still looks finished on the grid.
    image: "/images/cyberpunk-yarn.jpg",

    // Optional. Puts it on the homepage. Aim for 3 or 6 featured pieces — the
    // homepage grid is 3 across on a wide screen.
    featured: true,
  },

  {
    // ---- a finished knit -------------------------------------
    // Same shape, different `details` rows: a garment wants size and gauge
    // where yarn wanted yardage.
    slug: "bramble-berry-socks",
    name: "Bramble Berry Socks",
    category: "knits",
    priceCents: 3800,
    stock: 1,
    blurb: "Knit on my flatbed knitting machine",
    description:
      "Knit flat on my Brother kh-950i knitting machine, then grafted and seamed by hand. Knit in a classic superwash merino/nylon sock blend, these socks can be machine washed and won't shrink.",
    details: {
      Fibre: "75% Fine Superwash Merino Wool, 25% Nylon",
      Size: 'Fits 5W, or Big Kid\'s size 3.5Y',
      Gauge: "Standard 4.5mm gauge",
      Note: "I offer free sock darning on all my socks for life!",
      Care: "Hand or machine wash cool, dry flat or tumble dry low",
    },
    image: "/images/bramble-berry-socks.jpg",
    featured: true,
  },
  
    {
    // ---- a finished knit -------------------------------------
    // Same shape, different `details` rows: a garment wants size and gauge
    // where yarn wanted yardage.
    slug: "popsicle-socks",
    name: "Popsicle Socks",
    category: "knits",
    priceCents: 3800,
    stock: 1,
    blurb: "Knit on my flatbed knitting machine",
    description:
      "Knit flat on my Brother kh-950i knitting machine, then grafted and seamed by hand. Knit with a colorful self striping yarn, alternating between solid rows of color, and rows of speckles. Heels and toes are reinforced with a superwash merino/nylon blend.",
    details: {
      Fibre: "Sock body - Merino Wool, Heels+Toes - 75% Superwash Merino, 25% Nylon",
      Size: 'Fits 5W, or Big Kid\'s size 3.5Y',
      Gauge: "Standard 4.5mm gauge",
      Note: "I offer free sock darning on all my socks for life!",
      Care: "Hand wash cool, dry flat",
    },
    image: "/images/popsicle-socks.jpg",
    featured: true,
  },

  /*
  {
    // ---- EXAMPLE: a sewn bag ------------------------------------------
    // Note stock: 1 with no `featured`. Not every piece needs to be on the
    // homepage — the shop page lists everything regardless.
    slug: "market-tote-waxed",
    name: "Waxed Canvas Market Tote",
    category: "bags",
    priceCents: 9800,
    stock: 1,
    blurb: "Roomy waxed-canvas tote with leather handles and a lined interior.",
    description:
      "Cut from 18oz waxed canvas that softens and marks with use rather than wearing out. Handles are veg-tan leather, riveted and stitched. The interior is fully lined in cotton twill with one deep slip pocket, and the base is doubled so it stands up when loaded.",
    details: {
      Materials: "18oz waxed canvas, veg-tan leather, cotton lining",
      Dimensions: '16" W × 14" H × 5" D',
      "Strap drop": '10"',
      Pockets: "One interior slip pocket",
      Closure: "Open top",
      Care: "Spot clean; re-wax annually",
    },
    image: null,
    featured: true,
  },
  */
];


// --- lookups -----------------------------------------------------------------

const bySlug = new Map(products.map((p) => [p.slug, p]));

export function getProduct(slug: string): Product | undefined {
  return bySlug.get(slug);
}

export function listProducts(category?: Category): Product[] {
  return category ? products.filter((p) => p.category === category) : products;
}

export function featuredProducts(): Product[] {
  return products.filter((p) => p.featured);
}
