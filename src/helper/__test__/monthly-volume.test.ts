import { describe, expect, it } from "vitest";
import { currentReportingMonth, monthBounds, monthLabel } from "../monthly-volume";

describe("monthly reporting dates", () => {
  it("uses Lagos month even before UTC midnight", () => {
    expect(currentReportingMonth(new Date("2026-10-31T23:30:00Z"))).toBe("2026-11");
  });
  it("handles leap years and exclusive month-end boundaries", () => {
    const { start, end } = monthBounds("2024-02");
    expect(new Date(start * 1000).toISOString()).toBe("2024-01-31T23:00:00.000Z");
    expect(new Date(end * 1000).toISOString()).toBe("2024-02-29T23:00:00.000Z");
    expect((end - start) / 86400).toBe(29);
  });
  it("handles December rollover and past years", () => {
    expect(new Date(monthBounds("2023-12").end * 1000).toISOString()).toBe("2023-12-31T23:00:00.000Z");
    expect(monthLabel("2023-12")).toBe("December 2023");
  });
  it.each(["2026-00", "2026-13", "2026-1", "invalid", "2026-02-01", "0000-01"])("rejects malformed month %s", (month) => {
    expect(() => monthBounds(month)).toThrow();
  });
});
