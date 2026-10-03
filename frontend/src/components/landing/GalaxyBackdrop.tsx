/**
 * GalaxyBackdrop — animated astral backdrop for the landing page only.
 *
 * Layered Canvas 2D starfield (far twinkle + near drift, occasional glint)
 * over CSS nebula gradients. Strictly behind hero content (`z-0`,
 * `pointer-events-none`, `aria-hidden`): it can never intercept pointer,
 * touch, or keyboard interaction.
 *
 * Motion policy (see `galaxyField.resolveAnimationState`):
 * reduced-motion → one static frame · Canvas failure → CSS fallback ·
 * hidden/off-screen → rAF paused.
 */
import { useEffect, useRef, useState } from "react";

import { environmentFlags } from "./usePointerParallax";
import {
  GALAXY_FALLBACK_CLASS,
  GALAXY_NEBULA_CLASS,
  GALAXY_ROOT_CLASS,
  createStarField,
  resolveAnimationState,
  resolveDpr,
  shouldShowShootingStars,
  type DriftSpeed,
} from "./galaxyField";

export interface GalaxyBackdropProps {
  starCountFar?: number;
  starCountNear?: number;
  driftSpeed?: DriftSpeed;
  nebulaIntensity?: number;
  shootingStars?: boolean;
}

const GLINT_INTERVAL_MS = 7000;

export default function GalaxyBackdrop({
  starCountFar = 140,
  starCountNear = 80,
  driftSpeed = { far: 6, near: 14 },
  nebulaIntensity = 1,
  shootingStars = true,
}: GalaxyBackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) {
      setFallback(true);
      return;
    }
    const ctx = canvas.getContext("2d");
    if (ctx === null) {
      setFallback(true);
      return;
    }

    const { reducedMotion, touch } = environmentFlags();
    const state = resolveAnimationState({ reducedMotion, canvasAvailable: true, visible: true });
    const glints = shouldShowShootingStars({ reducedMotion, coarsePointer: touch, prop: shootingStars });
    const dpr = resolveDpr(window.devicePixelRatio || 1, touch);
    const stars = createStarField({ width: 1, height: 1, far: starCountFar, near: starCountNear });

    let raf = 0;
    let running = state === "playing";
    let width = 0;
    let height = 0;
    let nextGlint = performance.now() + GLINT_INTERVAL_MS;

    const resize = (): void => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const paint = (now: number): void => {
      const t = now / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      for (const star of stars) {
        const speed = star.layer === "far" ? driftSpeed.far : driftSpeed.near;
        const drift = ((t * speed) / Math.max(1, width)) % 1;
        const x = (((star.x + drift) % 1) + 1) % 1;
        const twinkle = 0.55 + 0.45 * Math.sin(t * star.twinkleSpeed + star.phase);
        ctx.globalAlpha = star.layer === "far" ? 0.75 * twinkle : 0.95 * twinkle;
        ctx.fillStyle = "#e8e3f4";
        ctx.beginPath();
        ctx.arc(x * width, star.y * height, star.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (glints && now >= nextGlint) {
        nextGlint = now + GLINT_INTERVAL_MS;
        const gx = width * 0.2 + Math.random() * width * 0.6;
        const gy = height * 0.15 + Math.random() * height * 0.3;
        const grad = ctx.createLinearGradient(gx, gy, gx - 70, gy + 26);
        grad.addColorStop(0, "rgba(232,227,244,0.9)");
        grad.addColorStop(1, "rgba(232,227,244,0)");
        ctx.globalAlpha = 1;
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(gx, gy);
        ctx.lineTo(gx - 70, gy + 26);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    if (state === "static") {
      paint(1200);
      return () => {
        window.removeEventListener("resize", resize);
      };
    }

    const loop = (now: number): void => {
      if (!running) return;
      paint(now);
      raf = window.requestAnimationFrame(loop);
    };
    raf = window.requestAnimationFrame(loop);

    const onVisibility = (): void => {
      const visible = document.visibilityState === "visible";
      const next = resolveAnimationState({ reducedMotion, canvasAvailable: true, visible });
      if (next === "playing" && !running) {
        running = true;
        raf = window.requestAnimationFrame(loop);
      } else if (next === "paused" && running) {
        running = false;
        window.cancelAnimationFrame(raf);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    const host = hostRef.current;
    const observer =
      typeof IntersectionObserver === "undefined" || host === null
        ? null
        : new IntersectionObserver(
            (entries) => {
              const inView = entries.some((entry) => entry.isIntersecting);
              const next = resolveAnimationState({ reducedMotion, canvasAvailable: true, visible: inView });
              if (next === "playing" && !running) {
                running = true;
                raf = window.requestAnimationFrame(loop);
              } else if (next === "paused" && running) {
                running = false;
                window.cancelAnimationFrame(raf);
              }
            },
            { threshold: 0 },
          );
    if (observer !== null && host !== null) observer.observe(host);

    return () => {
      running = false;
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      observer?.disconnect();
    };
  }, [driftSpeed, nebulaIntensity, shootingStars, starCountFar, starCountNear]);

  return (
    <div ref={hostRef} aria-hidden="true" className={GALAXY_ROOT_CLASS}>
      <div
        aria-hidden="true"
        className={GALAXY_NEBULA_CLASS}
        style={{ opacity: Math.min(1, Math.max(0, nebulaIntensity)) }}
      />
      {fallback ? (
        <div aria-hidden="true" className={GALAXY_FALLBACK_CLASS} />
      ) : (
        <canvas ref={canvasRef} aria-hidden="true" className="galaxy-canvas absolute inset-0 h-full w-full" />
      )}
    </div>
  );
}
