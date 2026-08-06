/**
 * Stand-in artwork for products with no photo yet.
 *
 * Derives a stable colour from the slug so each product looks distinct and
 * looks the same on every page. Once you set `image` on a product in
 * src/lib/products.ts, ProductImage uses the real photo instead.
 */
function hashHue(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) % 360;
  }
  return h;
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
  const hue = hashHue(seed);
  const a = `hsl(${hue} 32% 72%)`;
  const b = `hsl(${(hue + 38) % 360} 28% 52%)`;

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ background: `linear-gradient(140deg, ${a}, ${b})` }}
      role="img"
      aria-label={`Placeholder image for ${label}`}
    >
      <span className="px-4 text-center font-display text-lg text-white/90 drop-shadow-sm">
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
