import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import handler from "@/pages/api/total_volume_this_month";
import { monthBounds } from "@/helper/monthly-volume";

const { execute } = vi.hoisted(() => ({ execute: vi.fn() }));
vi.mock("@/lib/db", () => ({ pool: { execute } }));

const request = async (query = {}, method: "GET" | "POST" = "GET") => {
  const { req, res } = createMocks<NextApiRequest, NextApiResponse>({ method, query });
  await handler(req, res);
  return res;
};

describe("monthly volume API", () => {
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

  it("queries a past year's full calendar month and preserves decimal totals", async () => {
    const res = await request({ month: "2024-02" });
    const bounds = monthBounds("2024-02");
    expect(execute.mock.calls[0][1]).toEqual([bounds.start, bounds.end]);
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({
      month: "2024-02", totalNaira: "98683.50", totalDollar: "74.86",
      transactionCount: 2, missingRateCount: 0, fallbackDateCount: 0,
    });
  });
  it("defaults to the current Lagos month", async () => {
    expect((await request())._getJSONData().month).toBe("2026-11");
  });
  it.each(["2026-12", "2026-00", "2026-13", "2026-1", ["2026-10", "2026-11"]])("rejects invalid or future month %s", async (month) => {
    expect((await request({ month }))._getStatusCode()).toBe(400);
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
