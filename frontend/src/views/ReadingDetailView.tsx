import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Copy } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { CardFan } from "@/components/CardFan";
import { Skeleton } from "@/components/Skeleton";
import { StreamPane } from "@/components/StreamPane";

export function ReadingDetailView() {
  const { id = "" } = useParams();
  const readingQuery = useQuery({
    queryKey: queryKeys.readings.detail(id),
    queryFn: () => api.getReading(id),
    enabled: id.length > 0,
  });
  const [cardsRevealed, setCardsRevealed] = useState(true);

  function copySeed(seed: number) {
    navigator.clipboard
      .writeText(String(seed))
      .then(() => toast("Seed copied to clipboard"))
      .catch(() => toast.error("Clipboard unavailable"));
  }

  if (readingQuery.isPending) {
    return (
      <main className="mx-auto w-full max-w-4xl space-y-8 px-5 pt-12">
        <Skeleton className="h-6 w-2/3" />
        <div className="grid grid-cols-3 gap-5">
          <Skeleton className="aspect-[2/3.4]" />
          <Skeleton className="aspect-[2/3.4]" />
          <Skeleton className="aspect-[2/3.4]" />
        </div>
        <Skeleton className="h-40" />
      </main>
    );
  }

  if (readingQuery.isError || !readingQuery.data) {
    return (
      <main className="mx-auto max-w-2xl px-5 pt-20 text-center">
        <p role="alert" className="font-body text-sm text-on-surface-variant">
          That reading could not be found.
        </p>
        <Link to="/history" className="mt-6 inline-block font-body text-sm text-primary hover:underline">
          Back to history
        </Link>
      </main>
    );
  }

  const reading = readingQuery.data;

  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-24">
      <header className="pt-10 pb-10 text-center">
        <Link to="/history" className="font-utility text-[0.62rem] tracking-[0.25em] uppercase text-on-surface-variant hover:text-primary">
          &larr; history
        </Link>
        <blockquote className="mx-auto mt-5 max-w-2xl">
          <p className="font-display text-2xl italic text-on-surface">&ldquo;{reading.question}&rdquo;</p>
        </blockquote>
        <p className="mt-3 flex items-center justify-center gap-3 font-utility text-[0.6rem] tracking-[0.25em] uppercase text-on-surface-variant">
          <span>{reading.spread_name}</span>
          <span aria-hidden="true">·</span>
          <span>{reading.intent_category}</span>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={() => copySeed(reading.seed)}
            className="inline-flex items-center gap-1 transition-standard hover:text-primary"
            aria-label={`Copy seed ${reading.seed}`}
          >
            seed {String(reading.seed).slice(0, 6)}
            <Copy size={11} aria-hidden="true" />
          </button>
        </p>
      </header>

      {reading.drawn_cards.length > 0 && (
        <CardFan cards={reading.drawn_cards} onAllRevealed={() => setCardsRevealed(true)} />
      )}

      <section aria-label="Interpretation" className="mx-auto max-w-2xl">
        {reading.interpretation_text ? (
          <StreamPane text={reading.interpretation_text} streaming={!cardsRevealed} failed={false} />
        ) : (
          <p className="mt-10 border-l-2 border-outline pl-4 font-body text-sm text-on-surface-variant">
            This reading was never streamed — no interpretation was recorded.
          </p>
        )}
      </section>
    </main>
  );
}
