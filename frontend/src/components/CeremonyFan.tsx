/**
 * CeremonyFan — tactile draw ceremony (005).
 *
 * Shuffle deck while the request is in flight, then a face-down fan sized
 * to the spread: taps flip that position's pre-drawn card (reveal order
 * only — the server draw stands). The final reveal fires onAllRevealed
 * exactly once. Revealed cards lift on hover/focus and open an in-place
 * meaning with focus-returning dismiss. Reduced motion: static statuses,
 * instant changes.
 */
import { useRef, useState } from "react";

import type { DrawnCard } from "@/lib/api";
import { environmentFlags } from "@/components/landing/usePointerParallax";
import { TarotCard } from "@/components/TarotCard";
import { nextPick, remainingPicks } from "@/components/ceremonyPolicy";

interface CeremonyFanProps {
  cards: DrawnCard[];
  shuffling: boolean;
  /** Once streaming starts, the fan stays fully revealed (no re-pick). */
  revealAll?: boolean;
  onAllRevealed: () => void;
}

export function CeremonyFan({ cards, shuffling, revealAll = false, onAllRevealed }: CeremonyFanProps) {
  const [revealed, setRevealed] = useState<number[]>([]);
  const [complete, setComplete] = useState(false);
  const [meaningOpen, setMeaningOpen] = useState<number | null>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const firedRef = useRef(false);
  const { reducedMotion } = environmentFlags();

  const shownRevealed = revealAll ? cards.map((_, i) => i) : revealed;
  const shownComplete = revealAll || complete;

  if (shuffling) {
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
          Shuffling the deck…
        </p>
      </div>
    );
  }

  const remaining = remainingPicks({ total: cards.length, revealed: shownRevealed, complete: shownComplete });

  const pick = (index: number): void => {
    if (revealAll) return;
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
        className="ceremony-fan grid gap-5"
        style={{ gridTemplateColumns: `repeat(${Math.min(cards.length, 5)}, minmax(0, 1fr))` }}
        role="list"
        aria-label="Drawn cards"
      >
        {cards.map((drawn, index) => {
          const isRevealed = shownRevealed.includes(index);
          return (
            <div key={`${drawn.card.id}-${index}`} role="listitem">
              <div
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                tabIndex={0}
                role="button"
                aria-label={isRevealed ? `${drawn.card.name}` : `Pick card ${index + 1}`}
                onClick={() => (isRevealed ? setMeaningOpen(index) : pick(index))}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    if (isRevealed) setMeaningOpen(index);
                    else pick(index);
                  }
                  if (event.key === "Escape") closeMeaning();
                }}
                className={`ceremony-card ${isRevealed ? "" : "ceremony-facedown"} outline-none`}
              >
                {isRevealed ? (
                  <TarotCard drawn={drawn} flipped />
                ) : (
                  <div className="aspect-[2/3.4] rounded-lg border border-primary/40 bg-gradient-to-br from-surface-low to-background shadow-[inset_0_0_30px_rgba(168,137,74,0.2)]" />
                )}
              </div>
              {meaningOpen === index && (
                <div className="ceremony-meaning mt-3 rounded-lg border border-outline-variant bg-surface-container p-4 text-left">
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
                    className="mt-3 font-utility text-[0.65rem] tracking-[0.2em] uppercase text-primary hover:underline"
                  >
                    Close
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
