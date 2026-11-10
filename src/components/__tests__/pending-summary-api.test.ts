import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import giftHandler from "@/pages/api/get_gift_summary";
import requestHandler from "@/pages/api/get_request_summary";
import { GIFT_SUMMARY_QUERY, REQUEST_SUMMARY_QUERY } from "@/lib/pending-summary-query";

const { execute } = vi.hoisted(() => ({ execute: vi.fn() }));
vi.mock("@/lib/db", () => ({ pool: { execute } }));
const totals = { count: 6, totalNaira: "8065765595.00", totalDollar: "6119695.99", missingRateCount: "0", estimatedRateCount: "6" };
async function call(handler = requestHandler, method: "GET" | "POST" = "GET") {
  const { req, res } = createMocks<NextApiRequest, NextApiResponse>({ method });
  await handler(req, res);
  return res;
}

describe("gift/request summary endpoints", () => {
  beforeEach(() => { execute.mockReset(); });
  it("uses the engine rate for requests and identifies the estimate", async () => {
    execute.mockResolvedValueOnce([[{ current_rate: "1,318" }]]).mockResolvedValueOnce([[totals]]);
    const res = await call();
    expect(execute).toHaveBeenLastCalledWith(REQUEST_SUMMARY_QUERY, ["1318"]);
    expect(res._getJSONData()).toMatchObject({ success: true, count: 6, totalNaira: "8065765595.00", estimatedRateCount: 6, estimateRate: "1318" });
    expect(res.getHeader("Cache-Control")).toBe("no-store");
  });
  it("never substitutes today's rate for a funded gift's saved rate", async () => {
    execute.mockResolvedValueOnce([[{ ...totals, estimatedRateCount: 0 }]]);
    const res = await call(giftHandler);
    expect(execute).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenCalledWith(GIFT_SUMMARY_QUERY, []);
    expect(res._getJSONData().estimateRate).toBeNull();
  });
  it("preserves the naira total when the current rate service fails", async () => {
    execute.mockRejectedValueOnce(new Error("rates unavailable"));
    execute.mockResolvedValueOnce([[{ ...totals, totalDollar: null, missingRateCount: 6, estimatedRateCount: 0 }]]);
    const res = await call();
    expect(execute).toHaveBeenLastCalledWith(REQUEST_SUMMARY_QUERY, [null]);
    expect(res._getJSONData()).toMatchObject({ totalDollar: null, totalNaira: "8065765595.00", missingRateCount: 6, estimateRate: null });
  });
  it.each([giftHandler, requestHandler])("rejects writes before querying", async (handler) => {
    expect((await call(handler, "POST"))._getStatusCode()).toBe(405);
    expect(execute).not.toHaveBeenCalled();
  });
  it("reports database failures rather than returning a zero balance", async () => {
    execute.mockRejectedValueOnce(new Error("offline"));
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    try { expect((await call(giftHandler))._getStatusCode()).toBe(500); }
    finally { log.mockRestore(); }
  });
  it("does not label an empty request total as an estimate", async () => {
    execute.mockResolvedValueOnce([[{ current_rate: "1318" }]]);
    execute.mockResolvedValueOnce([[{ count: 0, totalNaira: "0.00", totalDollar: "0.00", missingRateCount: 0, estimatedRateCount: 0 }]]);
    expect((await call())._getJSONData()).toMatchObject({ count: 0, totalDollar: "0.00", estimateRate: null });
  });
});
