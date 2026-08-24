import { describe, expect, it } from "vitest";

import { readSseFrames } from "./sse";

function streamOf(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
}

async function collect(chunks: string[]): Promise<{ event: string; data: string }[]> {
  const frames: { event: string; data: string }[] = [];
  await readSseFrames(streamOf(chunks), (frame) => frames.push(frame));
  return frames;
}

describe("readSseFrames", () => {
  it("parses single-line frames", async () => {
    const frames = await collect(['event: token\ndata: {"text":"hi"}\n\n']);

    expect(frames).toEqual([{ event: "token", data: '{"text":"hi"}' }]);
  });

  it("handles split chunk boundaries mid-frame", async () => {
    const frames = await collect([
      'event: to',
      'ken\ndata: {"text":"sp',
      'lit"}\n\nevent: done\ndata: {}\n\n',
    ]);

    expect(frames).toEqual([
      { event: "token", data: '{"text":"split"}' },
      { event: "done", data: "{}" },
    ]);
  });

  it("joins multi-line data with newlines", async () => {
    const frames = await collect(["event: log\ndata: line one\ndata: line two\n\n"]);

    expect(frames).toEqual([{ event: "log", data: "line one\nline two" }]);
  });

  it("passes malformed json frames through for the consumer to judge", async () => {
    const frames = await collect([
      'event: token\ndata: not-json\n\nevent: done\ndata: {}\n\n',
    ]);

    expect(frames).toEqual([
      { event: "token", data: "not-json" },
      { event: "done", data: "{}" },
    ]);
  });
});
