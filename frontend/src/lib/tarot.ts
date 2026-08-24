const ROMAN: Record<number, string> = {
  0: "0",
  1: "I",
  2: "II",
  3: "III",
  4: "IV",
  5: "V",
  6: "VI",
  7: "VII",
  8: "VIII",
  9: "IX",
  10: "X",
  11: "XI",
  12: "XII",
  13: "XIII",
  14: "XIV",
  15: "XV",
  16: "XVI",
  17: "XVII",
  18: "XVIII",
  19: "XIX",
  20: "XX",
  21: "XXI",
};

const SUIT_GLYPH: Record<string, string> = {
  wands: "\u{1F702}",
  cups: "\u{1F704}",
  swords: "\u{1F701}",
  pentacles: "\u{1F703}",
};

export function rankLabel(card: { arcana: string; rank: number }): string {
  return card.arcana === "major" ? (ROMAN[card.rank] ?? String(card.rank)) : String(card.rank);
}

export function suitGlyph(suit: string | null | undefined): string {
  return suit ? (SUIT_GLYPH[suit] ?? "") : "\u2736";
}

export interface Section {
  title: string;
  body: string;
}

/** Mirrors the five-section contract in backend/app/llm/prompts.py (PROMPT_VERSION v2-intent). */
export const EXPECTED_SECTION_COUNT = 5;

export function parseSections(text: string): Section[] {
  const sections: Section[] = [];
  const parts = text.split(/^## /m).filter((part) => part.trim().length > 0);
  for (const part of parts) {
    const newline = part.indexOf("\n");
    if (newline === -1) continue;
    sections.push({
      title: part.slice(0, newline).trim(),
      body: part.slice(newline + 1).trim(),
    });
  }
  return sections;
}
