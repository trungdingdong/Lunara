import { useEffect, useRef, useState } from "react";

export interface DealTiming {
  dealSettleMs: number;
  flipIntervalMs: number;
}

export const DEFAULT_DEAL_TIMING: DealTiming = {
  dealSettleMs: 60,
  flipIntervalMs: 420,
};

export interface DealSequenceState {
  dealt: boolean;
  revealedCount: number;
}

export function useDealSequence(
  cardCount: number,
  timing: DealTiming = DEFAULT_DEAL_TIMING,
): DealSequenceState {
  const [state, setState] = useState<DealSequenceState>({ dealt: false, revealedCount: 0 });

  useEffect(() => {
    const settleTimer = window.setTimeout(() => {
      setState((previous) => ({ ...previous, dealt: true }));
    }, timing.dealSettleMs);
    return () => window.clearTimeout(settleTimer);
  }, [timing.dealSettleMs]);

  useEffect(() => {
    if (!state.dealt || state.revealedCount >= cardCount) return;
    const timer = window.setTimeout(() => {
      setState((previous) => ({ ...previous, revealedCount: previous.revealedCount + 1 }));
    }, timing.flipIntervalMs);
    return () => window.clearTimeout(timer);
  }, [state.dealt, state.revealedCount, cardCount, timing.flipIntervalMs]);

  return state;
}

export function useSingleFire(action: () => void, ready: boolean): void {
  const firedRef = useRef(false);
  const actionRef = useRef<() => void>(() => {});

  useEffect(() => {
    actionRef.current = action;
  }, [action]);

  useEffect(() => {
    if (!ready || firedRef.current) return;
    firedRef.current = true;
    actionRef.current();
  }, [ready]);
}
