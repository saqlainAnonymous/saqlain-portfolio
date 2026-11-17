"use client";

import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import ParticleField from "./ParticleField";
import ShaderBlob from "./ShaderBlob";
import { clamp01, smoothstep, type WorldFx } from "./world";

/**
 * Camera: mouse parallax while the hero holds, then a slow dolly-back and
 * rise so the viewer leaves the sculpture instead of reaching its edge.
 */
function Rig({ fx }: { fx: WorldFx }) {
  const { camera, pointer } = useThree();
  const look = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    const p = smoothstep(clamp01(fx.scroll));
    const calm = fx.reduced ? 0 : 1;
    // reduced motion keeps the scroll-linked journey but shortens the dolly
    const pull = fx.reduced ? 0.7 : 1;

    const px = calm * pointer.x * 0.55 * (1 - p * 0.8);
    const py = calm * -pointer.y * 0.35 * (1 - p * 0.8);
    const drift = calm * Math.sin(p * 2.2) * 0.35; // slight orbital travel

    camera.position.x += (px + drift - camera.position.x) * 0.045;
    camera.position.y += (py + p * 1.25 * pull - camera.position.y) * 0.045;
    camera.position.z += (6.4 + p * 4.7 * pull - camera.position.z) * 0.045;

    // look down a touch as we rise, so the sculpture sinks into the dust below
    look.current.set(0, -p * 0.4 * pull, 0);
    camera.lookAt(look.current);
  });

  return null;
}

/**
 * The sculpture recedes into the particle field as the page scrolls: it drifts
 * up and back, shrinks to a final ember, then the world dissolves into the page.
 */
function Sculpture({ fx }: { fx: WorldFx }) {
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    const el = group.current;
    if (!el) return;
    const p = smoothstep(clamp01(fx.scroll));
    el.position.set(0, p * 1.15, -p * 4.4);
    el.scale.setScalar(1 - p * 0.7);
    el.rotation.z = p * 0.4;
  });

  return (
    <group ref={group}>
      <ShaderBlob />
    </group>
  );
}

export default function Scene({ fx, active }: { fx: WorldFx; active: boolean }) {
  const low = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <Canvas
      dpr={low ? [1, 1.35] : [1, 1.75]}
      // stop rendering once the world has fully dissolved (zero GPU cost down-page)
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0, 6.4], fov: 42 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      className="!absolute inset-0"
    >
      <color attach="background" args={["#0a0a0c"]} />
      <fog attach="fog" args={["#0a0a0c", 8, 14]} />

      <Rig fx={fx} />
      <Sculpture fx={fx} />
      <ParticleField fx={fx} low={low} />

      <EffectComposer multisampling={0}>
        <Bloom
          intensity={0.75}
          luminanceThreshold={0.22}
          luminanceSmoothing={0.85}
          mipmapBlur
        />
        <Vignette darkness={0.72} offset={0.22} />
      </EffectComposer>
    </Canvas>
  );
}
