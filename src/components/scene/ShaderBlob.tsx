"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { GLSL_NOISE } from "@/lib/shaders";

/** Organic blob: vertex-displaced icosahedron with fresnel rim light. */

const VERT = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vView;
  ${GLSL_NOISE}

  void main() {
    float t = uTime * 0.35;
    float d = (fbm(position * 1.6 + vec3(t, 0.0, t * 0.7)) - 0.5) * 0.55
            + (fbm(position * 4.0 - vec3(t * 0.4)) - 0.5) * 0.12;

    vec3 p = position + normal * d;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  uniform vec3 uCore;
  uniform vec3 uRim;
  uniform vec3 uEmber;
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    float fres = pow(1.0 - clamp(dot(vNormal, vView), 0.0, 1.0), 2.4);
    float lambert = clamp(dot(vNormal, normalize(vec3(0.5, 0.8, 0.6))), 0.0, 1.0);

    vec3 col = uCore * (0.25 + lambert * 0.75);
    col = mix(col, uRim, fres * 0.85);
    col += uEmber * pow(fres, 3.0) * 0.9; // hot edge for bloom to catch

    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function ShaderBlob() {
  const group = useRef<THREE.Group>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uCore: { value: new THREE.Color("#191410") },
      uRim: { value: new THREE.Color("#d9a951") },
      uEmber: { value: new THREE.Color("#ff7a3c") },
    }),
    []
  );

  useFrame((state, delta) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y += delta * 0.12;
      group.current.rotation.z += delta * 0.04;
      // breathing scale
      const s = 1 + Math.sin(state.clock.elapsedTime * 0.6) * 0.02;
      group.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[1.25, 64]} />
        <shaderMaterial
          vertexShader={VERT}
          fragmentShader={FRAG}
          uniforms={uniforms}
        />
      </mesh>
    </group>
  );
}
