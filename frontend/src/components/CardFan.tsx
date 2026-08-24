import type { DrawnCard } from "@/lib/api";
import { DEFAULT_DEAL_TIMING, useDealSequence, useSingleFire } from "@/lib/dealSequence";
import { TarotCard } from "@/components/TarotCard";

interface CardFanProps {
  cards: DrawnCard[];
  onAllRevealed: () => void;
}

export function CardFan({ cards, onAllRevealed }: CardFanProps) {
  const sequence = useDealSequence(cards.length);
  const allRevealed = cards.length > 0 && sequence.dealt && sequence.revealedCount >= cards.length;

  useSingleFire(onAllRevealed, allRevealed);

  return (
    <div
      className="grid gap-5"
      style={{ gridTemplateColumns: `repeat(${Math.min(cards.length, 5)}, minmax(0, 1fr))` }}
      role="list"
      aria-label="Drawn cards"
    >
      {cards.map((drawn, index) => (
        <div
          key={`${drawn.card.id}-${index}`}
          role="listitem"
          className={sequence.dealt ? "animate-deal-in" : "opacity-0"}
          style={
            {
              "--deal-x": `${(index - (cards.length - 1) / 2) * 14}px`,
              "--deal-r": `${(index - (cards.length - 1) / 2) * 2.2}deg`,
              animationDelay: `${index * (DEFAULT_DEAL_TIMING.flipIntervalMs / 4)}ms`,
            } as React.CSSProperties
          }
        >
          <TarotCard drawn={drawn} flipped={sequence.dealt && index < sequence.revealedCount} />
        </div>
      ))}
    </div>
  );
}
