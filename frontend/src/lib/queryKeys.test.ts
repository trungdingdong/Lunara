import { describe, expect, it } from "vitest";

import { queryKeys } from "./queryKeys";

describe("queryKeys", () => {
  it("produces stable key references", () => {
    expect(queryKeys.readings.list(10, 0)).toEqual(["readings", 10, 0]);
    expect(queryKeys.readings.detail("r-1")).toEqual(["reading", "r-1"]);
    expect(queryKeys.spreads.all).toEqual(["spreads"]);
  });

  it("list keys differ by params", () => {
    expect(queryKeys.readings.list(10, 0)).not.toEqual(queryKeys.readings.list(20, 0));
  });
});
