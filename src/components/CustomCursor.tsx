"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Dot + trailing ring custom cursor.
 * Ring scales up over any interactive element.
 * Over text it becomes an optical lens: a magnified copy of the block under
 * the pointer, sharp in the middle and softly defocused toward the rim.
 * Renders nothing on touch devices.
 */

const TEXT_BLOCK =
  "p, h1, h2, h3, h4, h5, h6, blockquote, li, figcaption, dt, dd, td, th";

/** Subtle optical magnification — enough to read, never a fisheye. */
const ZOOM = 1.3;

/** Lens diameter: a tight loupe for body copy, a wider one for display type. */
const LENS_BODY = 112;
const LENS_DISPLAY = 144;
const DISPLAY_FROM = 28; // px font-size

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const dot = dotRef.current!;
    const ring = ringRef.current!;
    const lens = lensRef.current!;
    const core = coreRef.current!;

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: -100, y: -100 });

    const dotX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power2" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power2" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power3" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power3" });

    let px = -1e4;
    let py = -1e4;
    let source: HTMLElement | null = null;
    let raf = 0;

    /* ---------- lens geometry ---------- */

    const size = () => lens.offsetWidth || LENS_BODY;

    const place = () => {
      lens.style.transform = `translate3d(${px}px, ${py}px, 0) translate(-50%, -50%)`;
    };

    /**
     * Align the copy so the point under the pointer lands dead centre of the
     * glass. Origin stays at 0 0, so this is a single transform write.
     */
    const paint = () => {
      if (!source) return;
      const r = source.getBoundingClientRect();
      const s = size();
      const tx = s / 2 - ZOOM * (px - r.left);
      const ty = s / 2 - ZOOM * (py - r.top);
      const el = core.firstElementChild as HTMLElement | null;
      if (el) el.style.transform = `translate(${tx}px, ${ty}px) scale(${ZOOM})`;
    };

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!source) return;
      if (!source.isConnected) {
        release();
        return;
      }
      place();
      paint();
    };

    /* ---------- clone construction ---------- */

    const buildClone = (src: HTMLElement) => {
      const rect = src.getBoundingClientRect();
      const cs = getComputedStyle(src);
      const clone = src.cloneNode(true) as HTMLElement;

      // a copy must never duplicate ids or carry live animation transforms
      clone.removeAttribute("id");
      clone.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
      clone.querySelectorAll<HTMLElement>("*").forEach((n) => {
        n.style.transform = "";
        n.style.filter = "";
      });
      clone.setAttribute("aria-hidden", "true");
      clone.classList.add("cursor-lens__text");

      // freeze the typography that the source inherited from its ancestors
      const s = clone.style;
      s.position = "absolute";
      s.top = "0";
      s.left = "0";
      s.margin = "0";
      s.border = "0";
      s.display = "block";
      s.boxSizing = "border-box";
      s.maxWidth = "none";
      s.listStyle = "none";
      s.pointerEvents = "none";
      s.width = `${rect.width}px`;
      s.fontFamily = cs.fontFamily;
      s.fontSize = cs.fontSize;
      s.fontWeight = cs.fontWeight;
      s.fontStyle = cs.fontStyle;
      s.fontVariantNumeric = cs.fontVariantNumeric;
      s.letterSpacing = cs.letterSpacing;
      s.lineHeight = cs.lineHeight;
      s.textAlign = cs.textAlign;
      s.textTransform = cs.textTransform;
      s.textIndent = cs.textIndent;
      s.wordSpacing = cs.wordSpacing;
      s.whiteSpace = cs.whiteSpace;
      s.color = cs.color;
      s.textShadow = cs.textShadow;
      s.paddingTop = cs.paddingTop;
      s.paddingRight = cs.paddingRight;
      s.paddingBottom = cs.paddingBottom;
      s.paddingLeft = cs.paddingLeft;

      return clone;
    };

    /* ---------- state ---------- */

    const release = () => {
      if (!source) return;
      source = null;
      core.replaceChildren();
      lens.classList.remove("is-on");
      ring.classList.remove("is-lens");
      dot.classList.remove("is-dim");
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const magnifiable = (el: HTMLElement) => {
      if (!el.textContent || !el.textContent.trim()) return false;
      if (el.querySelector("img, video, canvas, svg, iframe, picture")) return false;
      const r = el.getBoundingClientRect();
      if (r.width < 40 || r.height < 18) return false;
      if (r.width * r.height > 1600000) return false;
      return true;
    };

    const engage = (next: HTMLElement) => {
      if (next === source) return;
      core.replaceChildren();
      source = next;

      // scale the glass to the type it magnifies, so a display heading gets a
      // wider loupe and body copy stays compact
      const fs = parseFloat(getComputedStyle(next).fontSize) || 16;
      lens.style.setProperty(
        "--lens-size",
        `${fs >= DISPLAY_FROM ? LENS_DISPLAY : LENS_BODY}px`
      );

      core.append(buildClone(next));

      lens.classList.add("is-on");
      ring.classList.add("is-lens");
      dot.classList.add("is-dim");

      place();
      paint();
      if (!raf) raf = requestAnimationFrame(frame);
    };

    /* ---------- pointer ---------- */

    const move = (e: MouseEvent) => {
      px = e.clientX;
      py = e.clientY;
      dotX(px);
      dotY(py);
      ringX(px);
      ringY(py);
    };

    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t || !t.closest) return;

      const interactive = t.closest(
        "a, button, input, textarea, select, [data-cursor]"
      );
      ring.classList.toggle("is-active", !!interactive);
      if (interactive) {
        release();
        return;
      }

      const block = t.closest(TEXT_BLOCK) as HTMLElement | null;
      if (!block || !magnifiable(block)) {
        release();
        return;
      }
      engage(block);
    };

    const leave = () => {
      release();
      ring.classList.remove("is-active");
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", over, { passive: true });
    document.addEventListener("mouseleave", leave);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      document.removeEventListener("mouseleave", leave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden />
      <div ref={dotRef} className="cursor-dot" aria-hidden />
      <div ref={lensRef} className="cursor-lens" aria-hidden>
        <div className="cursor-lens__glass">
          <div ref={coreRef} className="cursor-lens__layer cursor-lens__layer--core" />
          <div className="cursor-lens__sheen" />
        </div>
      </div>
    </>
  );
}
