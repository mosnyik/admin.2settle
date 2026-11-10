import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import handler from "@/pages/api/total_volume_this_week";
import { weekBounds } from "@/helper/weekly-volume";

const { execute } = vi.hoisted(() => ({ execute: vi.fn() }));
vi.mock("@/lib/db", () => ({ pool: { execute } }));

const request = async (query = {}, method: "GET" | "POST" = "GET") => {
  const { req, res } = createMocks<NextApiRequest, NextApiResponse>({ method, query });
  await handler(req, res);
  return res;
};

describe("weekly volume API", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-10T12:00:00Z"));
    execute.mockReset();
    execute.mockResolvedValue([[{
      totalNaira: "98683.50", totalDollar: "74.86", transactionCount: 2,
      missingRateCount: "0", fallbackDateCount: "0",
    }]]);
  });
  afterEach(() => vi.useRealTimers());

  it("queries a past year's full calendar week and preserves decimal totals", async () => {
    const res = await request({ week: "2020-W53" });
    const bounds = weekBounds("2020-W53");
    expect(execute.mock.calls[0][1]).toEqual([bounds.start, bounds.end]);
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({
      week: "2020-W53", totalNaira: "98683.50", totalDollar: "74.86",
      transactionCount: 2, missingRateCount: 0, fallbackDateCount: 0,
    });
  });
  it("defaults to the current Lagos week", async () => {
    expect((await request())._getJSONData().week).toBe("2026-W46");
  });
  it.each(["2026-W47", "2026-W00", "2026-W54", "2021-W53", ["2026-W45", "2026-W46"]])("rejects invalid or future week %s", async (week) => {
    expect((await request({ week }))._getStatusCode()).toBe(400);
    expect(execute).not.toHaveBeenCalled();
  });
  it("rejects writes", async () => {
    expect((await request({}, "POST"))._getStatusCode()).toBe(405);
    expect(execute).not.toHaveBeenCalled();
  });
  it("keeps USD unavailable when some rates are missing", async () => {
    execute.mockResolvedValue([[{totalNaira: "100.00", totalDollar: null, transactionCount: 1, missingRateCount: 1, fallbackDateCount: 1}]]);
    expect((await request())._getJSONData()).toMatchObject({ totalDollar: null, missingRateCount: 1, fallbackDateCount: 1 });
  });
  it("returns an error instead of a misleading zero when the database fails", async () => {
    execute.mockRejectedValue(new Error("Connection failed"));
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect((await request())._getStatusCode()).toBe(500);
    } finally { log.mockRestore(); }
  });
});
