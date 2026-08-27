import { describe, expect, it } from "vitest";

import { ApiError, AuthExpiredError } from "./errors";

describe("ApiError", () => {
  it("carries status and detail", () => {
    const err = new ApiError(422, "bad input", "validation_error");
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("ApiError");
    expect(err.status).toBe(422);
    expect(err.detail).toBe("bad input");
    expect(err.code).toBe("validation_error");
  });

  it("defaults detail and code to null", () => {
    const err = new ApiError(500);
    expect(err.detail).toBeNull();
    expect(err.code).toBeNull();
    expect(err.message).toBe("Request failed (500)");
  });
});

describe("AuthExpiredError", () => {
  it("is throwable", () => {
    expect(() => { throw new AuthExpiredError(); }).toThrow(AuthExpiredError);
  });
});
