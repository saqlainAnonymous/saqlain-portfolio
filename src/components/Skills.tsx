"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Reveal from "./Reveal";
import { SKILLS } from "@/lib/content";

export default function Skills() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // rules draw in as the section enters — a visual index, not a score
      gsap.fromTo(
        ".skill-rule",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.1,
          ease: "power3.out",
          stagger: 0.045,
          scrollTrigger: { trigger: el, start: "top 75%", once: true },
        }
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section id="stack" ref={root} className="relative mx-auto max-w-[1400px] px-6 py-32 md:px-10 md:py-44">
      <div className="grid gap-16 md:grid-cols-[280px_1fr]">
        <div className="md:sticky md:top-32 md:self-start">
          <div className="section-label">03 — Stack</div>
        </div>

        <div>
          <Reveal>
            <h2 className="font-display text-4xl text-bone md:text-6xl">
              Tools I reach for<span className="text-gold">.</span>
            </h2>
          </Reveal>

          <div className="mt-14 space-y-7">
            {SKILLS.map((s) => (
              <div key={s.name} className="group">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-body text-lg text-bone transition-colors group-hover:text-gold">
                    {s.name}
                  </span>
                  <span className="font-body text-[11px] uppercase tracking-[0.25em] text-mist">
                    {s.category}
                  </span>
                </div>
                <div className="mt-3 h-px w-full overflow-hidden bg-line">
                  <div className="skill-rule h-full w-full origin-left bg-gold/25 transition-colors will-change-transform group-hover:bg-gold/60" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
