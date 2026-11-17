import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Footer from "@/components/Footer";
import { SITE } from "@/lib/content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Saqlain Shah — Developer & Creative Technologist",
    template: "%s — Saqlain Shah",
  },
  description:
    "Portfolio of Saqlain Shah, an aspiring developer and technology enthusiast from Pakistan building at the intersection of artificial intelligence, software and storytelling.",
  openGraph: {
    title: "Saqlain Shah — Developer & Creative Technologist",
    description:
      "AI, software development and digital storytelling — building useful things from Abbottabad, Pakistan.",
    url: "/",
    siteName: "Saqlain Shah",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0c",
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE.name,
  alternateName: SITE.brand,
  jobTitle: SITE.role,
  description: SITE.tagline,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Abbottabad",
    addressRegion: "Khyber Pakhtunkhwa",
    addressCountry: "PK",
  },
  sameAs: SITE.socials.map((s) => s.url),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <Providers>
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
