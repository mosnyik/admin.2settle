import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, act } from "@testing-library/react";
import WeeklyVolumeCard from "../dashboard/WeeklyVolumeCard";
import { currentReportingWeek } from "@/helper/weekly-volume";

const { get } = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("axios", () => ({ default: { get } }));
const result = (week: string, totalDollar = "74.86", transactionCount = 2) => ({ data: {
  week, totalDollar, totalNaira: "98683.50", transactionCount, missingRateCount: 0, fallbackDateCount: 0,
} });

describe("weekly volume card", () => {
  beforeEach(() => { get.mockReset(); });
  afterEach(cleanup);

  it("loads the current week and displays both currencies to two decimals", async () => {
    get.mockResolvedValue(result(currentReportingWeek()));
    render(<WeeklyVolumeCard />);
    expect(await screen.findByText("$74.86")).toBeInTheDocument();
    expect(screen.getByText(/98,683\.50/)).toBeInTheDocument();
    expect(screen.getByLabelText("Volume week")).toHaveValue(currentReportingWeek());
  });

  it("ignores a slow old response after the user changes weeks", async () => {
    let resolveFirst!: (value: ReturnType<typeof result>) => void;
    get.mockImplementationOnce(() => new Promise((resolve) => { resolveFirst = resolve; }));
    get.mockResolvedValueOnce(result("2020-W53", "12.34"));
    render(<WeeklyVolumeCard />);
    await waitFor(() => expect(get).toHaveBeenCalledTimes(1));
    fireEvent.change(screen.getByLabelText("Volume week"), { target: { value: "2020-W53" } });
    expect(await screen.findByText("$12.34")).toBeInTheDocument();
    await act(async () => resolveFirst(result(currentReportingWeek(), "999.99")));
    expect(screen.queryByText("$999.99")).not.toBeInTheDocument();
    expect(screen.getByText(/28 Dec 2020/)).toBeInTheDocument();
    expect(get.mock.calls[0][1].signal.aborted).toBe(true);
  });

  it("provides retry after failure instead of showing zero totals", async () => {
    get.mockRejectedValueOnce(new Error("offline"));
    get.mockResolvedValueOnce(result(currentReportingWeek(), "0.00", 0));
    render(<WeeklyVolumeCard />);
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.queryByText("$0.00")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByText("$0.00")).toBeInTheDocument();
  });

  it("shows unavailable when a complete USD total cannot be calculated", async () => {
    const response = result(currentReportingWeek());
    get.mockResolvedValue({ data: { ...response.data, totalDollar: null, missingRateCount: 1, fallbackDateCount: 1 } });
    render(<WeeklyVolumeCard />);
    expect(await screen.findByText("USD unavailable")).toBeInTheDocument();
  });
});
