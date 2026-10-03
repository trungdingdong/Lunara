/**
 * CelestialTransition — full-screen theme-change overlay (003).
 *
 * Medieval Woodcut style sun + moon (inline SVG, no assets) orbiting each
 * other over a geocentric-ring backdrop. aria-hidden, pointer-events-none,
 * zero focusables; the parent unmounts it on settle. Rapid toggles sustain
 * the spin (same mounted instance, retargeted direction); stale timers
 * no-op via run guards.
 */
import type { TransitionDirection } from "./transitionPolicy";
import { VEIL_ROOT_CLASS } from "./transitionPolicy";

function WoodcutSun() {
  const rays = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  return (
    <g stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="0" cy="0" r="26" strokeWidth="3" />
      <circle cx="0" cy="0" r="20" strokeWidth="1" strokeDasharray="3 4" />
      {rays.map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const len = i % 2 === 0 ? 18 : 11;
        return (
          <line
            key={deg}
            x1={Math.cos(rad) * 30}
            y1={Math.sin(rad) * 30}
            x2={Math.cos(rad) * (30 + len)}
            y2={Math.sin(rad) * (30 + len)}
          />
        );
      })}
      <path d="M-9 -4 l3 0 M6 -4 l3 0 M-4 6 q4 3 8 0" strokeWidth="2" />
      <path d="M-14 12 l28 0 M-12 16 l24 0" strokeWidth="1" opacity="0.6" />
    </g>
  );
}

function WoodcutMoon() {
  return (
    <g stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round">
      <path d="M14 -24 A28 28 0 1 0 14 24 A22 22 0 1 1 14 -24 Z" strokeWidth="3" />
      <path d="M-2 -8 l4 0 M-4 2 l5 0" strokeWidth="2" />
      <path d="M-8 10 l20 0 M-6 14 l16 0" strokeWidth="1" opacity="0.6" />
    </g>
  );
}

export default function CelestialTransition({ direction }: { direction: TransitionDirection }) {
  const toLight = direction === "to-light";
  return (
    <div aria-hidden="true" className={`${VEIL_ROOT_CLASS} veil-${direction}`}>
      <div aria-hidden="true" className="veil-nightday absolute inset-0" />
      <div aria-hidden="true" className="veil-rings absolute inset-0" />
      {[0, 1, 2].map((i) => (
        <span key={i} aria-hidden="true" className={`veil-startrail veil-startrail-${i}`} />
      ))}
      <div aria-hidden="true" className="veil-orbit absolute inset-0">
        <svg
          aria-hidden="true"
          viewBox="-60 -60 120 120"
          className={`veil-sun ${toLight ? "text-amber-200" : "text-indigo-200"}`}
        >
          <WoodcutSun />
        </svg>
        <svg
          aria-hidden="true"
          viewBox="-60 -60 120 120"
          className={`veil-moon ${toLight ? "text-indigo-200" : "text-amber-200"}`}
        >
          <WoodcutMoon />
        </svg>
      </div>
    </div>
  );
}
