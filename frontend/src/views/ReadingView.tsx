import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import "@/theme/material";
import { api, streamReading } from "@/lib/api";
import { CardFan } from "@/components/CardFan";
import { MoonSteps } from "@/components/MoonSteps";
import { SpreadPicker } from "@/components/SpreadPicker";
import { StreamPane } from "@/components/StreamPane";

type Stage = "ask" | "dealing" | "reading";

export function ReadingView() {
  const [spreadId, setSpreadId] = useState("three-card");
  const [question, setQuestion] = useState("");
  const [stage, setStage] = useState<Stage>("ask");
  const [readingId, setReadingId] = useState<string | null>(null);
  const [cards, setCards] = useState<import("@/lib/api").DrawnCard[]>([]);
  const [interpretation, setInterpretation] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [failed, setFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const spreadsQuery = useQuery({ queryKey: ["spreads"], queryFn: api.getSpreads });

  useEffect(() => () => abortRef.current?.abort(), []);

  const handleAllRevealed = useCallback(() => {
    if (!readingId) return;
    setStage("reading");
    setStreaming(true);
    abortRef.current = new AbortController();
    streamReading(
      readingId,
      (event) => {
        switch (event.kind) {
          case "token":
            setInterpretation((text) => text + event.text);
            break;
          case "done":
            setStreaming(false);
            break;
          case "error":
            setStreaming(false);
            setFailed(true);
            break;
        }
      },
      abortRef.current.signal,
    ).catch(() => {
      setStreaming(false);
      setFailed(true);
    });
  }, [readingId]);

  async function beginReading() {
    setError(null);
    setFailed(false);
    try {
      const reading = await api.createReading(spreadId, question.trim());
      setReadingId(reading.id);
      setCards(reading.drawn_cards);
      setStage("dealing");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong");
    }
  }

  function reset() {
    abortRef.current?.abort();
    setStage("ask");
    setReadingId(null);
    setCards([]);
    setInterpretation("");
    setStreaming(false);
    setFailed(false);
  }

  const canSubmit =
    stage === "ask" && question.trim().length >= 3 && question.trim().length <= 500 && !spreadsQuery.isPending;

  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-24">
      <header className="pt-14 pb-10 text-center">
        <p className="font-utility text-[0.65rem] tracking-[0.4em] text-on-surface-variant uppercase">Lunara</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-on-surface sm:text-5xl">
          What do you seek?
        </h1>
        <div className="mt-6">
          <MoonSteps stage={stage} />
        </div>
      </header>

      {stage === "ask" && (
        <section className="mx-auto max-w-2xl space-y-8">
          <div>
            <md-outlined-text-field
              id="question"
              label="Your question"
              type="textarea"
              rows={3}
              maxlength={500}
              value={question}
              onInput={(event) => setQuestion((event.target as HTMLInputElement).value)}
              placeholder="Love, work, a crossroads, the year ahead..."
              class="w-full"
            ></md-outlined-text-field>
            <p className="mt-2 text-right font-utility text-[0.6rem] text-on-surface-variant/70">
              {question.trim().length}/500
            </p>
          </div>

          <SpreadPicker
            spreads={spreadsQuery.data ?? []}
            selected={spreadId}
            onSelect={setSpreadId}
          />

          {error && (
            <p role="alert" className="border-l-2 border-error pl-4 font-body text-sm text-on-surface-variant">
              {error}
            </p>
          )}

          <div className="block w-full">
            <md-filled-button
              disabled={!canSubmit}
              onClick={beginReading}
              class="w-full"
            >
              Draw the cards
            </md-filled-button>
          </div>
        </section>
      )}

      {stage !== "ask" && readingId && (
        <section aria-label="Your reading">
          <blockquote className="mx-auto mb-12 max-w-2xl text-center">
            <p className="font-display text-xl italic text-on-surface/90">&ldquo;{question}&rdquo;</p>
            <p className="mt-2 font-utility text-[0.6rem] tracking-[0.3em] text-on-surface-variant uppercase">
              {spreadsQuery.data?.find((s) => s.id === spreadId)?.name ?? spreadId}
            </p>
          </blockquote>

          <CardFan cards={cards} onAllRevealed={handleAllRevealed} />

          <div className="mx-auto max-w-2xl">
            <StreamPane text={interpretation} streaming={streaming} failed={failed} />

            {!streaming && !failed && interpretation.length > 0 && (
              <div className="mt-14 block w-full">
                <md-outlined-button onClick={reset} class="w-full">
                  Ask again
                </md-outlined-button>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
