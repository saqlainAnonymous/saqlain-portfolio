"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { SITE } from "@/lib/content";
import type { LoaderFx } from "@/components/PreloaderScene";

const PreloaderScene = dynamic(() => import("@/components/PreloaderScene"), {
  ssr: false,
});

type Mode = "pending" | "3d" | "css" | "static";

/** Decide how cinematic we can be on this device. */
function detectMode(): Exclude<Mode, "pending"> {
  if (typeof window === "undefined") return "css";
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return "static";

  try {
    const probe = document.createElement("canvas");
    const gl = (probe.getContext("webgl2") ||
      probe.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return "css";
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    if (/swiftshader|software|basic render/i.test(renderer)) return "css";
  } catch {
    return "css";
  }

  if ((navigator.hardwareConcurrency || 8) <= 2) return "css";
  return "3d";
}

/**
 * Cinematic preloader.
 *   0→100%   chrome sculpture turning under studio reflections, counter ticking
 *   hold     final transformation — a decisive spin, reflections sharpen
 *   exit     the ring rushes the camera; its opening swallows the viewport
 *            while the charcoal overlay dissolves into the live site
 * Falls back to a CSS chrome ring (no WebGL) and a pure fade (reduced motion).
 */
export default function Preloader() {
  const [gone, setGone] = useState(false);
  const [mode, setMode] = useState<Mode>("pending");
  const panelRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  // written by GSAP, read by the render loop — never triggers React renders
  const fx = useRef<LoaderFx>({ progress: 0, finale: 0, exit: 0 }).current;

  useEffect(() => {
    const html = document.documentElement;
    html.style.overflow = "hidden";

    const detected = detectMode();
    setMode(detected);

    fx.progress = 0;
    fx.finale = 0;
    fx.exit = 0;

    let finished = false;
    let signaled = false;
    let disposed = false;
    let released = false;
    let started = false;
    let sceneCap = 0;
    let begin: (() => void) | null = null;
    let tl: gsap.core.Timeline | null = null;
    let failsafe = 0;

    const signal = () => {
      if (signaled) return;
      signaled = true;
      window.dispatchEvent(new Event("preloader:done"));
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      signal();
      html.style.overflow = "";
      window.clearTimeout(failsafe);
      setGone(true);
    };

    // don't lift the curtain before webfonts are ready (bounded wait)
    const release = () => {
      if (released || disposed) return;
      released = true;
      tl?.resume();
    };
    const gate = () => {
      tl?.pause();
      Promise.race([
        document.fonts.ready,
        new Promise<void>((r) => window.setTimeout(r, 700)),
      ]).then(release);
    };

    const reduced = detected === "static";
    const obj = { v: 0 };

    tl = gsap.timeline({ onComplete: finish });

    tl.to(obj, {
      v: 100,
      duration: reduced ? 0.6 : 1.5,
      ease: "power2.inOut",
      onUpdate() {
        if (numRef.current) {
          numRef.current.textContent = String(Math.round(obj.v)).padStart(3, "0");
        }
        if (barRef.current) {
          barRef.current.style.transform = `scaleX(${obj.v / 100})`;
        }
        fx.progress = obj.v / 100;
      },
    });

    if (reduced) {
      // accessibility: no 3D, no zoom — an unhurried fade only
      tl.to({}, { duration: 0.25 }).to(panelRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power1.out",
      });
    } else {
      tl.to({}, { duration: 0.4 }) // hold the completed state
        .add(gate)
        // final transformation — the sculpture takes its hero pose
        .to(fx, { finale: 1, duration: 0.6, ease: "power3.out" })
        .add(signal, "-=0.05");

      if (detected === "3d") {
        // camera: the ring accelerates at the lens (fx.exit drives 3D)
        tl.to(fx, { exit: 1, duration: 1, ease: "power2.in" }, "+=0.05");
      } else {
        // CSS fallback: the chrome ring expands past the frame
        tl.to(
          ringRef.current,
          { scale: 3.2, opacity: 0, duration: 1, ease: "power2.in" },
          "+=0.05"
        );
      }

      tl.to(
        innerRef.current,
        { scale: 1.12, opacity: 0, filter: "blur(6px)", duration: 0.5, ease: "power2.in" },
        "<"
      )
        .to(vignetteRef.current, { opacity: 0, duration: 0.8, ease: "power1.inOut" }, "<")
        // dissolve the charcoal environment → the live site underneath
        .to(
          panelRef.current,
          { backgroundColor: "rgba(10,10,12,0)", duration: 0.85, ease: "power2.inOut" },
          "<+=0.12"
        );
    }

    // In 3D mode the count waits for the sculpture's first painted frame so the
    // ring is already on screen when the numbers start. Capped hard: a slow GPU
    // (or a failed scene chunk) must never delay the site.
    if (detected === "3d") {
      const start = () => {
        if (started || disposed) return;
        started = true;
        window.clearTimeout(sceneCap);
        window.removeEventListener("preloader:scene-ready", start);
        tl?.resume();
      };
      begin = start;
      window.addEventListener("preloader:scene-ready", start);
      sceneCap = window.setTimeout(start, 1500);
      tl.pause(0);
    }

    // wall-clock failsafe — never leave the site hidden if frames are starved
    failsafe = window.setTimeout(finish, 8000);

    return () => {
      disposed = true;
      window.clearTimeout(failsafe);
      window.clearTimeout(sceneCap);
      if (begin) window.removeEventListener("preloader:scene-ready", begin);
      tl?.kill();
      html.style.overflow = "";
    };
  }, [fx]);

  // fallback ring keeps a slow polish rotation while loading (CSS mode only)
  useEffect(() => {
    if (mode !== "css" || !ringRef.current) return;
    const spin = gsap.to(ringRef.current, {
      rotate: 360,
      duration: 26,
      repeat: -1,
      ease: "none",
    });
    return () => {
      spin.kill();
    };
  }, [mode]);

  if (gone) return null;

  const low = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div
      ref={panelRef}
      className="fixed inset-0 z-[200] overflow-hidden bg-ink will-change-[opacity]"
    >
      {/* deep charcoal environment */}
      <div
        ref={vignetteRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,#17171c_0%,#0b0b0e_58%,#070709_100%)]"
      />

      {mode === "3d" && (
        <div className="pointer-events-none absolute inset-0">
          <PreloaderScene fx={fx} low={low} />
        </div>
      )}

      {(mode === "css" || mode === "static") && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            ref={ringRef}
            aria-hidden
            className="will-change-transform"
            style={{
              width: "min(56vh, 74vw)",
              aspectRatio: "1 / 1",
              borderRadius: "9999px",
              background:
                "conic-gradient(from 210deg,#3c3c44,#cfc7ba 18%,#ffffff 34%,#6a6972 48%,#f1ece2 62%,#4a4a53 76%,#ded7c9 88%,#3c3c44)",
              WebkitMaskImage:
                "radial-gradient(closest-side, transparent 63%, #000 64%)",
              maskImage: "radial-gradient(closest-side, transparent 63%, #000 64%)",
            }}
          />
        </div>
      )}

      {/* soft scrim: guarantees the type stays crisp over the metal */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(8,8,11,0.55)_0%,rgba(8,8,11,0.18)_38%,transparent_62%)]"
      />

      <div
        ref={innerRef}
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
      >
        <div className="section-label mb-6">
          {SITE.role} · {new Date().getFullYear()}
        </div>

        <div className="select-none font-display text-[18vw] leading-none tracking-tight text-bone tabular-nums md:text-[9rem]">
          <span ref={numRef}>000</span>
          <span className="text-gold">%</span>
        </div>

        <div className="mt-8 h-px w-56 overflow-hidden bg-line md:w-72">
          <span ref={barRef} className="block h-full w-full origin-left scale-x-0 bg-gold" />
        </div>

        <div className="mt-6 text-xs uppercase tracking-[0.3em] text-mist">
          {SITE.brand} — Immersive Portfolio
        </div>
      </div>
    </div>
  );
}
