/**
 * Stand-in artwork for products with no photo yet.
 *
 * Every product ships with `image: null` until you photograph it, so these
 * tiles are most of what the shop looks like right now — they are not a
 * throwaway. Rather than random hues (which fight a loud palette), each tile
 * picks one of a few hand-checked brand gradients, chosen by hashing the slug.
 *
 * Hashing the slug rather than the array index matters: the tile stays the same
 * colour when you reorder or delete products, so a piece someone bookmarked
 * doesn't change appearance for no reason.
 *
 * Once you set `image` on a product in src/lib/products.ts, ProductImage uses
 * the real photo and none of this runs.
 */

/**
 * Gradient pairs drawn from the theme. Add or reorder freely — the only rule
 * is that white text at ~90% opacity must stay readable on top, so keep both
 * stops reasonably saturated and avoid anything pale.
 */
const GRADIENTS: [string, string][] = [
  ["#ff3ea5", "#d1006f"], // shock -> clay
  ["#40e0d0", "#00747a"], // turq -> moss
  ["#b8f13f", "#3f9e2e"], // lime -> deeper green
  ["#ff8ad0", "#9b2fa8"], // pink -> purple
  ["#ffd34d", "#e07a1f"], // gold -> orange
  ["#7fd4ff", "#1f6fd0"], // sky -> blue
];

function hashIndex(seed: string, buckets: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    // eslint-disable-next-line no-bitwise
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return h % buckets;
}

export function Placeholder({
  seed,
  label,
  className = "",
}: {
  seed: string;
  label: string;
  className?: string;
}) {
  const [from, to] = GRADIENTS[hashIndex(seed, GRADIENTS.length)];

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ background: `linear-gradient(140deg, ${from}, ${to})` }}
      role="img"
      aria-label={`Placeholder image for ${label}`}
    >
      <span className="px-4 text-center font-display text-lg text-white drop-shadow-[2px_2px_0_rgba(0,0,0,0.35)]">
        {label}
      </span>
    </div>
  );
}

export function ProductImage({
  src,
  alt,
  seed,
  className = "",
}: {
  src: string | null;
  alt: string;
  seed: string;
  className?: string;
}) {
  if (!src) {
    return <Placeholder seed={seed} label={alt} className={className} />;
  }
  // Plain <img>: no remote-image config to maintain, and these are local files.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={`object-cover ${className}`} />;
}
