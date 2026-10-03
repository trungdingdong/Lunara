/**
 * CeremonyFan — tactile draw ceremony (005, extended 006).
 *
 * Timed ~8s shuffle performance with live countdown (decoupled from request
 * flight: early arrivals wait, failures abort via unmount), then a visible
 * deck-to-fan deal travel with picks locked until it lands. Taps flip that
 * position's pre-drawn card (reveal order only — the server draw stands);
 * the final reveal fires onAllRevealed exactly once. Revealed cards lift on
 * hover/focus and zoom into an in-place meaning with focus-returning
 * dismiss. Reduced motion: static statuses, instant changes.
 */
import { useEffect, useRef, useState } from "react";

import type { DrawnCard } from "@/lib/api";
import { environmentFlags } from "@/components/landing/usePointerParallax";
import { TarotCard } from "@/components/TarotCard";
import { SHUFFLE_MS, nextPerformance, nextPick, remainingPicks } from "@/components/ceremonyPolicy";

interface CeremonyFanProps {
  cards: DrawnCard[];
  /** Once streaming starts, the fan stays fully revealed (no re-pick). */
  revealAll?: boolean;
  onAllRevealed: () => void;
}

/** Esoteric Line Work back — fine arc rules, tick rings, central sigil. */
function EsotericBack() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 170"
      preserveAspectRatio="xMidYMid slice"
      className="esoteric-back absolute inset-0 h-full w-full text-primary/55"
    >
      <g stroke="currentColor" fill="none" strokeWidth="1">
        <circle cx="50" cy="85" r="46" opacity="0.5" />
        <circle cx="50" cy="85" r="38" strokeDasharray="2 3" opacity="0.7" />
        <circle cx="50" cy="85" r="30" opacity="0.5" />
        <path d="M50 47 m-9 0 a9 9 0 1 0 18 0 a7 7 0 1 1 -18 0" opacity="0.9" />
        <path d="M50 74 l0 8 M46 78 l8 0" opacity="0.9" />
        <path d="M50 92 l0 8 M46 96 l8 0" opacity="0.9" />
        <path d="M14 20 q6 -8 14 -10 M86 20 q-6 -8 -14 -10 M14 150 q6 8 14 10 M86 150 q-6 8 -14 10" opacity="0.6" />
        <circle cx="50" cy="85" r="3" fill="currentColor" stroke="none" opacity="0.9" />
      </g>
    </svg>
  );
}

const DEAL_TRAVEL_MS = 600;

export function CeremonyFan({ cards, revealAll = false, onAllRevealed }: CeremonyFanProps) {
  const [revealed, setRevealed] = useState<number[]>([]);
  const [complete, setComplete] = useState(false);
  const [meaningOpen, setMeaningOpen] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [dealLanded, setDealLanded] = useState(false);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const firedRef = useRef(false);
  const { reducedMotion } = environmentFlags();

  const perf = nextPerformance(
    { durationMs: SHUFFLE_MS, elapsedMs: elapsed, cardsArrived: cards.length > 0, failed: false },
    elapsed,
  );
  const performing = !perf.done;
  const picksLocked = performing || !dealLanded;

  useEffect(() => {
    if (perf.done) return;
    const timer = window.setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 250;
        return next >= SHUFFLE_MS ? SHUFFLE_MS : next;
      });
    }, 250);
    return () => window.clearInterval(timer);
  }, [perf.done]);

  useEffect(() => {
    if (!perf.done || dealLanded) return;
    const timer = window.setTimeout(() => setDealLanded(true), reducedMotion ? 0 : DEAL_TRAVEL_MS);
    return () => window.clearTimeout(timer);
  }, [perf.done, dealLanded, reducedMotion]);

  if (performing) {
    const countdown = Math.max(0, Math.ceil((SHUFFLE_MS - elapsed) / 1000));
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 py-10" role="status" aria-live="polite">
        <div aria-hidden="true" className="ceremony-shuffle relative aspect-[2/3.4] w-32">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              aria-hidden="true"
              className={`ceremony-shuffle-card absolute inset-0 rounded-lg border border-primary/45 bg-gradient-to-br from-surface-low to-background${reducedMotion ? "" : ` ceremony-shuffle-${i}`}`}
            />
          ))}
        </div>
        <p className="font-utility text-[0.65rem] tracking-[0.3em] uppercase text-on-surface-variant">
          Shuffling the deck… {countdown}s
        </p>
      </div>
    );
  }

  const shownRevealed = revealAll ? cards.map((_, i) => i) : revealed;
  const shownComplete = revealAll || complete;
  const remaining = remainingPicks({ total: cards.length, revealed: shownRevealed, complete: shownComplete });

  const pick = (index: number): void => {
    if (revealAll || picksLocked) return;
    const next = nextPick({ total: cards.length, revealed, complete }, index);
    setRevealed(next.revealed);
    if (next.complete && !firedRef.current) {
      firedRef.current = true;
      setComplete(true);
      onAllRevealed();
    }
  };

  const closeMeaning = (): void => {
    if (meaningOpen === null) return;
    const origin = meaningOpen;
    setMeaningOpen(null);
    window.setTimeout(() => cardRefs.current[origin]?.focus(), 0);
  };

  return (
    <div>
      <p className="mb-6 text-center font-utility text-[0.65rem] tracking-[0.3em] uppercase text-on-surface-variant" aria-live="polite">
        {shownComplete ? "Your cards are drawn" : `Pick ${remaining} card${remaining === 1 ? "" : "s"}`}
      </p>
      <div
        className={`ceremony-fan grid gap-5${dealLanded ? " ceremony-deal-travel" : ""}`}
        style={{ gridTemplateColumns: `repeat(${Math.min(cards.length, 5)}, minmax(0, 1fr))` }}
        role="list"
        aria-label="Drawn cards"
      >
        {cards.map((drawn, index) => {
          const isRevealed = shownRevealed.includes(index);
          const isZoomed = meaningOpen === index;
          const dimmed = meaningOpen !== null && !isZoomed;
          return (
            <div key={`${drawn.card.id}-${index}`} role="listitem" className={isZoomed ? "relative" : undefined}>
              <div
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                tabIndex={0}
                role="button"
                aria-label={isRevealed ? `${drawn.card.name}` : `Pick card ${index + 1}`}
                aria-disabled={picksLocked}
                onClick={() => (isRevealed ? setMeaningOpen(index) : pick(index))}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    if (isRevealed) setMeaningOpen(index);
                    else pick(index);
                  }
                  if (event.key === "Escape") closeMeaning();
                }}
                className={`ceremony-card ${isRevealed ? "" : "ceremony-facedown"}${isZoomed ? " ceremony-zoom" : ""}${dimmed ? " ceremony-dim" : ""} outline-none`}
              >
                {isRevealed ? (
                  <TarotCard drawn={drawn} flipped />
                ) : (
                  <div className="relative aspect-[2/3.4] overflow-hidden rounded-lg border border-primary/40 bg-gradient-to-br from-surface-low to-background shadow-[inset_0_0_30px_rgba(168,137,74,0.2)]">
                    <EsotericBack />
                  </div>
                )}
              </div>
              {meaningOpen === index && (
                <div className="ceremony-meaning ceremony-meaning-side z-20 mt-3 rounded-lg border border-outline-variant bg-surface-container p-4 text-left shadow-xl md:absolute md:top-0 md:left-full md:mt-0 md:ml-4 md:w-60">
                  <h3 className="font-display text-lg font-semibold italic text-on-surface">{drawn.card.name}</h3>
                  <p className="mt-1 font-utility text-[0.6rem] tracking-widest uppercase text-on-surface-variant">
                    {drawn.is_reversed ? "↺ reversed" : "↑ upright"} · {drawn.position}
                  </p>
                  <p className="mt-2 font-body text-sm text-on-surface-variant">
                    {(drawn.is_reversed ? drawn.card.reversed.meanings : drawn.card.upright.meanings).slice(0, 3).join(" · ")}
                  </p>
                  <button
                    type="button"
                    onClick={closeMeaning}
                    aria-label={`Exit ${drawn.card.name} meaning`}
                    className="mt-3 font-utility text-[0.65rem] tracking-[0.2em] uppercase text-primary hover:underline"
                  >
                    Exit
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
