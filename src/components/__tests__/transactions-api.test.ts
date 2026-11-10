import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import handler from "@/pages/api/get_transactions";

const { query } = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock("@/lib/db", () => ({ pool: { query } }));
async function call(params = {}) {
  const { req, res } = createMocks<NextApiRequest, NextApiResponse>({ method: "GET", query: params });
  await handler(req, res);
  return res;
}
describe("transaction date ordering and type filtering", () => {
  beforeEach(() => {
    query.mockReset();
    query.mockResolvedValueOnce([[]]).mockResolvedValueOnce([[{total: 24}]]);
  });
  it.each(["asc", "desc"])("orders before pagination with a stable tie-breaker (%s)", async (dateOrder) => {
    const res = await call({ dateOrder, page: "2", limit: "10" });
    expect(res._getStatusCode()).toBe(200);
    expect(query.mock.calls[0][0]).toContain(`ORDER BY ps.created_at ${dateOrder.toUpperCase()}, ps.id ${dateOrder.toUpperCase()}`);
    expect(query.mock.calls[0][1]).toEqual([10, 10]);
    expect(res._getJSONData().pagination).toEqual({ currentPage: 2, totalPages: 3, totalItems: 24 });
  });
  it("defaults to newest first", async () => {
    await call();
    expect(query.mock.calls[0][0]).toContain("ORDER BY ps.created_at DESC, ps.id DESC");
  });
  it.each(["gift", "transfer", "request"])("applies %s and status filters to both rows and pagination count", async (type) => {
    await call({ type, status: "confirmed", dateOrder: "asc" });
    expect(query.mock.calls[0][0]).toContain("WHERE ps.status = ? AND ps.type = ?");
    expect(query.mock.calls[0][1]).toEqual(["confirmed", type, 10, 0]);
    expect(query.mock.calls[1][0]).toContain("WHERE ps.status = ? AND ps.type = ?");
    expect(query.mock.calls[1][1]).toEqual(["confirmed", type]);
  });
  it("keeps all transaction types when no type is selected", async () => {
    await call();
    expect(query.mock.calls[0][0]).not.toContain("ps.type = ?");
    expect(query.mock.calls[1][1]).toEqual([]);
  });
  it.each([
    { dateOrder: "asc; DROP TABLE payment_sessions" },
    { dateOrder: ["asc", "desc"] },
    { type: "gift' OR 1=1" },
    { type: ["gift", "transfer"] },
  ])("rejects unsupported sort/filter values without a database query", async (params) => {
    expect((await call(params))._getStatusCode()).toBe(400);
    expect(query).not.toHaveBeenCalled();
  });
});
