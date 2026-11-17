"use client";

import Reveal from "./Reveal";
import { SITE, STATS } from "@/lib/content";

export default function About() {
  return (
    <section id="about" className="relative mx-auto max-w-[1400px] px-6 py-32 md:px-10 md:py-44">
      <div className="grid gap-16 md:grid-cols-[280px_1fr]">
        {/* sticky label column */}
        <div className="md:sticky md:top-32 md:self-start">
          <div className="section-label">01 — About</div>
        </div>

        <div>
          <Reveal>
            <p className="font-display text-3xl leading-[1.25] text-bone md:text-5xl">
              I&apos;m <span className="text-gold">{SITE.name}</span> — an aspiring developer and
              technology enthusiast from Pakistan, passionate about{" "}
              <span className="italic">artificial intelligence</span>, software development, and
              building <span className="italic">useful digital products</span>.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-10 max-w-xl space-y-5 font-body text-lg leading-relaxed text-mist">
              <p>
                I explore emerging technologies, experiment with AI-powered tools, build practical
                software projects, and contribute to open-source development.
              </p>
              <p>
                Beyond coding, I&apos;m interested in documentary storytelling, digital media,
                research, and understanding how technology shapes our world. My goal is to turn
                ideas into meaningful products, continuously improve my technical abilities, and
                build technology that solves real problems.
              </p>
            </div>
          </Reveal>

          {/* portrait placeholder — swap for your photo */}
          <Reveal delay={0.2}>
            <div className="mt-16 grid gap-10 md:grid-cols-[320px_1fr] md:items-center">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-line bg-coal">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#2a2418,transparent_60%),radial-gradient(circle_at_70%_80%,#1a1a22,transparent_55%)]" />
                <div className="absolute inset-0 flex items-end p-6">
                  <span className="font-display text-5xl italic tracking-tight text-gold/80">
                    {SITE.brand}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-10">
                {STATS.map((s) => (
                  <div key={s.label}>
                    <div className="font-display text-5xl text-bone md:text-6xl">{s.value}</div>
                    <div className="mt-2 font-body text-xs uppercase tracking-[0.25em] text-mist">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
