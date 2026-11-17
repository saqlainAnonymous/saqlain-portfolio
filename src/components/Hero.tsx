"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SITE } from "@/lib/content";
import { clamp01, smoothstep, type WorldFx } from "@/components/scene/world";

// WebGL loads client-side only — it mounts immediately so shaders
// compile underneath the preloader, then fades in as the curtain lifts.
const Scene = dynamic(() => import("@/components/scene/Scene"), {
  ssr: false,
  loading: () => null,
});

export default function Hero() {
  const [go, setGo] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const [active, setActive] = useState(true);
  const root = useRef<HTMLElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);

  // written by ScrollTrigger, read by the render loop — no re-renders per frame
  const fx = useRef<WorldFx>({ scroll: 0, reduced: false }).current;

  useEffect(() => {
    const start = () => setGo(true);
    window.addEventListener("preloader:done", start, { once: true });
    // safety fallback if the event somehow never fires
    const t = window.setTimeout(start, 3000);
    return () => {
      window.removeEventListener("preloader:done", start);
      window.clearTimeout(t);
    };
  }, []);

  // graceful fallback — without WebGL the page keeps the charcoal atmosphere
  useEffect(() => {
    let ok = true;
    try {
      const probe = document.createElement("canvas");
      const gl = probe.getContext("webgl2") || probe.getContext("webgl");
      ok = !!gl;
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      ok = false;
    }
    if (!ok) setWebgl(false);
  }, []);

  /**
   * Scroll choreography.
   *
   * The world is a fixed, viewport-sized layer, so the hero never ends at a
   * hard horizontal edge: scrolling moves the *camera* through the scene while
   * the next section slides in over it. Everything is tied to the real scroll
   * position (Lenis + ScrollTrigger), with no pinning and no wheel hijacking.
   */
  useEffect(() => {
    const world = worldRef.current;
    if (!world) return;
    gsap.registerPlugin(ScrollTrigger);

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    fx.reduced = reduced;

    let live = true;
    const apply = (progress: number) => {
      // hold the full world through the hero, then dissolve it as About settles
      const fade = smoothstep(clamp01((progress - 0.34) / 0.6));
      world.style.opacity = String(1 - fade);

      // the hero interface leaves first, so its labels never float over the
      // world or the incoming section — the camera carries the transition
      const ui = 1 - smoothstep(clamp01((progress - 0.2) / 0.38));
      if (contentRef.current) contentRef.current.style.opacity = String(ui);
      if (cueRef.current) cueRef.current.style.opacity = String(ui);

      // once it is invisible, stop paying for WebGL frames
      const on = progress < 0.96;
      if (on !== live) {
        live = on;
        setActive(on);
      }
    };

    const st = ScrollTrigger.create({
      trigger: root.current,
      start: "top top",
      end: () => `+=${Math.round(window.innerHeight * 1.05)}`,
      onUpdate: (self) => {
        // scroll-linked, so it follows the user exactly in every mode;
        // the scene itself drops its ambient motion when reduced
        fx.scroll = self.progress;
        apply(self.progress);
      },
      onRefresh: (self) => apply(self.progress),
    });

    apply(st.progress);

    return () => {
      st.kill();
    };
  }, [fx]);

  useEffect(() => {
    if (!go || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-line",
        { yPercent: 120, filter: "blur(12px)" },
        {
          yPercent: 0,
          filter: "blur(0px)",
          duration: 1.5,
          stagger: 0.14,
          delay: 0.12,
          ease: "expo.out",
        }
      );
      gsap.fromTo(
        ".hero-meta",
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.12, delay: 0.55, ease: "power3.out" }
      );
    }, root);
    return () => ctx.revert();
  }, [go]);

  return (
    <section ref={root} id="top" className="relative h-[100svh] overflow-hidden">
      {/* persistent world: fixed to the viewport, so the scene continues under
          the next section instead of being clipped at the hero's bottom edge */}
      <div ref={worldRef} aria-hidden className="fixed inset-0 z-0 will-change-[opacity]">
        {/* scene wrapper — fades + settles as the preloader exits */}
        <div
          className={`absolute inset-0 transition-[opacity,transform] duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            go ? "opacity-100 scale-100" : "opacity-0 scale-[1.06]"
          }`}
        >
          {webgl && <Scene fx={fx} active={active} />}
        </div>

        {/* atmosphere — travels with the world now, not with the section box */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(10,10,12,0.75)_100%)]" />
      </div>

      <div
        ref={contentRef}
        className="pointer-events-none absolute inset-0 flex flex-col justify-between px-6 py-24 will-change-[opacity] md:px-10"
      >
        <div className="hero-meta flex items-center justify-between gap-6 font-body text-[11px] uppercase tracking-[0.3em] text-mist">
          <span>{SITE.role}</span>
          <span className="shrink-0">
            ©{new Date().getFullYear()}
            <span className="hidden sm:inline"> — Portfolio Vol.1</span>
          </span>
        </div>

        <h1 className="select-none text-center font-display leading-[0.9] tracking-tight text-bone">
          <span className="block overflow-hidden pb-[0.08em]">
            <span className="hero-line block will-change-transform text-[16vw] md:text-[11rem]">
              {SITE.name.split(" ")[0]}
            </span>
          </span>
          <span className="block overflow-hidden pb-[0.12em]">
            <span className="hero-line block will-change-transform text-[16vw] italic text-gold md:text-[11rem]">
              {SITE.name.split(" ").slice(1).join(" ") || "©"}
              <span className="not-italic">.</span>
            </span>
          </span>
        </h1>

        <div className="flex items-end justify-between">
          <div className="hero-meta flex items-center gap-3 font-body text-xs uppercase tracking-[0.25em] text-mist">
            <span className="inline-block h-2 w-2 animate-pulseDot rounded-full bg-gold" />
            {SITE.availability}
          </div>
          <div className="hero-meta hidden font-body text-xs uppercase tracking-[0.25em] text-mist md:block">
            {SITE.location}
          </div>
        </div>
      </div>

      {/* scroll cue — inner element animates so GSAP never touches the centering transform */}
      <div
        ref={cueRef}
        className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 will-change-[opacity]"
      >
        <div className="hero-meta">
          <div className="scroll-cue" aria-hidden />
        </div>
      </div>
    </section>
  );
}
