import type { Metadata } from "next";
import { Bubblegum_Sans } from "next/font/google";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { site } from "@/lib/site";

import "./globals.css";

/**
 * next/font downloads Bubblegum Sans at BUILD time and serves it from our own
 * domain. Nothing is fetched from Google when someone visits, and because the
 * font's size is known up front the page doesn't jump around as it loads.
 *
 * `variable` exposes it as a CSS custom property, which globals.css picks up
 * as --font-display. To change the heading font, swap the import name here and
 * nothing else needs to move.
 */
const bubblegum = Bubblegum_Sans({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bubblegum",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.tagline,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={bubblegum.variable}>
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
