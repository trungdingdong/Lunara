import { describe, expect, it } from "vitest";

import { DEFAULT_DEAL_TIMING } from "./dealSequence";

describe("DEFAULT_DEAL_TIMING", () => {
  it("has sensible defaults", () => {
    expect(DEFAULT_DEAL_TIMING.dealSettleMs).toBeGreaterThan(0);
    expect(DEFAULT_DEAL_TIMING.flipIntervalMs).toBeGreaterThan(0);
    expect(DEFAULT_DEAL_TIMING.flipIntervalMs).toBeGreaterThan(DEFAULT_DEAL_TIMING.dealSettleMs);
  });
});
