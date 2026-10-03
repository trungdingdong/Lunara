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
