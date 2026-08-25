import { useEffect, useRef, useState } from "react";

export interface PointerState {
  /** normalized -1..1 from viewport center */
  x: number;
  y: number;
  /** raw client coords */
  cx: number;
  cy: number;
}

export interface EnvironmentFlags {
  reducedMotion: boolean;
  touch: boolean;
}

type Subscriber = (pointer: PointerState) => void;

const state: PointerState = { x: 0, y: 0, cx: 0, cy: 0 };
const subscribers = new Set<Subscriber>();
let listening = false;
let flags: EnvironmentFlags | null = null;

function computeFlags(): EnvironmentFlags {
  if (flags !== null) return flags;
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches;
  flags = { reducedMotion, touch };
  return flags;
}

export function environmentFlags(): EnvironmentFlags {
  return computeFlags();
}

function ensureListener(): void {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener(
    "pointermove",
    (event) => {
      state.cx = event.clientX;
      state.cy = event.clientY;
      state.x = (event.clientX / window.innerWidth) * 2 - 1;
      state.y = (event.clientY / window.innerHeight) * 2 - 1;
      for (const notify of subscribers) notify(state);
    },
    { passive: true },
  );
}

/** Subscribes to a single shared window pointer listener; delivers via ref, never state. */
export function usePointerTracking(onMove: (pointer: PointerState) => void): void {
  const callbackRef = useRef(onMove);
  useEffect(() => {
    callbackRef.current = onMove;
  }, [onMove]);

  useEffect(() => {
    ensureListener();
    const subscriber: Subscriber = (pointer) => callbackRef.current(pointer);
    subscribers.add(subscriber);
    return () => {
      subscribers.delete(subscriber);
    };
  }, []);
}

export function useEnvironmentFlags(): EnvironmentFlags {
  const [flags] = useState<EnvironmentFlags>(computeFlags);
  return flags;
}
