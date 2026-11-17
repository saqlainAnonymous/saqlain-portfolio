"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/** Shared, mutable animation state — written by GSAP, read in the render loop. */
export type LoaderFx = {
  progress: number;
  finale: number;
  exit: number;
};

type SceneProps = { fx: LoaderFx; low?: boolean };

/**
 * Procedural studio environment: a dark room with softboxes and a warm ring
 * light, baked into a PMREM. Gives the chrome real reflections with zero
 * external HDR assets.
 */
function StudioEnvironment() {
  const { gl, scene } = useThree();

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const envScene = new THREE.Scene();
    const plane = new THREE.PlaneGeometry(1, 1);
    const materials: THREE.MeshBasicMaterial[] = [];

    const softbox = (
      hex: number,
      strength: number,
      position: [number, number, number],
      scale: number,
      rotation: [number, number, number]
    ) => {
      const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
      material.color.setHex(hex).multiplyScalar(strength);
      materials.push(material);
      const mesh = new THREE.Mesh(plane, material);
      mesh.position.set(...position);
      mesh.scale.setScalar(scale);
      mesh.rotation.set(...rotation);
      envScene.add(mesh);
    };

    // ceiling key, warm side key, cool rim, front fill, dark floor
    softbox(0xfff3e0, 3.2, [0, 5, 0], 5.5, [Math.PI / 2, 0, 0]);
    softbox(0xffd9a8, 2.4, [-5, 1, 2], 4.2, [0, Math.PI / 2.2, 0]);
    softbox(0xc9d6ea, 1.7, [5, -1, 1], 4.2, [0, -Math.PI / 2.2, 0]);
    softbox(0xffffff, 1.1, [0, 0, -6], 5, [0, 0, 0]);
    softbox(0x0a0a0c, 0.5, [0, -5, 0], 6, [-Math.PI / 2, 0, 0]);

    const target = pmrem.fromScene(envScene, 0.04);
    scene.environment = target.texture;

    return () => {
      scene.environment = null;
      target.dispose();
      pmrem.dispose();
      plane.dispose();
      materials.forEach((m) => m.dispose());
    };
  }, [gl, scene]);

  return null;
}

/** Polished chrome sculpture: a thick machined ring, lit like a product shot. */
function Sculpture({ fx, low }: { fx: LoaderFx; low: boolean }) {
  const ring = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const { viewport } = useThree();

  // fit the outer silhouette to the viewport (88% width, capped on desktop)
  const fit = Math.min(1.1, (viewport.width * 0.88) / 2.64);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const { progress, finale, exit } = fx;
    const mesh = ring.current;
    if (!mesh) return;

    // continuous slow turn, accelerating with load progress,
    // then a decisive spin as the finale lands
    mesh.rotation.y = t * 0.2 + progress * 1.5 + finale * 2.6 + exit * 0.7;
    mesh.rotation.x = -0.24 + Math.sin(t * 0.32) * 0.05 + finale * 0.2 + exit * 0.2;
    mesh.rotation.z = Math.sin(t * 0.18) * 0.06 - exit * 0.2;

    const breathe = 1 + Math.sin(t * 0.85) * 0.012;
    // exit: the ring rushes the camera — its opening swallows the viewport
    const rush = 1 + exit * exit * 10;
    mesh.scale.setScalar(
      fit * (0.9 + progress * 0.1) * breathe * (1 + finale * 0.06) * rush
    );
    mesh.position.z = exit * 2.6;

    if (mat.current) {
      mat.current.envMapIntensity = 1.1 + progress * 0.3 + finale * 0.45;
      mat.current.roughness = 0.16 - finale * 0.05;
    }
  });

  return (
    <mesh ref={ring}>
      <torusGeometry args={[1.0, 0.32, low ? 40 : 64, low ? 128 : 200]} />
      <meshStandardMaterial
        ref={mat}
        color="#f3eee3"
        metalness={1}
        roughness={0.16}
        envMapIntensity={1.2}
      />
    </mesh>
  );
}

/** Soft camera parallax + a small push-in during the exit. */
function Rig({ fx }: { fx: LoaderFx }) {
  const { camera, pointer } = useThree();

  useFrame(() => {
    const tx = pointer.x * 0.4;
    const ty = -pointer.y * 0.3;
    camera.position.x += (tx - camera.position.x) * 0.05;
    camera.position.y += (ty - camera.position.y) * 0.05;
    camera.position.z += (6.2 - fx.exit * 0.9 - camera.position.z) * 0.08;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/** Sparse atmospheric dust — barely there, just enough to feel alive. */
function Dust({ fx, low }: { fx: LoaderFx; low: boolean }) {
  const points = useRef<THREE.Points>(null);
  const count = low ? 70 : 150;

  const positions = useMemo(() => {
    const array = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      array[i * 3] = (Math.random() - 0.5) * 10;
      array[i * 3 + 1] = (Math.random() - 0.5) * 6;
      array[i * 3 + 2] = (Math.random() - 0.5) * 4 - 1;
    }
    return array;
  }, [count]);

  useFrame((state, delta) => {
    if (!points.current) return;
    points.current.rotation.y += delta * 0.02;
    points.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    const material = points.current.material as THREE.PointsMaterial;
    material.opacity = 0.26 + fx.progress * 0.1;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={low ? 0.02 : 0.028}
        sizeAttenuation
        transparent
        opacity={0.3}
        color="#e9dcc0"
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/**
 * Fires once the first real frame has been rendered (environment baked,
 * geometry compiled) so the counter never starts over an empty canvas.
 */
function ReadySignal() {
  const fired = useRef(false);

  useFrame(() => {
    if (fired.current) return;
    fired.current = true;
    window.dispatchEvent(new Event("preloader:scene-ready"));
  });

  return null;
}

export default function PreloaderScene({ fx, low = false }: SceneProps) {
  return (
    <Canvas
      dpr={low ? 1 : [1, 1.6]}
      camera={{ position: [0, 0, 6.2], fov: 38, near: 0.1, far: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.08;
        gl.setClearColor(0x000000, 0);
      }}
      style={{ position: "absolute", inset: 0 }}
    >
      <StudioEnvironment />
      <ReadySignal />
      <Rig fx={fx} />
      <Sculpture fx={fx} low={low} />
      <Dust fx={fx} low={low} />

      <ambientLight intensity={0.22} />
      <directionalLight position={[4, 5, 3]} intensity={2.1} color="#ffe9cf" />
      <directionalLight position={[-5, -2, -4]} intensity={1.0} color="#9fb4d8" />
    </Canvas>
  );
}
