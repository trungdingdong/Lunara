import { afterEach, describe, expect, it, vi } from "vitest";

import { api, streamReading } from "./api";

const sseBody = new ReadableStream<Uint8Array>({
  start(controller) {
    controller.close();
  },
});

function fakeFetch(status = 200, body: unknown = {}): ReturnType<typeof vi.fn> {
  return vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("api transport", () => {
  it("sends JSON content-type on POST bodies", async () => {
    const fetchMock = fakeFetch(201);
    vi.stubGlobal("fetch", fetchMock);

    await api.createReading("three-card", "test question");

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe("POST");
    const headers = new Headers(init.headers);
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(init.body).toBe(
      JSON.stringify({ spread_id: "three-card", question: "test question" }),
    );
  });

  it("surfaces backend detail strings as errors", async () => {
    vi.stubGlobal("fetch", fakeFetch(422, { detail: "Input should be a valid dictionary" }));

    await expect(api.createReading("three-card", "x")).rejects.toThrow(
      "Input should be a valid dictionary",
    );
  });

  it("streams without requiring a content-type header", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(sseBody, { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await streamReading("r-1", () => {});

    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toBe("/api/readings/r-1/stream");
  });
});
