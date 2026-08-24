import { memo, useState } from "react";

import type { DrawnCard } from "@/lib/api";
import { CARDS_ASSET_PREFIX } from "@/lib/api";
import { rankLabel, suitGlyph } from "@/lib/tarot";

interface TarotCardProps {
  drawn: DrawnCard;
  flipped: boolean;
}

function TarotCardInner({ drawn, flipped }: TarotCardProps) {
  const { card, is_reversed, position } = drawn;
  const [imageFailed, setImageFailed] = useState(false);
  const showArtwork = Boolean(card.img) && !imageFailed;

  return (
    <div className="card-scene flex w-full flex-col items-center gap-3">
      <p className="font-utility text-[0.65rem] tracking-[0.25em] uppercase text-on-surface-variant">
        {position}
      </p>

      <div
        role="img"
        aria-label={`${card.name}, ${is_reversed ? "reversed" : "upright"}`}
        className={`card-inner relative aspect-[2/3.4] w-full max-w-38 ${flipped ? "flipped" : ""}`}
      >
        <div
          className={`card-face absolute inset-0 overflow-hidden rounded-[var(--md-sys-shape-corner-medium)] border border-primary/50 shadow-[0_6px_20px_-8px_rgba(201_162_39/0.45)] ${
            is_reversed ? "rotate-180" : ""
          }`}
        >
          {showArtwork && card.img ? (
            <>
              <img
                src={`${CARDS_ASSET_PREFIX}${card.img}`}
                alt=""
                loading="lazy"
                onError={() => setImageFailed(true)}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-2 pt-8 pb-2.5">
                <h3 className="font-display text-lg leading-tight font-semibold italic text-on-background">
                  {card.name}
                </h3>
              </div>
            </>
          ) : (
            <TypographicFace card={card} isReversed={is_reversed} />
          )}
          {showArtwork && (
            <span
              className={`absolute top-2 right-2 rounded-full bg-black/60 px-1.5 py-0.5 font-utility text-[0.58rem] ${
                is_reversed ? "text-primary" : "text-white/80"
              }`}
            >
              {is_reversed ? "\u21BA" : "\u2191"}
            </span>
          )}
        </div>

        <div className="card-face card-back absolute inset-0 flex items-center justify-center rounded-[inherit] border border-primary/40 bg-gradient-to-br from-surface-low to-background shadow-[inset_0_0_30px_rgba(168,137,74,0.2)]">
          <div className="flex h-[85%] w-[82%] items-center justify-center rounded border border-primary/30">
            <span className="font-display text-4xl text-primary/70">&#x263D;</span>
          </div>
        </div>
      </div>

      <span
        aria-hidden="true"
        className={`font-utility text-xs transition-opacity duration-700 ${
          flipped && is_reversed ? "text-primary opacity-100" : "opacity-0"
        }`}
      >
        &#x21BA;
      </span>
    </div>
  );
}

function TypographicFace({ card, isReversed }: { card: DrawnCard["card"]; isReversed: boolean }) {
  return (
    <div className="flex h-full flex-col items-center justify-between rounded-[inherit] border border-primary/60 bg-gradient-to-b from-surface-high to-surface-low px-3 py-4">
      <span className="font-display text-sm text-primary/90">
        {rankLabel(card)} {suitGlyph(card.suit)}
      </span>
      <div className="flex flex-col items-center gap-1 text-center">
        <h3 className="font-display text-xl leading-tight font-semibold italic text-on-surface">
          {card.name}
        </h3>
        <p className="font-utility text-[0.6rem] tracking-widest uppercase text-on-surface-variant">
          {isReversed ? "\u21BA reversed" : "\u2191 upright"}
        </p>
      </div>
      <p className="text-[0.62rem] leading-snug font-body text-on-surface-variant/90">
        {card.keywords.slice(0, 3).join(" · ")}
      </p>
    </div>
  );
}

export const TarotCard = memo(TarotCardInner);
