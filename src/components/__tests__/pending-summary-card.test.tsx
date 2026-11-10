import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import PendingSummaryCard from "../dashboard/PendingSummaryCard";

const { get } = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("axios", () => ({ default: { get } }));
const data = { count: 6, totalNaira: "8065765595.00", totalDollar: "6119695.99", missingRateCount: 0, estimatedRateCount: 6, estimateRate: "1318" };

describe("pending summary cards", () => {
  beforeEach(() => { get.mockReset(); });
  afterEach(cleanup);
  it("labels a request estimate and formats large currency totals", async () => {
    get.mockResolvedValue({ data });
    render(<PendingSummaryCard kind="request" />);
    expect(await screen.findByText("≈ $6,119,695.99")).toBeInTheDocument();
    expect(screen.getByText(/8,065,765,595\.00/)).toBeInTheDocument();
    expect(screen.getByText("6 requests")).toBeInTheDocument();
  });
  it("shows unavailable instead of zero when a conversion rate is missing", async () => {
    get.mockResolvedValue({ data: { ...data, totalDollar: null, missingRateCount: 6, estimatedRateCount: 0, estimateRate: null } });
    render(<PendingSummaryCard kind="request" />);
    expect(await screen.findByText("USD unavailable")).toBeInTheDocument();
    expect(screen.queryByText("$0.00")).not.toBeInTheDocument();
    expect(screen.getByText(/8,065,765,595\.00/)).toBeInTheDocument();
  });
  it("shows a gift's saved-rate total without an estimate label", async () => {
    get.mockResolvedValue({ data: { ...data, count: 1, totalDollar: "2.50", estimatedRateCount: 0, estimateRate: null } });
    render(<PendingSummaryCard kind="gift" />);
    expect(await screen.findByText("$2.50")).toBeInTheDocument();
    expect(screen.getByText("1 gift")).toBeInTheDocument();
    expect(screen.queryByText(/USD estimate:/)).not.toBeInTheDocument();
  });
  it("offers retry after a fetch failure without claiming a zero total", async () => {
    get.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce({ data });
    render(<PendingSummaryCard kind="request" />);
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.queryByText("$0.00")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByText("≈ $6,119,695.99")).toBeInTheDocument();
  });
});
