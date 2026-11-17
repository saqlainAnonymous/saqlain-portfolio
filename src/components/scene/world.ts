/**
 * Shared state for the hero's world layer.
 * Written by ScrollTrigger (DOM), read inside useFrame (render loop), so the
 * scroll choreography never triggers a React re-render.
 */
export type WorldFx = {
  /** 0 at the top of the page → 1 once the hero has handed off to About. */
  scroll: number;
  /** prefers-reduced-motion: hold the composition still. */
  reduced: boolean;
};

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export const smoothstep = (t: number) => t * t * (3 - 2 * t);
