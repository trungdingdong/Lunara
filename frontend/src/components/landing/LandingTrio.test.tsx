import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(HERE, "../..");
const VIEW = readFileSync(join(SRC, "views/LandingView.tsx"), "utf8");
const CSS = readFileSync(join(SRC, "index.css"), "utf8");

/**
 * T003: characterization — hero behavior that must NOT change.
 * (Trio interaction behavior is covered by T005/T006, not here.)
 */
describe("LandingTrio characterization", () => {
  it("keeps CTA text, target, and hero order", () => {
    expect(VIEW).toContain("Begin your reading");
    expect(VIEW).toContain('navigate("/reading")');
    const title = VIEW.indexOf("LUNARA");
    const cards = VIEW.indexOf("max-w-md grid-cols-3");
    const cta = VIEW.indexOf("Begin your reading");
    expect(title).toBeGreaterThan(-1);
    expect(cards).toBeGreaterThan(title);
    expect(cta).toBeGreaterThan(cards);
  });

  it("renders a three-card trio", () => {
    expect(VIEW.match(/<BackCard/g)).toHaveLength(3);
  });
});

/** T005 [US1]: whole-unit flip, never a solo-face rotation. */
describe("LandingTrio flip contract", () => {
  it("rotates the card-inner unit on hover AND focus, not an isolated face", () => {
    expect(VIEW).not.toMatch(/card-face[^>]*rotateY|rotateY[^>]*card-face/);
    expect(VIEW).toMatch(/card-inner[^"]*group-hover:\[transform:rotateY\(180deg\)\]/);
    expect(VIEW).toMatch(/card-inner[^"]*group-focus-visible:\[transform:rotateY\(180deg\)\]/);
  });

  it("keeps tilt on the outer scene wrapper (no transform collision)", () => {
    expect(VIEW).toContain("card-scene");
    expect(VIEW).toContain("perspective(900px)");
  });
});

/** T006 [US1]: flanker highlight/lift + motion safety. */
describe("LandingTrio flankers and motion safety", () => {
  it("flankers lift and glow without rotating or changing faces", () => {
    expect(VIEW).toMatch(/group-hover:-translate-y-1/);
    expect(VIEW).toMatch(/group-focus-visible:-translate-y-1/);
    // rotateY appears exactly twice: the center unit's hover + focus triggers
    const spins = VIEW.match(/rotateY\(180deg\)/g) ?? [];
    expect(spins).toHaveLength(2);
    for (const line of VIEW.split("\n")) {
      if (line.includes("rotateY(180deg)")) expect(line).toContain("card-inner");
    }
  });

  it("flip timing is sub-second, transform-only, and reduced-motion guarded", () => {
    expect(CSS).toMatch(/\.trio-flip[^}]*0\.7s/);
    expect(CSS).toContain("prefers-reduced-motion");
    const guard = CSS.slice(CSS.indexOf("prefers-reduced-motion: reduce"));
    expect(guard).toContain("trio-flip");
  });
});

/** T010 [US2]: every font class resolves to the allowlist in its role. */
describe("Type-role audit", () => {
  const ALLOW = new Set(["font-display", "font-body", "font-utility"]);
  const WEIGHTS = new Set([
    "font-thin", "font-extralight", "font-light", "font-normal",
    "font-medium", "font-semibold", "font-bold", "font-extrabold", "font-black",
  ]);

  function tsxFiles(dir: string): string[] {
    const out: string[] = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) out.push(...tsxFiles(full));
      else if (/\.tsx$/.test(entry.name)) out.push(full);
    }
    return out;
  }

  it("uses only allowlisted families (weights excluded)", () => {
    const offenders: string[] = [];
    for (const file of tsxFiles(join(SRC, "views")).concat(tsxFiles(join(SRC, "components")))) {
      const source = readFileSync(file, "utf8");
      for (const match of source.matchAll(/\bfont-[a-z-]+/g)) {
        const token = match[0];
        if (WEIGHTS.has(token) || ALLOW.has(token)) continue;
        offenders.push(`${file.split("src")[1]}: ${token}`);
      }
      for (const match of source.matchAll(/fontFamily:\s*"([^"]+)"/g)) {
        if (!/^var\(--font-(display|body|utility)\)$/.test(match[1])) {
          offenders.push(`${file.split("src")[1]}: fontFamily ${match[1]}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
