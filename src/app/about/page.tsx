import type { Metadata } from "next";

import { SparkleIcon } from "@/components/Icons";
import { Window } from "@/components/Window";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="flex items-center gap-2 text-3xl text-clay">
        <SparkleIcon className="twinkle h-5 w-5 text-lime" />
        About the studio
      </h1>


      <Window title="about_me.txt" className="mt-7">
        <div className="win-inset space-y-4 bg-white px-4 py-5 text-xs leading-relaxed text-muted">
          <p>
            {site.name} is a one gal show. My obsession with fiber arts started from my mom and my sister,
            and hasn't stopped growing since it began. My handmades are truly a labor of love, which
            is why quantities are small and most listings say &quot;one of a
            kind.&quot; 
            thanks for stopping by and checking out my little shop! &#9734;&#9734;&#9734;
          </p>
          <p>
            Handspun yarn is not perfectly machine uniform, and that is the point —
            Thick and thin in spots, unpredicted color shifts, every skein tells its own story.
            I try my best to create yarn I would love to use myself! But if you need an exact match
            for a large project, email me before you order and I&apos;ll tell
            you honestly whether I can spin enough.
          </p>
          <p>
            I believe handknits deserve to be worn, so all my knitted garments include free darning and repairs for life. &hearts;
          </p>
          <p>
            Commissions are open in limited numbers. If something in the shop
            has sold and you&apos;d like something similar, shoot me an email and i'll see what i can do. &hearts;
          </p>
        </div>
      </Window>

      <div className="mt-8 border-2 border-ink bg-white shadow-[3px_3px_0_0_var(--color-ink)]">
        <div className="border-b-2 border-ink bg-turq px-3 py-1.5">
          <h2 className="text-base text-ink">Get in touch</h2>
        </div>
        <div className="px-3 py-3 text-xs text-muted">
          <p>
            Email{" "}
            <a
              href={`mailto:${site.email}`}
              className="text-clay underline-offset-2 hover:underline"
            >
              {site.email}
            </a>
            {" · "}
            {site.instagram} on Instagram
          </p>
          <p className="mt-2">{site.shippingNote}</p>
        </div>
      </div>
    </div>
  );
}
