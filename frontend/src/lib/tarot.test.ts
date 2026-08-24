import { describe, expect, it } from "vitest";

import { parseSections, EXPECTED_SECTION_COUNT, rankLabel } from "./tarot";

describe("parseSections", () => {
  it("splits streamed markdown into titled sections", () => {
    const text = "## Overview\n\nOne.\n\n## Card-by-card\n\nTwo.";

    expect(parseSections(text)).toEqual([
      { title: "Overview", body: "One." },
      { title: "Card-by-card", body: "Two." },
    ]);
  });

  it("returns empty for incomplete section text", () => {
    expect(parseSections("no headers here")).toEqual([]);
  });
});

describe("EXPECTED_SECTION_COUNT", () => {
  it("matches the backend prompt contract", () => {
    expect(EXPECTED_SECTION_COUNT).toBe(5);
  });
});

describe("rankLabel", () => {
  it("renders majors as roman numerals", () => {
    expect(rankLabel({ arcana: "major", rank: 21 })).toBe("XXI");
  });

  it("renders minors as numbers", () => {
    expect(rankLabel({ arcana: "minor", rank: 7 })).toBe("7");
  });
});
