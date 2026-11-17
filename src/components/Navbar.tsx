"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/lib/content";
import Magnetic from "./Magnetic";

const LINKS = [
  { label: "About", href: "#about" },
  { label: "Work", href: "#work" },
  { label: "Stack", href: "#stack" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[120] transition-all duration-500 ${
        scrolled
          ? "border-b border-line/60 bg-ink/70 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 md:px-10">
        <a href="#top" className="font-display text-xl tracking-tight text-bone">
          {SITE.brand}
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="link-line font-body text-sm uppercase tracking-widest text-mist transition-colors hover:text-bone"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <Magnetic>
          <a
            href="#contact"
            className="rounded-full border border-gold/60 px-5 py-2 font-body text-xs uppercase tracking-[0.2em] text-gold transition-colors hover:bg-gold hover:text-ink"
          >
            Let&apos;s Talk
          </a>
        </Magnetic>
      </nav>
    </header>
  );
}
