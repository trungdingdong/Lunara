/**
 * Ceremony pick policy — pure reveal-ordering state machine (005).
 * Taps NEVER alter the drawn set; positions map to spread positions.
 * DOM-free so it stays unit-testable under node-env vitest.
 */

export interface CeremonyPickState {
  total: number;
  revealed: number[];
  complete: boolean;
}

/** Reveal one position; double-taps idempotent; completion exact-once. */
export function nextPick(state: CeremonyPickState, index: number): CeremonyPickState {
  if (state.revealed.includes(index)) return state;
  const revealed = [...state.revealed, index];
  return { ...state, revealed, complete: revealed.length >= state.total };
}

/** Remaining picks shown in the fan prompt. */
export function remainingPicks(state: CeremonyPickState): number {
  return Math.max(0, state.total - state.revealed.length);
}

/** Timed shuffle performance window (nominal 8s, 7–9s tolerance). */
export const SHUFFLE_MS = 8000;

export interface ShufflePerformance {
  durationMs: number;
  elapsedMs: number;
  cardsArrived: boolean;
  failed: boolean;
  done: boolean;
  aborted: boolean;
}

/**
 * Advance the performance clock. Finishes only when the window elapsed AND
 * cards arrived; failure aborts (caller unmounts to the error path).
 */
export function nextPerformance(state: Omit<ShufflePerformance, "done" | "aborted">, elapsedMs: number): ShufflePerformance {
  if (state.failed) return { ...state, elapsedMs, done: false, aborted: true };
  const done = elapsedMs >= state.durationMs && state.cardsArrived;
  return { ...state, elapsedMs, done, aborted: false };
}
