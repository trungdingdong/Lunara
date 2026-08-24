import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";

import { api, streamReading } from "@/lib/api";
import type { DrawnCard } from "@/lib/api";

export type SessionStage = "ask" | "creating" | "dealing" | "reading" | "failed";

export interface ReadingSessionState {
  stage: SessionStage;
  readingId: string | null;
  cards: DrawnCard[];
  interpretation: string;
  streamFinished: boolean;
}

type SessionAction =
  | { kind: "submit-started" }
  | { kind: "submit-succeeded"; readingId: string; cards: DrawnCard[] }
  | { kind: "submit-failed" }
  | { kind: "reveal-complete" }
  | { kind: "token"; text: string }
  | { kind: "stream-done" }
  | { kind: "stream-failed" }
  | { kind: "reset" };

export const IDLE: ReadingSessionState = {
  stage: "ask",
  readingId: null,
  cards: [],
  interpretation: "",
  streamFinished: false,
};

export function reducer(state: ReadingSessionState, action: SessionAction): ReadingSessionState {
  switch (action.kind) {
    case "submit-started":
      return state.stage === "ask" ? { ...IDLE, stage: "creating" } : state;
    case "submit-succeeded":
      return { ...state, stage: "dealing", readingId: action.readingId, cards: action.cards };
    case "submit-failed":
      return state.stage === "creating" ? { ...state, stage: "ask" } : state;
    case "reveal-complete":
      return state.stage === "dealing" ? { ...state, stage: "reading" } : state;
    case "token":
      if (state.stage !== "reading") return state;
      return { ...state, interpretation: state.interpretation + action.text };
    case "stream-done":
      return { ...state, streamFinished: true };
    case "stream-failed":
      return state.stage === "reading" ? { ...state, stage: "failed", streamFinished: true } : state;
    case "reset":
      return IDLE;
  }
}

const QUESTION_MIN = 3;
const QUESTION_MAX = 500;

export function useReadingSession() {
  const [state, dispatch] = useReducer(reducer, IDLE);
  const controllerRef = useRef<AbortController | null>(null);

  const abortInFlight = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
  }, []);

  useEffect(() => abortInFlight, [abortInFlight]);

  const submit = useCallback(async (spreadId: string, question: string) => {
    dispatch({ kind: "submit-started" });
    try {
      const reading = await api.createReading(spreadId, question);
      dispatch({ kind: "submit-succeeded", readingId: reading.id, cards: reading.drawn_cards });
      return true;
    } catch {
      dispatch({ kind: "submit-failed" });
      return false;
    }
  }, []);

  const beginStreaming = useCallback(() => {
    const controller = new AbortController();
    controllerRef.current = controller;
    void streamReading(
      state.readingId ?? "",
      (event) => {
        if (controller.signal.aborted) return;
        switch (event.kind) {
          case "token":
            dispatch({ kind: "token", text: event.text });
            break;
          case "done":
            dispatch({ kind: "stream-done" });
            break;
          case "error":
            dispatch({ kind: "stream-failed" });
            break;
        }
      },
      controller.signal,
    )
      .catch(() => {
        if (!controller.signal.aborted) dispatch({ kind: "stream-failed" });
      })
      .finally(() => {
        if (controllerRef.current === controller) controllerRef.current = null;
      });
  }, [state.readingId]);

  const reset = useCallback(() => {
    abortInFlight();
    dispatch({ kind: "reset" });
  }, [abortInFlight]);

  const derived = useMemo(
    () => ({
      busy: state.stage === "creating",
      streaming:
        state.readingId !== null && state.stage !== "failed" && state.streamFinished === false,
      failed: state.stage === "failed",
      canAskAgain: state.streamFinished,
    }),
    [state],
  );

  return {
    state,
    derived,
    submit,
    beginStreaming,
    reset,
    limits: { questionMin: QUESTION_MIN, questionMax: QUESTION_MAX },
  };
}
