import { readSseFrames } from "@/lib/sse";
import { ApiError } from "@/lib/errors";
import { authAwareFetch, getAccessToken } from "@/lib/authClient";

import type { components } from "@/types/api";

type Schemas = components["schemas"];

export type Arcana = Schemas["Arcana"];
export type Suit = Schemas["Suit"];
export type IntentCategory = Schemas["IntentCategory"];
export type Card = Schemas["Card"];
export type DrawnCard = Schemas["DrawnCard"];
export type Spread = Schemas["Spread"];
export type StoredReading = Schemas["StoredReading"];

const API_PREFIX = "/api";
const CARDS_ASSET_PREFIX = "/cards/";

export { CARDS_ASSET_PREFIX };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await authAwareFetch(path, init);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = typeof body?.detail === "string" ? body.detail : null;
    const code = typeof body?.code === "string" ? body.code : null;
    throw new ApiError(response.status, detail, code);
  }
  return response.json() as Promise<T>;
}

function jsonRequest<T>(path: string, method: string, body?: unknown): Promise<T> {
  return request<T>(`${API_PREFIX}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

export const api = {
  getSpreads: () => request<Spread[]>(`${API_PREFIX}/spreads`),

  createReading: (spreadId: string, question: string) =>
    jsonRequest<StoredReading>("/readings", "POST", { spread_id: spreadId, question }),

  getReadings: (limit = 24, offset = 0) =>
    request<StoredReading[]>(`${API_PREFIX}/readings?limit=${limit}&offset=${offset}`),

  getReading: (id: string) => request<StoredReading>(`${API_PREFIX}/readings/${id}`),
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
  const headers: Record<string, string> = {};
  const token = getAccessToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${API_PREFIX}/readings/${readingId}/stream`, { signal, headers });
  if (!response.ok || !response.body) {
    throw new ApiError(response.status, `Stream failed (${response.status})`);
  }

  await readSseFrames(response.body, ({ event, data }) => {
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(data) as Record<string, unknown>;
    } catch {
      return;
    }
    switch (event) {
      case "start":
        onEvent({ kind: "start", readingId: String(payload.reading_id ?? "") });
        break;
      case "token":
        if (typeof payload.text === "string") onEvent({ kind: "token", text: payload.text });
        break;
      case "done":
        onEvent({ kind: "done" });
        break;
      case "error":
        onEvent({ kind: "error", detail: String(payload.detail ?? "") });
        break;
    }
  });
}
