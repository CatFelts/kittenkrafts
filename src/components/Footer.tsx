import Link from "next/link";

import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-cream">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-base text-ink">{site.name}</p>
          <p className="mt-1">{site.shippingNote}</p>
        </div>
        <div className="flex gap-5">
          <Link href="/shop" className="hover:text-clay">
            Shop
          </Link>
          <Link href="/about" className="hover:text-clay">
            About
          </Link>
          <a href={`mailto:${site.email}`} className="hover:text-clay">
            {site.email}
          </a>
        </div>
      </div>
    </footer>
  );
}
