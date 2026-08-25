import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { CARDS_ASSET_PREFIX } from "@/lib/api";
import { environmentFlags, usePointerTracking, type PointerState } from "@/components/landing/usePointerParallax";

const ScryingBasin = lazy(() => import("@/components/landing/ScryingBasin"));

function BasinFallback() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_38%,rgba(201,162,39,0.16),transparent),radial-gradient(ellipse_90%_70%_at_50%_110%,rgba(38,33,56,0.9),transparent)]"
    />
  );
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
          window.setTimeout(() => setShown(true), REVEAL_OFFSETS_MS[delayIndex] ?? 0);
          observer.disconnect();
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
  const tiltRef = useRef({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [moonShift, setMoonShift] = useState({ x: 0, y: 0 });
  const [magnet, setMagnet] = useState({ x: 0, y: 0 });
  const ctaRef = useRef<HTMLDivElement | null>(null);

  usePointerTracking((pointer: PointerState) => {
    if (reducedMotion || touch) return;

    const nextTilt = { x: pointer.x * 5, y: -pointer.y * 4 };
    const changed =
      Math.abs(nextTilt.x - tiltRef.current.x) > 0.15 ||
      Math.abs(nextTilt.y - tiltRef.current.y) > 0.15;
    tiltRef.current = nextTilt;
    if (changed) setTilt(nextTilt);

    setMoonShift({ x: -pointer.x * 8, y: -pointer.y * 5 });

    const cta = ctaRef.current;
    if (cta) {
      const rect = cta.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = pointer.cx - cx;
      const dy = pointer.cy - cy;
      const distance = Math.hypot(dx, dy);
      setMagnet(distance < 140 ? { x: dx * 0.18, y: dy * 0.18 } : { x: 0, y: 0 });
    }
  });

  const cardTilt = tilt;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Suspense fallback={<BasinFallback />}>
        <ScryingBasin />
      </Suspense>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-5 py-20 text-center">
        <Reveal delayIndex={0}>
          <p className="font-utility text-[0.65rem] tracking-[0.45em] uppercase text-on-surface-variant">
            âœ¦ the cards already know âœ¦
          </p>
        </Reveal>

        <Reveal delayIndex={1}>
          <h1
            className="mt-4 font-display text-6xl font-semibold tracking-[0.18em] text-on-surface sm:text-7xl"
            style={{
              transform: `translate(${moonShift.x}px, ${moonShift.y}px)`,
              transition: "transform 220ms ease-out",
            }}
          >
            LUNARA
          </h1>
        </Reveal>

        <Reveal delayIndex={2} className="mt-12 w-full">
          <div className="mx-auto grid max-w-md grid-cols-3 gap-5">
            <BackCard tilt={cardTilt}>
              <div className="aspect-[2/3.4] rounded-lg border border-primary/35 bg-gradient-to-br from-surface-low to-background shadow-[inset_0_0_30px_rgba(168,137,74,0.18)]" />
            </BackCard>

            <BackCard tilt={{ x: cardTilt.x * 1.4, y: cardTilt.y * 1.4 }}>
              <div className="card-scene">
                <div className="card-inner group relative aspect-[2/3.4] rounded-lg">
                  <div className="card-face absolute inset-0 flex items-center justify-center rounded-lg border border-primary/45 bg-gradient-to-br from-surface-low to-background shadow-[inset_0_0_30px_rgba(168,137,74,0.22)] group-hover:[transform:rotateY(180deg)]">
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

            <BackCard tilt={{ x: cardTilt.x * 0.6, y: cardTilt.y * 0.6 }}>
              <div className="aspect-[2/3.4] rounded-lg border border-primary/35 bg-gradient-to-br from-surface-low to-background shadow-[inset_0_0_30px_rgba(168,137,74,0.18)]" />
            </BackCard>
          </div>
        </Reveal>

        <Reveal delayIndex={3} className="mt-14 w-full max-w-xs">
          <div ref={ctaRef} className="block w-full">
            <md-filled-button
              class="w-full"
              style={{
                transform: `translate(${magnet.x}px, ${magnet.y}px)`,
                transition: "transform 180ms ease-out",
              }}
              onClick={() => navigate("/reading")}
            >
              Begin your reading
            </md-filled-button>
          </div>
        </Reveal>

        <Reveal delayIndex={4}>
          <p className="mt-6 font-body text-sm text-on-surface-variant">
            Every reading is kept â€” question, cards, interpretation.
          </p>
        </Reveal>
      </div>
    </main>
  );
}
