"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { PROJECTS, type Project } from "@/lib/content";

function TiltCard({ project }: { project: Project }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(el, {
      rotateY: px * 10,
      rotateX: -py * 8,
      transformPerspective: 900,
      duration: 0.5,
      ease: "power2.out",
    });
  };
  const onLeave = () => {
    gsap.to(ref.current, { rotateX: 0, rotateY: 0, duration: 0.8, ease: "elastic.out(1,0.5)" });
  };

  const [a, b] = project.art;

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="group relative flex h-[62vh] w-[82vw] shrink-0 flex-col justify-between overflow-hidden rounded-3xl border border-line bg-panel p-7 will-change-transform md:h-[64vh] md:w-[44rem] md:p-9"
    >
      {/* placeholder art */}
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background: `radial-gradient(circle at 75% 15%, ${b}55, transparent 55%), radial-gradient(circle at 20% 85%, ${a} 0%, #0c0c10 70%)`,
        }}
      />
      <div className="absolute inset-0 noise-overlay" />

      <div className="relative flex items-start justify-between">
        <span className="font-display text-6xl italic leading-none text-bone/15 md:text-7xl">
          {project.index}
        </span>
        <span className="font-body text-xs uppercase tracking-[0.3em] text-mist">
          {project.status}
        </span>
      </div>

      <div className="relative">
        <h3 className="font-display text-4xl text-bone md:text-5xl">{project.title}</h3>
        <p className="mt-3 max-w-md font-body text-base text-mist">{project.blurb}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {project.stack.map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </div>

        <div className="mt-7 flex items-center justify-between">
          <span className="font-body text-xs uppercase tracking-[0.3em] text-mist">
            {project.role}
          </span>
          <Link
            href={`/projects/${project.slug}`}
            className="link-line font-body text-sm uppercase tracking-[0.2em] text-gold"
          >
            View Case →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  const railRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // the progress bar now reflects the rail's own horizontal scroll.
  // no scroll listeners on the page — vertical scrolling is untouched.
  const onRailScroll = () => {
    const rail = railRef.current;
    const bar = progressRef.current;
    if (!rail || !bar) return;
    const max = rail.scrollWidth - rail.clientWidth;
    bar.style.transform = `scaleX(${max > 0 ? rail.scrollLeft / max : 0})`;
  };

  return (
    <section id="work" className="relative overflow-hidden py-24">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 md:pt-28">
        <div className="flex items-end justify-between">
          <div>
            <div className="section-label">02 — Selected Work</div>
            <h2 className="mt-4 font-display text-5xl text-bone md:text-7xl">Projects</h2>
          </div>
          <span className="hidden font-body text-xs uppercase tracking-[0.3em] text-mist md:block">
            Scroll to explore →
          </span>
        </div>

        {/* horizontal rail progress */}
        <div className="mt-8 hidden h-px w-full bg-line md:block">
          <div
            ref={progressRef}
            className="h-full w-full origin-left scale-x-0 bg-gold"
          />
        </div>
      </div>

      {/* horizontal rail (desktop) / stacked (mobile) */}
      {isMobile ? (
        <div className="mt-12 flex flex-col gap-8 px-6">
          {PROJECTS.map((p) => (
            <TiltCard key={p.slug} project={p} />
          ))}
        </div>
      ) : (
        <div className="mt-12">
          {/* native horizontal scroller — vertical page scroll passes straight through.
              data-lenis-prevent lets the browser handle gestures inside the rail
              (horizontal trackpad/touch) instead of the smooth-scroll engine. */}
          <div
            ref={railRef}
            onScroll={onRailScroll}
            data-lenis-prevent
            className="-my-8 overflow-x-auto overflow-y-hidden overscroll-x-contain py-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="flex w-max items-stretch gap-10 px-10">
              {PROJECTS.map((p) => (
                <TiltCard key={p.slug} project={p} />
              ))}
              {/* end spacer card */}
              <div className="flex h-[64vh] w-[30rem] shrink-0 items-center justify-center rounded-3xl border border-dashed border-line">
                <p className="font-display text-3xl italic text-mist">
                  More in the works<span className="text-gold">…</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
