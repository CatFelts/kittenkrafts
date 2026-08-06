import type { Metadata } from "next";

import { site } from "@/lib/site";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <h1 className="text-3xl">About the studio</h1>

      <div className="mt-8 space-y-5 leading-relaxed text-muted">
        <p>
          {site.name} is a one-person operation. I dye and card fibre, spin it on
          a treadle wheel, and sew bags on a machine that is older than I am.
          Everything listed here was made start to finish by hand, which is why
          quantities are small and most listings say "one of a kind."
        </p>
        <p>
          Handspun yarn is not machine-uniform, and that is the point — thickness
          varies a little along the length, and colours shift where one section
          of dyed fibre meets the next. If you need an exact match for a large
          project, email me before you order and I'll tell you honestly whether I
          can spin enough.
        </p>
        <p>
          Bags are made from materials chosen to age well rather than stay
          pristine. Waxed canvas will crease and darken where it folds. Leather
          handles will darken with handling. Both are meant to.
        </p>
        <p>
          Commissions are open in limited numbers. If something in the shop has
          sold and you'd like something similar, write to me and describe what
          you were after.
        </p>
      </div>

      <div className="mt-10 rounded-lg border border-line bg-cream p-6">
        <h2 className="text-lg">Get in touch</h2>
        <p className="mt-2 text-sm text-muted">
          Email{" "}
          <a href={`mailto:${site.email}`} className="text-clay hover:underline">
            {site.email}
          </a>
          {" · "}
          {site.instagram} on Instagram
        </p>
        <p className="mt-3 text-sm text-muted">{site.shippingNote}</p>
      </div>
    </div>
  );
}
