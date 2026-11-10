import { describe, expect, it } from "vitest";
import { parseEstimateRate } from "../pending-summary";

describe("request estimate rate", () => {
  it("accepts the payment engine's comma-formatted and numeric rates", () => {
    expect(parseEstimateRate("1,318.2500")).toBe("1318.2500");
    expect(parseEstimateRate(1318)).toBe("1318");
  });
  it.each([null, undefined, "", "0", -1, "abc", "123abc", Infinity, "1.12345"])("does not estimate with invalid rate %s", (rate) => {
    expect(parseEstimateRate(rate)).toBeNull();
  });
});
