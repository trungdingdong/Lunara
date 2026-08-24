export type Arcana = "major" | "minor";

export type Suit = "wands" | "cups" | "swords" | "pentacles";

export interface OrientationBlock {
  meanings: string[];
}

export interface Card {
  id: string;
  name: string;
  arcana: Arcana;
  suit: Suit | null;
  rank: number;
  img: string | null;
  keywords: string[];
  upright: OrientationBlock;
  reversed: OrientationBlock;
}

export interface DrawnCard {
  card: Card;
  is_reversed: boolean;
  position: string;
}

export interface Spread {
  id: string;
  name: string;
  positions: { index: number; name: string }[];
}

export interface StoredReading {
  id: string;
  user_id: string | null;
  spread_id: string;
  spread_name: string;
  question: string;
  intent_category: string;
  drawn_cards: DrawnCard[];
  interpretation_text: string | null;
  seed: number;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!response.ok) {
    const detail = await response
      .json()
      .then((body) => body.detail)
      .catch(() => null);
    throw new Error(typeof detail === "string" ? detail : `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  getSpreads: () => request<Spread[]>("/api/spreads"),

  createReading: (spreadId: string, question: string) =>
    request<StoredReading>("/api/readings", {
      method: "POST",
      body: JSON.stringify({ spread_id: spreadId, question }),
    }),
};

export type StreamEvent =
  | { kind: "start"; readingId: string }
  | { kind: "token"; text: string }
  | { kind: "done" }
  | { kind: "error"; detail?: string };

export async function streamReading(
  readingId: string,
  onEvent: (event: StreamEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(`/api/readings/${readingId}/stream`, { signal });
  if (!response.ok || !response.body) {
    throw new Error(`Stream failed (${response.status})`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let boundary = buffer.indexOf("\n\n");
    while (boundary !== -1) {
      const frame = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      dispatchFrame(frame, onEvent);
      boundary = buffer.indexOf("\n\n");
    }
  }
}

function dispatchFrame(frame: string, onEvent: (event: StreamEvent) => void): void {
  let event = "";
  let data = "";
  for (const line of frame.split("\n")) {
    if (line.startsWith("event: ")) event = line.slice(7);
    else if (line.startsWith("data: ")) data += line.slice(6);
  }
  if (!event || !data) return;

  const payload = JSON.parse(data);
  switch (event) {
    case "start":
      onEvent({ kind: "start", readingId: payload.reading_id });
      break;
    case "token":
      onEvent({ kind: "token", text: payload.text });
      break;
    case "done":
      onEvent({ kind: "done" });
      break;
    case "error":
      onEvent({ kind: "error", detail: payload.detail });
      break;
  }
}
