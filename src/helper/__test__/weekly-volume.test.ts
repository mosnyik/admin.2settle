import { describe, expect, it } from "vitest";
import { currentReportingWeek, weekBounds, weekLabel } from "../weekly-volume";

describe("weekly reporting dates", () => {
  it("uses Monday midnight in Lagos, even while UTC is still Sunday", () => {
    expect(currentReportingWeek(new Date("2026-11-08T22:59:59Z"))).toBe("2026-W45");
    expect(currentReportingWeek(new Date("2026-11-08T23:00:00Z"))).toBe("2026-W46");
    const bounds = weekBounds("2026-W46");
    expect(new Date(bounds.start * 1000).toISOString()).toBe("2026-11-08T23:00:00.000Z");
    expect(new Date(bounds.end * 1000).toISOString()).toBe("2026-11-15T23:00:00.000Z");
    expect(bounds.end - bounds.start).toBe(7 * 86400);
  });
  it("keeps January dates belonging to the previous ISO week-year together", () => {
    expect(currentReportingWeek(new Date("2021-01-01T12:00:00Z"))).toBe("2020-W53");
    expect(weekLabel("2020-W53")).toBe("28 Dec 2020 – 3 Jan 2021");
    expect(new Date(weekBounds("2020-W53").end * 1000).toISOString()).toBe("2021-01-03T23:00:00.000Z");
  });
  it("handles December dates belonging to next year's first week", () => {
    expect(currentReportingWeek(new Date("2025-12-29T12:00:00Z"))).toBe("2026-W01");
    expect(weekLabel("2026-W01")).toBe("29 Dec 2025 – 4 Jan 2026");
  });
  it("handles leap-day and month boundaries", () => {
    expect(weekLabel("2024-W09")).toBe("26 Feb 2024 – 3 Mar 2024");
    expect(currentReportingWeek(new Date("2024-02-29T12:00:00Z"))).toBe("2024-W09");
  });
  it.each(["2021-W53", "2026-W54", "2026-W00", "2026-W1", "2026-11", "invalid", "0000-W01"])("rejects invalid week %s", (week) => {
    expect(() => weekBounds(week)).toThrow();
  });
});
