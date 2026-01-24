// src/components/DisplacementSphere.tsx
import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import styles from "./Sphere.module.css";
import api from "../api/client";

const GOLD_NUM = 0x68a5bf;

// === Scroll behavior tuning ===
const SHRINK_END_PX = 320;
const FADE_OUT_END_PX = 800;

// === Morph animation tuning ===
const MORPH_DURATION_MS = 1600; // total morph time
const EASE = (t: number) => 1 - Math.pow(1 - t, 3); // cubic ease-out

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Non-WebGL fallback: gold glow */
const GlowFallback: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let raf = 0;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      const w = Math.max(250, Math.floor(rect?.width ?? window.innerWidth));
      const h = Math.max(250, Math.floor(rect?.height ?? window.innerHeight));
      const dpr = Math.min(1.75, window.devicePixelRatio || 1);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const draw = () => {
      const Wc = canvas.clientWidth;
      const Hc = canvas.clientHeight;
      ctx.clearRect(0, 0, Wc, Hc);

      const cx = Wc / 2;
      const cy = Hc / 2;
      const r = Math.min(Wc, Hc) * 0.32;

      const grad = ctx.createRadialGradient(cx, cy, r * 0.15, cx, cy, r * 1.5);
      grad.addColorStop(0, "#68a5bf");
      grad.addColorStop(0.6, "#68a5bf");
      grad.addColorStop(1, "#68a5bf");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.6, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(draw);
    };

    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.sphereContainer} />;
};

const DisplacementSphere: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [webglOK, setWebglOK] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Scroll-driven visual state (applied to wrapper so it affects WebGL and fallback)
  const [wrapStyle, setWrapStyle] = useState<{ opacity: number; scale: number }>({
    opacity: 1,
    scale: 1,
  });

  useEffect(() => {
    setIsClient(true);
    setWebglOK(hasWebGL());
  }, []);

  // Check if user is logged in and enrolled
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [st, mine] = await Promise.all([
          api.get("/community/status").catch(() => ({ data: null })),
          api.get("/purchase/mine").catch(() => ({ data: [] })),
        ]);
        const vip = !!(st as any)?.data?.vip;
        const tg = !!(st as any)?.data?.telegram;
        const list = Array.isArray((mine as any)?.data) ? (mine as any).data : [];
        const confirmed = list.some(
          (p: any) => String(p.status || "").toUpperCase() === "CONFIRMED"
        );
        if (active) {
          setIsEnrolled(vip || tg || confirmed);
        }
      } catch {}
    })();
    return () => {
      active = false;
    };
  }, []);

  // === Scroll handler with rAF throttle
  useEffect(() => {
    if (!isClient) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY || window.pageYOffset || 0;

      // Phase 1: 0 -> SHRINK_END_PX
      if (y <= SHRINK_END_PX) {
        const p = Math.min(1, y / SHRINK_END_PX); // 0..1
        const scale = 1 - 0.3 * p; // 1 -> 0.7
        const opacity = 1 - 0.6 * p; // 1 -> 0.4
        setWrapStyle({ opacity, scale });
      } else {
        // Phase 2: SHRINK_END_PX -> FADE_OUT_END_PX
        const p2 = Math.min(1, (y - SHRINK_END_PX) / Math.max(1, FADE_OUT_END_PX - SHRINK_END_PX));
        const scale = 0.7 - 0.15 * p2; // 0.7 -> 0.55
        const opacity = 0.5 * (1 - p2); // ~0.5 -> 0
        setWrapStyle({ opacity, scale });
      }
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isClient]);

  useEffect(() => {
    if (!isClient || !webglOK || !mountRef.current) return;

    // ===== Scene, Camera, Renderer =====
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    // @ts-ignore
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const container = mountRef.current;
    container.appendChild(renderer.domElement);

    const maxDpr = /Mobi|Android/i.test(navigator.userAgent) ? 1.75 : 2;

    const setSize = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(290, Math.floor(rect.width));
      const height = Math.max(290, Math.floor(rect.height));
      const dpr = Math.min(maxDpr, window.devicePixelRatio || 1);
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    setSize();

    const widthNow = container.getBoundingClientRect().width;
    const isSmall = widthNow < 520;
    const radius = isSmall ? 3.2 : 3.0;
    const widthSegments = isSmall ? 48 : 64;
    const heightSegments = isSmall ? 48 : 64;

    // ===== Geometry with displacement =====
    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    const posAttr = geometry.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();

    // Store original positions and create two states
    const originalPositions = new Float32Array(posAttr.count * 3);
    const chaoticPositions = new Float32Array(posAttr.count * 3);
    const calmPositions = new Float32Array(posAttr.count * 3);

    for (let i = 0; i < posAttr.count; i++) {
      v.fromBufferAttribute(posAttr, i);
      originalPositions[i * 3] = v.x;
      originalPositions[i * 3 + 1] = v.y;
      originalPositions[i * 3 + 2] = v.z;

      // Chaotic state: spiky and aggressive
      const chaoticOffset = (Math.random() - 0.5) * 0.85;
      const chaoticBump = 1 + chaoticOffset * Math.sin(v.length() * 5.0);
      const vChaotic = v.clone().multiplyScalar(chaoticBump);
      chaoticPositions[i * 3] = vChaotic.x;
      chaoticPositions[i * 3 + 1] = vChaotic.y;
      chaoticPositions[i * 3 + 2] = vChaotic.z;

      // Calm state: subtle and smooth
      const calmOffset = (Math.random() - 0.5) * 0.18;
      const calmBump = 1 + calmOffset * Math.sin(v.length() * 2.5);
      const vCalm = v.clone().multiplyScalar(calmBump);
      calmPositions[i * 3] = vCalm.x;
      calmPositions[i * 3 + 1] = vCalm.y;
      calmPositions[i * 3 + 2] = vCalm.z;
    }

    // Start with appropriate state
    const startPositions = isEnrolled ? calmPositions : chaoticPositions;
    for (let i = 0; i < posAttr.count; i++) {
      posAttr.setXYZ(i, startPositions[i * 3], startPositions[i * 3 + 1], startPositions[i * 3 + 2]);
    }
    geometry.computeVertexNormals();

    // ===== Mesh / Materials =====
    // Use emissive to maintain stable #68a5bf gold color regardless of theme mode
    const material = new THREE.MeshStandardMaterial({
      color: GOLD_NUM,
      emissive: GOLD_NUM,
      emissiveIntensity: 0.28,
      metalness: 0.85,
      roughness: 0.3,
      transparent: true,
      opacity: 0.6, // spiky starts a bit brighter; calm will tween down to ~0.38
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Lights (subtle rim + ambient)
    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(3, 5, 4);
    scene.add(dir);

    camera.position.z = 10.5;

    // ===== Animate with time-based delta and morphing
    const clock = new THREE.Clock();
    let running = true;
    let morphProgress = 0; // 0 = chaotic, 1 = calm
    let targetMorph = isEnrolled ? 1 : 0;
    const morphSpeed = 1 / (MORPH_DURATION_MS / 1000); // per second

    // Rotation speeds
    const chaoticRotSpeed = { x: 2.4, y: 3.8, z: 1.6 };
    const calmRotSpeed = { x: 0.9, y: 1.8, z: 0 };

    const animate = () => {
      if (!running) return;
      const dt = clock.getDelta();

      // Morph geometry smoothly
      if (Math.abs(morphProgress - targetMorph) > 0.001) {
        const direction = targetMorph > morphProgress ? 1 : -1;
        morphProgress += direction * morphSpeed * dt;
        morphProgress = Math.max(0, Math.min(1, morphProgress));
        const t = EASE(morphProgress);

        // Interpolate vertex positions
        for (let i = 0; i < posAttr.count; i++) {
          const cx = chaoticPositions[i * 3];
          const cy = chaoticPositions[i * 3 + 1];
          const cz = chaoticPositions[i * 3 + 2];
          const lx = calmPositions[i * 3];
          const ly = calmPositions[i * 3 + 1];
          const lz = calmPositions[i * 3 + 2];

          posAttr.setXYZ(
            i,
            cx + (lx - cx) * t,
            cy + (ly - cy) * t,
            cz + (lz - cz) * t
          );
        }
        posAttr.needsUpdate = true;
        geometry.computeVertexNormals();
      }

      // Interpolate rotation speed
      const rotT = EASE(morphProgress);
      const rotX = chaoticRotSpeed.x + (calmRotSpeed.x - chaoticRotSpeed.x) * rotT;
      const rotY = chaoticRotSpeed.y + (calmRotSpeed.y - chaoticRotSpeed.y) * rotT;
      const rotZ = chaoticRotSpeed.z + (calmRotSpeed.z - chaoticRotSpeed.z) * rotT;

      sphere.rotation.x += dt * rotX;
      sphere.rotation.y += dt * rotY;
      sphere.rotation.z += dt * rotZ;

      renderer.render(scene, camera);
    };
    renderer.setAnimationLoop(animate);

    // Watch for enrollment changes
    const enrollmentWatcher = setInterval(() => {
      targetMorph = isEnrolled ? 1 : 0;
    }, 100);

    // Resize
    const onWindowResize = () => setSize();
    const ro = new ResizeObserver(setSize);
    ro.observe(container);
    window.addEventListener("resize", onWindowResize);

    // Pause when offscreen or tab hidden
    let io: IntersectionObserver | null = null;
    const visibilityHandler = () => {
      running = document.visibilityState !== "hidden";
      if (running) clock.getDelta();
    };
    document.addEventListener("visibilitychange", visibilityHandler);
    io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        running = !!entry?.isIntersecting;
        if (running) clock.getDelta();
      },
      { threshold: 0.01 }
    );
    io.observe(container);

    // Cleanup
    return () => {
      running = false;
      clearInterval(enrollmentWatcher);
      window.removeEventListener("resize", onWindowResize);
      ro.disconnect();
      document.removeEventListener("visibilitychange", visibilityHandler);
      io && io.disconnect();

      scene.remove(sphere);
      geometry.dispose();
      material.dispose();
      renderer.setAnimationLoop(null);
      renderer.dispose();

      if (renderer.domElement && renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isClient, webglOK, isEnrolled]);

  if (!isClient) return null;

  // Wrapper applies smooth transform + fade
  const { opacity, scale } = wrapStyle;

  return (
    <div
      className={styles.sphereContainer}
      ref={mountRef}
      style={{
        opacity,
        transform: `scale(${scale})`,
        transition: "opacity 120ms linear, transform 160ms ease-out",
        willChange: "opacity, transform",
        pointerEvents: "none",
      }}
    >
      {!webglOK && <GlowFallback />}
    </div>
  );
};

export default DisplacementSphere;
