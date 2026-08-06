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
  yarn: { label: "Handspun Yarn", short: "Yarn" },
  knits: { label: "Finished Knits", short: "Knits" },
  bags: { label: "Sewn Bags", short: "Bags" },
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

export const products: Product[] = [
  {
    slug: "moss-agate-worsted",
    name: "Moss Agate",
    category: "yarn",
    priceCents: 4800,
    stock: 1,
    blurb: "Worsted-weight three-ply in mossy greens and flecks of rust.",
    description:
      "Spun over a slow week from a hand-dyed Corriedale braid. The three-ply structure keeps it round and springy, so it holds stitch definition well — cables and ribbing look crisp in it. Colours drift from deep forest through olive into occasional flashes of rust, with no long stretches of any single shade.",
    details: {
      Fibre: "100% Corriedale wool",
      Weight: "Worsted / 10 ply",
      Yardage: "218 yd (199 m)",
      Skein: "3.9 oz (110 g)",
      Ply: "3-ply, woollen spun",
      Care: "Hand wash cool, dry flat",
    },
    image: null,
    featured: true,
  },
  {
    slug: "hearth-single",
    name: "Hearth",
    category: "yarn",
    priceCents: 4200,
    stock: 1,
    blurb: "Chunky single-ply, warm reds banking into charcoal.",
    description:
      "A soft, lofty single spun with a light hand so it stays airy rather than dense. Knits up fast on 8mm needles and blooms beautifully after a soak. Best for hats, cowls and anything you want to finish in a weekend.",
    details: {
      Fibre: "70% Merino, 30% Tussah silk",
      Weight: "Chunky / 12 ply",
      Yardage: "112 yd (102 m)",
      Skein: "3.5 oz (100 g)",
      Ply: "Single",
      Care: "Hand wash cool, dry flat",
    },
    image: null,
    featured: true,
  },
  {
    slug: "sea-glass-fingering",
    name: "Sea Glass",
    category: "yarn",
    priceCents: 5600,
    stock: 1,
    blurb: "Fingering-weight two-ply, pale aqua with a silver halo.",
    description:
      "The finest yarn I spin, and the slowest. A two-ply of Merino and baby alpaca with a whisper of sparkle blended through, so it catches light without looking like tinsel. Enough yardage for a generous shawl or a pair of long socks.",
    details: {
      Fibre: "60% Merino, 30% baby alpaca, 10% Stellina",
      Weight: "Fingering / 4 ply",
      Yardage: "412 yd (377 m)",
      Skein: "3.5 oz (100 g)",
      Ply: "2-ply, worsted spun",
      Care: "Hand wash cool, dry flat",
    },
    image: null,
  },
  {
    slug: "ochre-batt-dk",
    name: "Ochre Field",
    category: "yarn",
    priceCents: 4400,
    stock: 2,
    blurb: "DK-weight two-ply from a carded batt — golds, ochre, dusty pink.",
    description:
      "Spun from a batt I carded myself, so the colours are properly blended rather than striped. Two skeins exist from the same batt and they match closely enough to use together for a larger project.",
    details: {
      Fibre: "80% Polwarth, 20% mohair",
      Weight: "DK / 8 ply",
      Yardage: "246 yd (225 m)",
      Skein: "3.5 oz (100 g)",
      Ply: "2-ply",
      Care: "Hand wash cool, dry flat",
    },
    image: null,
  },
  {
    slug: "fishermans-rib-beanie",
    name: "Fisherman's Rib Beanie",
    category: "knits",
    priceCents: 5400,
    stock: 2,
    blurb: "Deep-ribbed beanie knit from my own handspun, with a folded brim.",
    description:
      "Knit from a skein of the Hearth single, which means the colour shifts run around the hat rather than pooling in patches. Fisherman's rib makes a thick, squashy fabric that blocks wind properly. The brim is doubled so it sits over the ears without needing to be tugged down.",
    details: {
      Fibre: "Handspun Merino / Tussah silk",
      Size: 'Fits 21–23" head',
      Gauge: "Knit on 5mm needles",
      Note: "Knit from my own handspun, so the next one won't match",
      Care: "Hand wash cool, dry flat",
    },
    image: null,
    featured: true,
  },
  {
    slug: "garter-yoke-shawl",
    name: "Garter Yoke Shawl",
    category: "knits",
    priceCents: 16500,
    stock: 1,
    blurb: "Crescent shawl in fingering-weight handspun, blocked to a soft point.",
    description:
      "Around forty hours of knitting from a single skein of the Sea Glass fingering. A garter-stitch yoke opens into a lace edge, and it is blocked hard so the points hold. Big enough to wrap twice or wear open over a coat.",
    details: {
      Fibre: "Handspun Merino / baby alpaca / Stellina",
      Dimensions: '68" wingspan × 22" deep, blocked',
      Weight: "3.5 oz (100 g)",
      Note: "One of a kind — this used the whole skein",
      Care: "Hand wash cool, block to shape",
    },
    image: null,
  },
  {
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
  {
    slug: "project-bag-linen",
    name: "Linen Project Bag",
    category: "bags",
    priceCents: 4600,
    stock: 3,
    blurb: "Drawstring bag sized for a sock or shawl project in progress.",
    description:
      "Made for knitting on the move. Heavy linen outer, quilting-cotton lining, and a grommet in the side seam so you can feed yarn out without opening the bag. Flat-bottomed so it sits open in your lap.",
    details: {
      Materials: "Washed linen, cotton lining, brass grommet",
      Dimensions: '9" W × 11" H × 4" D',
      Closure: "Cotton drawstring",
      Fits: "One sock or shawl project",
      Care: "Machine wash cold, hang dry",
    },
    image: null,
  },
  {
    slug: "crossbody-quilted",
    name: "Quilted Crossbody",
    category: "bags",
    priceCents: 12500,
    stock: 1,
    blurb: "Hand-quilted crossbody in indigo patchwork with an adjustable strap.",
    description:
      "Every panel is hand-quilted, which is why there is exactly one of these. Indigo-dyed cotton patchwork over cotton batting, bound in matching bias tape. The strap adjusts from shoulder to crossbody length and the flap closes with a hidden magnetic snap.",
    details: {
      Materials: "Indigo-dyed cotton, cotton batting, brass hardware",
      Dimensions: '10" W × 7" H × 3" D',
      Strap: 'Adjustable 24"–48"',
      Pockets: "Two interior slip pockets",
      Closure: "Magnetic snap under flap",
      Care: "Spot clean only",
    },
    image: null,
    featured: true,
  },
  {
    slug: "notions-pouch",
    name: "Notions Pouch",
    category: "bags",
    priceCents: 2800,
    stock: 5,
    blurb: "Small zip pouch for stitch markers, scissors and a tape measure.",
    description:
      "The thing I make when I have scraps left over, so no two are quite the same colourway. Boxed corners, metal zip, and a wrist loop so you can pull it out of a bigger bag one-handed.",
    details: {
      Materials: "Cotton canvas, cotton lining, metal zip",
      Dimensions: '7" W × 4" H × 2" D',
      Closure: "Metal zip with leather pull",
      Note: "Fabric varies — yours will not match the photo exactly",
      Care: "Machine wash cold, hang dry",
    },
    image: null,
  },
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
