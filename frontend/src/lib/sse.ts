export interface SseFrame {
  event: string;
  data: string;
}

export const CARDS_ASSET_PREFIX = "/cards/";

export async function readSseFrames(
  body: ReadableStream<Uint8Array>,
  onFrame: (frame: SseFrame) => void,
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let boundary = buffer.indexOf("\n\n");
    while (boundary !== -1) {
      const rawFrame = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      const frame = parseFrame(rawFrame);
      if (frame !== null) onFrame(frame);
      boundary = buffer.indexOf("\n\n");
    }
  }
}

function parseFrame(raw: string): SseFrame | null {
  let event = "";
  const dataLines: string[] = [];
  for (const line of raw.split("\n")) {
    if (line.startsWith("event: ")) event = line.slice(7);
    else if (line.startsWith("data: ")) dataLines.push(line.slice(6));
    else if (line === "data:") dataLines.push("");
  }
  if (!event || dataLines.length === 0) return null;
  return { event, data: dataLines.join("\n") };
}
