import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { CARDS_ASSET_PREFIX } from "@/lib/api";
import { environmentFlags, usePointerTracking, type PointerState } from "@/components/landing/usePointerParallax";

const LiquidBasin = lazy(() => import("@/components/landing/LiquidBasin"));

export const BASIN_FALLBACK_CLASS = "absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_38%,rgba(50,180,190,0.12),transparent),radial-gradient(ellipse_90%_70%_at_50%_110%,rgba(10,20,40,0.9),transparent)]";

function BasinFallback() {
  return <div aria-hidden="true" className={BASIN_FALLBACK_CLASS} />;
}

const REVEAL_OFFSETS_MS = [0, 90, 180, 270, 360];

function Reveal({
  delayIndex,
  children,
  className = "",
}: {
  delayIndex: number;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { reducedMotion } = environmentFlags();
  const [shown, setShown] = useState(reducedMotion);

  useEffect(() => {
    if (shown) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          const id = window.setTimeout(() => setShown(true), REVEAL_OFFSETS_MS[delayIndex] ?? 0);
          observer.disconnect();
          return () => window.clearTimeout(id);
        }
      },
      { threshold: 0.2 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [shown, delayIndex]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ease-out ${
        shown ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

function BackCard({ tilt, children }: { tilt: { x: number; y: number }; children: React.ReactNode }) {
  return (
    <div
      className="card-scene w-full max-w-44"
      style={{
        transform: `perspective(900px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
        transition: "transform 180ms ease-out",
      }}
    >
      {children}
    </div>
  );
}

const MOON_CARD = {
  id: "the-moon",
  name: "The Moon",
  img: "m18.jpg",
};

export default function LandingView() {
  const navigate = useNavigate();
  const { reducedMotion, touch } = environmentFlags();
  const moonRef = useRef<HTMLHeadingElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const tiltRef = useRef({ x: 0, y: 0 });
  const moonShiftRef = useRef({ x: 0, y: 0 });
  const magnetRef = useRef({ x: 0, y: 0 });
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const pendingRef = useRef(false);
  const [exiting, setExiting] = useState(false);

  const handleBegin = useCallback(() => {
    if (exiting) return;
    setExiting(true);
    window.setTimeout(() => navigate("/reading"), 400);
  }, [exiting, navigate]);

  usePointerTracking((pointer: PointerState) => {
    if (reducedMotion || touch) return;

    const nextTilt = { x: pointer.x * 5, y: -pointer.y * 4 };
    const changed =
      Math.abs(nextTilt.x - tiltRef.current.x) > 0.15 ||
      Math.abs(nextTilt.y - tiltRef.current.y) > 0.15;
    tiltRef.current = nextTilt;

    const nextMoon = { x: -pointer.x * 8, y: -pointer.y * 5 };
    const moonChanged =
      Math.abs(nextMoon.x - moonShiftRef.current.x) > 0.15 ||
      Math.abs(nextMoon.y - moonShiftRef.current.y) > 0.15;
    moonShiftRef.current = nextMoon;

    const cta = ctaRef.current;
    let nextMagnet = magnetRef.current;
    if (cta) {
      const rect = cta.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = pointer.cx - cx;
      const dy = pointer.cy - cy;
      const distance = Math.hypot(dx, dy);
      const m = distance < 140 ? { x: dx * 0.18, y: dy * 0.18 } : { x: 0, y: 0 };
      if (m.x !== magnetRef.current.x || m.y !== magnetRef.current.y) nextMagnet = m;
    }
    magnetRef.current = nextMagnet;

    if (!pendingRef.current && (changed || moonChanged)) {
      pendingRef.current = true;
      requestAnimationFrame(() => {
        pendingRef.current = false;
        if (moonRef.current) {
          moonRef.current.style.transform = `translate(${moonShiftRef.current.x}px, ${moonShiftRef.current.y}px)`;
        }
        if (cardsRef.current) {
          cardsRef.current.style.setProperty("--tilt-x", `${tiltRef.current.x}deg`);
          cardsRef.current.style.setProperty("--tilt-y", `${tiltRef.current.y}deg`);
        }
        if (ctaRef.current) {
          ctaRef.current.style.transform = `translate(${magnetRef.current.x}px, ${magnetRef.current.y}px)`;
        }
      });
    }
  });

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Suspense fallback={<BasinFallback />}>
        <LiquidBasin />
      </Suspense>

      <div className={`relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-5 py-20 text-center${exiting ? " animate-fade-out" : ""}`}>
        <Reveal delayIndex={0}>
          <p className="font-utility text-[0.65rem] tracking-[0.45em] uppercase text-on-surface-variant">
            ✦ the cards already know ✦
          </p>
        </Reveal>

        <Reveal delayIndex={1}>
          <h1
            ref={moonRef}
            className="mt-4 font-display text-6xl font-semibold tracking-[0.18em] text-on-surface sm:text-7xl"
            style={{ transition: "transform 220ms ease-out" }}
          >
            LUNARA
          </h1>
        </Reveal>

        <Reveal delayIndex={2} className="mt-12 w-full">
          <div ref={cardsRef} data-liquid-dynamic className="mx-auto grid max-w-md grid-cols-3 gap-5">
            <BackCard tilt={tiltRef.current}>
              <div className="aspect-[2/3.4] rounded-lg border border-primary/35 bg-gradient-to-br from-surface-low to-background shadow-[inset_0_0_30px_rgba(60,170,180,0.15)]" />
            </BackCard>

            <BackCard tilt={{ x: tiltRef.current.x * 1.4, y: tiltRef.current.y * 1.4 }}>
              <div className="card-scene">
                <div className="card-inner group relative aspect-[2/3.4] rounded-lg">
                  <div className="card-face absolute inset-0 flex items-center justify-center rounded-lg border border-primary/45 bg-gradient-to-br from-surface-low to-background shadow-[inset_0_0_30px_rgba(60,170,180,0.18)] group-hover:[transform:rotateY(180deg)]">
                    <span className="font-display text-3xl text-primary/70 transition-opacity duration-300 group-hover:opacity-0">
                      &#x263D;
                    </span>
                  </div>
                  <div className="card-face card-back absolute inset-0 overflow-hidden rounded-lg border border-primary/60">
                    <img
                      src={`${CARDS_ASSET_PREFIX}${MOON_CARD.img}`}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-2 pt-6 pb-2">
                      <p className="font-display text-base italic text-white">{MOON_CARD.name}</p>
                    </div>
                  </div>
                </div>
              </div>
            </BackCard>

            <BackCard tilt={{ x: tiltRef.current.x * 0.6, y: tiltRef.current.y * 0.6 }}>
              <div className="aspect-[2/3.4] rounded-lg border border-primary/35 bg-gradient-to-br from-surface-low to-background shadow-[inset_0_0_30px_rgba(60,170,180,0.15)]" />
            </BackCard>
          </div>
        </Reveal>

        <Reveal delayIndex={3} className="mt-14 w-full max-w-xs">
          <div ref={ctaRef} data-liquid-dynamic className="block w-full" style={{ transition: "transform 180ms ease-out" }}>
            <button
              type="button"
              onClick={handleBegin}
              className="block w-full"
            >
              <md-filled-button class="w-full">
                Begin your reading
              </md-filled-button>
            </button>
          </div>
        </Reveal>

        <Reveal delayIndex={4}>
          <p className="mt-6 font-body text-sm text-on-surface-variant">
            Every reading is kept — question, cards, interpretation.
          </p>
        </Reveal>
      </div>
    </main>
  );
}
