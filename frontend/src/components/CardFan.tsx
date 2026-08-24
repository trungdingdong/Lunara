import { useEffect, useState } from "react";

import type { DrawnCard } from "@/lib/api";
import { TarotCard } from "@/components/TarotCard";

interface CardFanProps {
  cards: DrawnCard[];
  onAllRevealed: () => void;
}

const FLIP_INTERVAL_MS = 420;

export function CardFan({ cards, onAllRevealed }: CardFanProps) {
  const [dealt, setDealt] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    const dealTimer = window.setTimeout(() => setDealt(true), 60);
    return () => window.clearTimeout(dealTimer);
  }, []);

  useEffect(() => {
    if (!dealt) return;
    if (revealedCount >= cards.length) {
      onAllRevealed();
      return;
    }
    const timer = window.setTimeout(
      () => setRevealedCount((count) => count + 1),
      FLIP_INTERVAL_MS,
    );
    return () => window.clearTimeout(timer);
  }, [dealt, revealedCount, cards.length, onAllRevealed]);

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
          className={dealt ? "animate-deal-in" : "opacity-0"}
          style={
            {
              "--deal-x": `${(index - (cards.length - 1) / 2) * 14}px`,
              "--deal-r": `${(index - (cards.length - 1) / 2) * 2.2}deg`,
              animationDelay: `${index * 110}ms`,
            } as React.CSSProperties
          }
        >
          <TarotCard drawn={drawn} flipped={dealt && index < revealedCount} />
        </div>
      ))}
    </div>
  );
}
