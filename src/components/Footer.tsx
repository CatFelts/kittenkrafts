import Link from "next/link";

import { DiskIcon, SparkleIcon } from "@/components/Icons";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-16 border-t-4 border-clay bg-cream">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-display text-xl text-clay">{site.name}</p>
            <p className="mt-1 text-xs text-muted">{site.shippingNote}</p>
            <p className="mt-3 text-xs text-muted">
              {site.instagram} on Instagram
            </p>
          </div>

          <nav className="flex flex-col gap-1.5 text-xs">
            <Link href="/shop" className="text-muted hover:text-clay hover:underline">
              ⋆ Shop everything
            </Link>
            <Link href="/about" className="text-muted hover:text-clay hover:underline">
              ⋆ About the studio
            </Link>
            <Link href="/cart" className="text-muted hover:text-clay hover:underline">
              ⋆ Your cart
            </Link>
            <a
              href={`mailto:${site.email}`}
              className="text-muted hover:text-clay hover:underline"
            >
              ⋆ {site.email}
            </a>
          </nav>

          {/*
            Period furniture. The counter is a static ornament, not analytics —
            there is no tracking on this site at all. If you ever want real
            numbers, Vercel Analytics is a one-line add and doesn't use cookies.
          */}
          <div className="text-xs text-muted">
            <div className="win inline-block px-2 py-1">
              <span className="font-display">visitor no.</span>{" "}
              <span className="bg-ink px-1 font-mono text-lime">000001</span>
            </div>
            <p className="mt-2 flex items-center gap-1">
              <DiskIcon className="h-3.5 w-3.5" />
              best viewed at 1024×768
            </p>
          </div>
        </div>

        <p className="mt-8 flex items-center justify-center gap-1.5 border-t-2 border-line pt-5 text-center text-xs text-muted">
          <SparkleIcon className="twinkle h-3 w-3 text-shock" />
          made by hand, one at a time
          <SparkleIcon className="twinkle h-3 w-3 text-turq" />
        </p>
      </div>
    </footer>
  );
}
