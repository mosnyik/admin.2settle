import { describe, it, expect, vi, beforeEach } from "vitest";
import handler from "@/pages/api/admin_login";
import { createMocks } from "node-mocks-http";

import type { NextApiRequest, NextApiResponse } from "next";

createMocks({
  method: "POST",
  body: {
    phone: "08012345678",
    pin: "1234",
  },
});

// Mock the helper functions
vi.mock("@/helper/user_login", () => ({
  formatPhoneNumber: vi.fn((phone: string) => phone),
  parseSupportNumber: vi.fn(() => ["1234"]),
}));

// Mock db pool
const { mockExecute } = vi.hoisted(() => ({ mockExecute: vi.fn() }));

vi.mock("@/lib/db", () => ({
  pool: {
    execute: mockExecute,
  },
}));

describe("POST /api/admin_login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 405 for non-POST requests", async () => {
    const { req, res } = createMocks({ method: "GET" });
    await handler(
      req as unknown as NextApiRequest,
      res as unknown as NextApiResponse
    );
    expect(res._getStatusCode()).toBe(405);
  });

  it("should return 400 if phone or pin is missing", async () => {
    const { req, res } = createMocks({ method: "POST", body: { phone: "" } });
    await handler(
      req as unknown as NextApiRequest,
      res as unknown as NextApiResponse
    );
    expect(res._getStatusCode()).toBe(400);
  });

  //   it("should return 401 if no user is found", async () => {
  //     mockExecute.mockResolvedValue([[]]);

  //     const { req, res } = createMocks({
  //       method: "POST",
  //       body: { phone: "1234567890", pin: "1234" },
  //     });

  //     await handler(
  //       req as unknown as NextApiRequest,
  //       res as unknown as NextApiResponse
  //     );
  //     expect(res._getStatusCode()).toBe(401);
  //     expect(res._getData()).toContain("Invalid credentials");
  //   });

  //   it("should return 200 and success when pin matches", async () => {
  //     mockExecute.mockResolvedValue([
  //       [
  //         {
  //           support_phoneNumber: "1234567890",
  //           support_id: "SUPPORT1234",
  //           support_pin: "1234",
  //         },
  //       ],
  //     ]);

  //     const { req, res } = createMocks({
  //       method: "POST",
  //       body: { phone: "1234567890", pin: "1234" },
  //     });

  //     await handler(
  //       req as unknown as NextApiRequest,
  //       res as unknown as NextApiResponse
  //     );
  //     expect(res._getStatusCode()).toBe(200);
  //     expect(res._getData()).toContain("Login successful");
  //   });

  //   it("should return 200 and requiresPinSet true when support_pin is null and pin is part of support_id", async () => {
  //     mockExecute.mockResolvedValue([
  //       [
  //         {
  //           support_phoneNumber: "1234567890",
  //           support_id: "SUPPORT1234",
  //           support_pin: null,
  //         },
  //       ],
  //     ]);

  //     const { req, res } = createMocks({
  //       method: "POST",
  //       body: { phone: "1234567890", pin: "1234" },
  //     });

  //     await handler(
  //       req as unknown as NextApiRequest,
  //       res as unknown as NextApiResponse
  //     );
  //     expect(res._getStatusCode()).toBe(200);
  //     expect(JSON.parse(res._getData()).requiresPinSet).toBe(true);
  //   });
});
