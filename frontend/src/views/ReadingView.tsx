import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import "@/theme/material";
import { api } from "@/lib/api";
import { useReadingSession } from "@/lib/readingSession";
import { CardFan } from "@/components/CardFan";
import { MoonSteps } from "@/components/MoonSteps";
import { SpreadPicker } from "@/components/SpreadPicker";
import { StreamPane } from "@/components/StreamPane";
import { useSpreadDraftStore } from "@/stores/spreadDraft";

export function ReadingView() {
  const [question, setQuestion] = useState("");
  const session = useReadingSession();
  const spreadId = useSpreadDraftStore((state) => state.spreadId);
  const setSpreadId = useSpreadDraftStore((state) => state.setSpreadId);

  const spreadsQuery = useQuery({ queryKey: ["spreads"], queryFn: api.getSpreads });
  const { stage, cards, readingId, interpretation } = session.state;
  const { busy, streaming, failed, canAskAgain } = session.derived;

  async function beginReading() {
    await session.submit(spreadId, question.trim());
  }

  function reset() {
    session.reset();
    setQuestion("");
  }

  const trimmed = question.trim();
  const canSubmit =
    stage === "ask" &&
    !busy &&
    trimmed.length >= session.limits.questionMin &&
    trimmed.length <= session.limits.questionMax &&
    !spreadsQuery.isPending;

  const showAskStage = stage === "ask";
  const spreadName =
    spreadsQuery.data?.find((spread) => spread.id === spreadId)?.name ?? spreadId;

  const readingKey = cards.map((drawn) => drawn.card.id).join("-");

  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-24">
      <header className="pt-14 pb-10 text-center">
        <p className="font-utility text-[0.65rem] tracking-[0.4em] uppercase text-on-surface-variant">
          Lunara
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-on-surface sm:text-5xl">
          What do you seek?
        </h1>
        <div className="mt-6">
          <MoonSteps
            stage={stage === "creating" ? "ask" : stage === "failed" ? "reading" : stage}
          />
        </div>
      </header>

      {showAskStage ? (
        <section className="mx-auto max-w-2xl space-y-8">
          <div>
            <md-outlined-text-field
              id="question"
              label="Your question"
              type="textarea"
              rows={3}
              maxlength={session.limits.questionMax}
              value={question}
              onInput={(event) => setQuestion((event.target as HTMLInputElement).value)}
              placeholder="Love, work, a crossroads, the year ahead..."
              class="w-full"
            ></md-outlined-text-field>
            <p className="mt-2 text-right font-utility text-[0.6rem] text-on-surface-variant/70">
              {trimmed.length}/{session.limits.questionMax}
            </p>
          </div>

          <SpreadPicker spreads={spreadsQuery.data ?? []} selected={spreadId} onSelect={setSpreadId} />

          <div className="block w-full">
            <md-filled-button disabled={!canSubmit} onClick={() => void beginReading()} class="w-full">
              Draw the cards
            </md-filled-button>
          </div>
        </section>
      ) : readingId ? (
        <section aria-label="Your reading">
          <blockquote className="mx-auto mb-12 max-w-2xl text-center">
            <p className="font-display text-xl italic text-on-surface">&ldquo;{trimmed}&rdquo;</p>
            <p className="mt-2 font-utility text-[0.6rem] tracking-[0.3em] uppercase text-on-surface-variant">
              {spreadName}
            </p>
          </blockquote>

          <CardFan key={readingKey} cards={cards} onAllRevealed={session.beginStreaming} />

          <div className="mx-auto max-w-2xl">
            <StreamPane text={interpretation} streaming={streaming} failed={failed} />

            {canAskAgain && (
              <div className="mt-14 block w-full">
                <md-outlined-button onClick={reset} class="w-full">
                  Ask again
                </md-outlined-button>
              </div>
            )}
          </div>
        </section>
      ) : null}
    </main>
  );
}
