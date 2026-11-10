import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import TransactionDashboard from "../TransactionDashboard";

const { get, router } = vi.hoisted(() => ({ get: vi.fn(), router: { push: vi.fn() } }));
vi.mock("axios", () => ({ default: { get, isAxiosError: () => false } }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("../dashboard/summaryCard", () => ({ default: () => null }));
vi.mock("../SearchTransaction", () => ({ default: () => null }));

const transactions = Array.from({length: 12}, (_, i) => ({
  transac_id: `TX${String(i + 1).padStart(2, "0")}`,
  Date: `2026-11-${String(i + 1).padStart(2, "0")}T12:00:00Z`,
  status: i % 2 ? "pending" : "settled",
  mode_of_payment: ["gift", "transfer", "request"][i % 3],
}));
type Params = { page: number; limit: number; dateOrder: string; type?: string };
const response = ({ page, limit, dateOrder, type }: Params) => {
  const rows = transactions.filter((row) => !type || row.mode_of_payment === type);
  if (dateOrder === "desc") rows.reverse();
  return { data: {
    transactions: rows.slice((page - 1) * limit, page * limit),
    pagination: { currentPage: page, totalPages: Math.ceil(rows.length / limit), totalItems: rows.length },
  } };
};
const displayedIds = () => screen.getAllByRole("row").slice(1).map((row) => row.querySelectorAll("td")[1]?.textContent);
const lastParams = () => get.mock.calls.at(-1)![1].params;

describe("dashboard transaction controls", () => {
  beforeEach(() => {
    get.mockReset();
    get.mockImplementation(async (_url, {params}) => response(params));
    localStorage.setItem("userLoggedIn", "true");
  });
  afterEach(() => { cleanup(); localStorage.clear(); });

  it("toggles ascending/descending, preserves date order across statuses and pages, and resets page", async () => {
    render(<TransactionDashboard />);
    await screen.findByText("TX12");
    expect(displayedIds()).toEqual(transactions.slice(2).reverse().map((r) => r.transac_id));
    const date = screen.getByRole("button", { name: "Date, newest first. Sort oldest first" });
    expect(date).toHaveClass("cursor-pointer");
    expect(date.closest("th")).toHaveAttribute("aria-sort", "descending");
    fireEvent.click(date);
    await screen.findByText("TX01");
    expect(displayedIds()).toEqual(transactions.slice(0, 10).map((r) => r.transac_id));
    expect(screen.getByRole("button", { name: "Date, oldest first. Sort newest first" }).closest("th")).toHaveAttribute("aria-sort", "ascending");
    fireEvent.click(screen.getByLabelText("Go to next page"));
    await screen.findByText("TX12");
    expect(lastParams()).toMatchObject({ page: 2, dateOrder: "asc" });
    expect(displayedIds()).toEqual(["TX11", "TX12"]);
    fireEvent.click(screen.getByRole("button", { name: "Date, oldest first. Sort newest first" }));
    await screen.findByText("TX03");
    expect(lastParams()).toMatchObject({ page: 1, dateOrder: "desc" });
    expect(displayedIds()[0]).toBe("TX12");
  });

  it("filters types across pages, resets to page one and retains the date direction", async () => {
    render(<TransactionDashboard />);
    await screen.findByText("TX12");
    fireEvent.click(screen.getByLabelText("Go to next page"));
    await screen.findByText("TX01");
    const type = screen.getByRole("combobox", { name: "Filter by transaction type" });
    expect(type).toHaveClass("cursor-pointer");
    for (const value of ["gift", "transfer", "request"]) {
      fireEvent.change(type, { target: { value } });
      await waitFor(() => expect(lastParams()).toMatchObject({ type: value, page: 1, dateOrder: "desc" }));
      await waitFor(() => expect(displayedIds()).toEqual(transactions.filter((r) => r.mode_of_payment === value).reverse().map((r) => r.transac_id)));
    }
    fireEvent.click(screen.getByRole("button", { name: "Date, newest first. Sort oldest first" }));
    await waitFor(() => expect(lastParams()).toMatchObject({ type: "request", dateOrder: "asc", page: 1 }));
    await waitFor(() => expect(displayedIds()).toEqual(["TX03", "TX06", "TX09", "TX12"]));
    fireEvent.change(type, { target: { value: "all" } });
    await screen.findByText("TX01");
    expect(lastParams().type).toBeUndefined();
    expect(lastParams().dateOrder).toBe("asc");
  });

  it("ignores a stale response after the selected type changes", async () => {
    let resolveFirst!: (value: ReturnType<typeof response>) => void;
    get.mockImplementationOnce(() => new Promise((resolve) => { resolveFirst = resolve; }));
    render(<TransactionDashboard />);
    await waitFor(() => expect(get).toHaveBeenCalledTimes(1));
    fireEvent.change(screen.getByRole("combobox", { name: "Filter by transaction type" }), { target: { value: "gift" } });
    await screen.findByText("TX10");
    await act(async () => resolveFirst(response({ page: 1, limit: 10, dateOrder: "desc" })));
    expect(displayedIds()).toEqual(["TX10", "TX07", "TX04", "TX01"]);
    expect(get.mock.calls[0][1].signal.aborted).toBe(true);
  });
});
