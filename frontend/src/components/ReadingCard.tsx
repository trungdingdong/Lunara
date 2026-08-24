import { memo } from "react";
import { Link } from "react-router-dom";

import type { StoredReading } from "@/lib/api";
import { CARDS_ASSET_PREFIX } from "@/lib/api";
import { rankLabel } from "@/lib/tarot";

interface ReadingCardProps {
  reading: StoredReading;
}

function ReadingCardInner({ reading }: ReadingCardProps) {
  const first = reading.drawn_cards[0]?.card;
  const artwork = first?.img ?? null;

  return (
    <Link
      to={`/readings/${reading.id}`}
      className="group block overflow-hidden rounded-[var(--md-sys-shape-corner-large)] border border-outline-variant bg-surface-low transition-standard hover:border-primary/60 hover:shadow-[0_8px_28px_-12px] hover:shadow-primary/30 focus-visible:outline-2 focus-visible:outline-primary"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-surface-container">
        {artwork ? (
          <>
            <img
              src={`${CARDS_ASSET_PREFIX}${artwork}`}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-200 ease-out group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-display text-5xl text-primary/40">&#x263D;</span>
          </div>
        )}
        <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-1 font-utility text-[0.58rem] tracking-widest uppercase text-white/90 backdrop-blur-sm">
          {reading.intent_category}
        </span>
        <span className="absolute bottom-3 right-3 rounded-full bg-black/45 px-2 py-1 font-utility text-[0.58rem] text-white/70">
          {reading.drawn_cards.length} cards
        </span>
      </div>

      <div className="space-y-1.5 px-4 py-3.5">
        <p className="truncate font-display text-lg text-on-surface italic">“{reading.question}”</p>
        <p className="flex items-center gap-2 font-utility text-[0.6rem] tracking-widest uppercase text-on-surface-variant">
          <span>{reading.spread_name}</span>
          <span aria-hidden="true" className="text-outline">
            ·
          </span>
          <span>{first ? rankLabel(first) : "—"}</span>
          <span aria-hidden="true" className="text-outline">
            ·
          </span>
          <span>seed {String(reading.seed).slice(0, 6)}</span>
        </p>
      </div>
    </Link>
  );
}

export const ReadingCard = memo(ReadingCardInner);
