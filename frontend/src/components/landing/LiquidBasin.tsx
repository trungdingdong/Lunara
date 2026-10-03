/**
 * @deprecated Superseded by `GalaxyBackdrop` (001-galaxy-landing-background).
 * Kept in tree for backwards compatibility; the landing page no longer renders
 * this component. Removal is a separate cleanup task (including the `liquid-gl`
 * dependency). Do not use in new code.
 *
 * The Liquid Basin — full-viewport liquidGL glassmorphism overlay.
 */
import { useLayoutEffect, useRef } from "react";
import liquidGL from "liquid-gl";

import { environmentFlags } from "./usePointerParallax";

const BASIN_FALLBACK_CLASS = "absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_38%,rgba(50,180,190,0.12),transparent),radial-gradient(ellipse_90%_70%_at_50%_110%,rgba(10,20,40,0.9),transparent)]";

const TARGET_SELECTOR = ".liquid-basin";

export default function LiquidBasin() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { reducedMotion } = environmentFlags();

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (container === null) return;

    try {
      liquidGL({
        target: TARGET_SELECTOR,
        snapshot: "body",
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        refraction: 0.012,
        aberration: 0.035,
        bevelDepth: 0.06,
        bevelWidth: 0.18,
        frost: 0.3,
        shadow: false,
        specular: true,
        reveal: "none",
        tilt: !reducedMotion,
        tiltFactor: 3,
        tiltEase: 400,
        magnify: 1,
      });

      const dynamicEls = document.querySelectorAll(
        "[data-liquid-dynamic]",
      );
      if (dynamicEls.length > 0) {
        liquidGL.registerDynamic(dynamicEls as NodeListOf<HTMLElement>);
      }
    } catch {
      console.warn("liquidGL: initialization failed, falling back to CSS.");
      container.style.background = "rgba(255,255,255,0.07)";
      container.style.backdropFilter = "blur(12px)";
      (container.style as unknown as Record<string, string>).webkitBackdropFilter = "blur(12px)";
    }
  }, [reducedMotion]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`${BASIN_FALLBACK_CLASS} liquid-basin`}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
      }}
    />
  );
}
