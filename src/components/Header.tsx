import Link from "next/link";

import { FolderIcon, SparkleIcon } from "@/components/Icons";
import { cartCount } from "@/lib/cart";
import { CATEGORIES, CATEGORY_KEYS } from "@/lib/products";
import { site } from "@/lib/site";

/** Category links are generated, so a new category appears here automatically. */
const NAV = [
  { href: "/shop", label: "Shop", folder: false },
  ...CATEGORY_KEYS.map((key) => ({
    href: `/shop?category=${key}`,
    label: CATEGORIES[key].short,
    folder: true,
  })),
  { href: "/about", label: "About", folder: false },
];

export async function Header() {
  const count = await cartCount();

  return (
    <header className="sticky top-0 z-20 border-b-4 border-clay bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-1.5">
          <SparkleIcon className="twinkle h-4 w-4 text-turq" />
          <span className="font-display text-2xl text-clay">{site.name}</span>
          <SparkleIcon className="twinkle h-4 w-4 text-lime" />
        </Link>

        <nav className="ml-auto hidden items-center gap-4 text-xs sm:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-1 text-muted underline-offset-2 transition-colors hover:text-clay hover:underline"
            >
              {item.folder && <FolderIcon className="h-4 w-5" />}
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/cart"
          className="win ml-auto shrink-0 px-3 py-1.5 text-xs text-ink transition-transform hover:-translate-y-0.5 sm:ml-0"
        >
          🛒 Cart{count > 0 ? ` (${count})` : ""}
        </Link>
      </div>

      {/* Mobile nav: its own scrolling row, since the bar above is full. */}
      <nav className="flex gap-4 overflow-x-auto border-t-2 border-line px-4 py-2 text-xs text-muted sm:hidden">
        {NAV.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex shrink-0 items-center gap-1 whitespace-nowrap"
          >
            {item.folder && <FolderIcon className="h-4 w-5" />}
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
