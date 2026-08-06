import Link from "next/link";

import { cartCount } from "@/lib/cart";
import { CATEGORIES, CATEGORY_KEYS } from "@/lib/products";
import { site } from "@/lib/site";

/** Category links are generated, so a new category appears here automatically. */
const NAV = [
  { href: "/shop", label: "Shop" },
  ...CATEGORY_KEYS.map((key) => ({
    href: `/shop?category=${key}`,
    label: CATEGORIES[key].short,
  })),
  { href: "/about", label: "About" },
];

export async function Header() {
  const count = await cartCount();

  return (
    <header className="border-b border-line bg-paper/90 backdrop-blur sticky top-0 z-20">
      <div className="mx-auto flex max-w-5xl items-center gap-6 px-5 py-4">
        <Link href="/" className="font-display text-xl text-ink">
          {site.name}
        </Link>

        <nav className="hidden gap-5 text-sm text-muted sm:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="transition-colors hover:text-clay"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/cart"
          className="ml-auto rounded-full border border-line px-4 py-1.5 text-sm transition-colors hover:border-clay hover:text-clay"
        >
          Cart{count > 0 ? ` (${count})` : ""}
        </Link>
      </div>

      <nav className="flex gap-4 overflow-x-auto border-t border-line px-5 py-2 text-sm text-muted sm:hidden">
        {NAV.map((item) => (
          <Link key={item.label} href={item.href} className="whitespace-nowrap">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
