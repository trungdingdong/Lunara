import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { ROUTES } from "@/routes";
import LandingView from "@/views/LandingView";

/**
 * Characterization tests (T003): lock the landing page's hero behavior.
 * The backdrop itself changed (basin → galaxy); hero wiring must not.
 */
describe("LandingView characterization", () => {
  it("is the default export (route element for GET /)", () => {
    expect(typeof LandingView).toBe("function");
    expect(ROUTES.HOME).toBe("/");
    expect(ROUTES.READING).toBe("/reading");
  });

  it("renders the galaxy backdrop instead of the liquid basin (US1/T006)", async () => {
    const view = await import("@/views/LandingView");
    expect("BASIN_FALLBACK_CLASS" in view).toBe(false);
    expect("BasinFallback" in view).toBe(false);
    const galaxy = await import("@/components/landing/GalaxyBackdrop");
    expect(typeof galaxy.default).toBe("function");
  });

  it("keeps hero above backdrop with contrast scrim (US2/T012)", () => {
    const source = readFileSync(
      resolve(dirname(fileURLToPath(import.meta.url)), "LandingView.tsx"),
      "utf8",
    );
    expect(source).toContain("relative z-10");
    expect(source).toContain("landing-scrim");
    expect(source).toContain("<GalaxyBackdrop");
    expect(source).not.toContain("LiquidBasin");
  });
});
