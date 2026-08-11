import Link from "next/link";

import { CursorIcon } from "@/components/Icons";
import { Window } from "@/components/Window";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20">
      <Window title="error.exe">
        <div className="bg-paper px-5 py-8 text-center">
          <p className="font-display text-5xl text-clay">404</p>
          <h1 className="mt-2 text-2xl">Page not found</h1>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            That page isn&apos;t here. It may have been a listing that sold —
            most pieces are one of a kind, so once they go, their page goes too.
          </p>
          <Link
            href="/shop"
            className="mt-7 inline-flex items-center gap-2 border-2 border-ink bg-clay px-5 py-2.5 text-sm text-white shadow-[3px_3px_0_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 hover:bg-clay-dark"
          >
            <CursorIcon className="h-4 w-3" />
            Go to the shop
          </Link>
        </div>
      </Window>
    </div>
  );
}
