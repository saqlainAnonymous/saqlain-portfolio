"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { GLSL_NOISE } from "@/lib/shaders";
import type { WorldFx } from "./world";

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;
  attribute float aRand;
  varying float vNoise;
  varying float vRand;
  ${GLSL_NOISE}

  void main() {
    vec3 dir = normalize(position);

    // slow swirl around Y + organic breathing displacement
    float t = uTime * 0.22;
    float n = fbm(position * 0.9 + vec3(t, t * 0.6, 0.0));
    vec3 p = position + dir * (n - 0.5) * 1.35;

    float angle = uTime * 0.05 + aRand * 0.6;
    float c = cos(angle), s = sin(angle);
    p = vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);

    p.y += uScroll * 1.2;

    vNoise = n;
    vRand = aRand;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (6.0 + aRand * 26.0) * (1.0 / -mv.z) * (1.0 + n * 0.6);
  }
`;

const FRAG = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vNoise;
  varying float vRand;

  void main() {
    // soft round sprite
    float d = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.05, d);
    vec3 col = mix(uColorA, uColorB, clamp(vNoise * 1.4 - 0.2, 0.0, 1.0));
    gl_FragColor = vec4(col, alpha * (0.35 + vRand * 0.65));
  }
`;

export default function ParticleField({ fx, low = false }: { fx: WorldFx; low?: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const { pointer } = useThree();
  const count = low ? 6500 : 14000;

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const rands = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // random point in a spherical shell
      const r = 2.1 + Math.random() * 1.7;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      rands[i] = Math.random();
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aRand", new THREE.BufferAttribute(rands, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uColorA: { value: new THREE.Color("#8a6a2f") },
        uColorB: { value: new THREE.Color("#e0b34c") },
      },
    });
    return { geometry: geo, material: mat };
  }, [count]);

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    // hold the field still for reduced motion; clamp so the dust never
    // drifts away entirely once the page has scrolled far past the hero
    const target = fx.reduced
      ? 0
      : Math.min(1.4, window.scrollY / Math.max(1, window.innerHeight));
    material.uniforms.uScroll.value +=
      (target - material.uniforms.uScroll.value) * 0.06;

    if (pointsRef.current) {
      // subtle mouse parallax
      const amp = fx.reduced ? 0 : 1;
      pointsRef.current.rotation.x +=
        (pointer.y * 0.12 * amp - pointsRef.current.rotation.x) * 0.03;
      pointsRef.current.rotation.y +=
        (pointer.x * 0.18 * amp - pointsRef.current.rotation.y) * 0.03;
    }
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}
