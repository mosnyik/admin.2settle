"use client";

import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import SummaryCard from "./dashboard/summaryCard";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import filterByGiftStatus from "@/helper/filterByGiftStatus";
import { filterBySettledDate } from "@/helper/filterByTrxDate";
import searchTransaction from "@/helper/searchTrx";
import { TransactionData } from "@/types/general-types";
import { Eye, EyeOff, Lock } from "lucide-react";
import SearchTransaction from "./SearchTransaction";
import TransactionsTable from "./transactions/TransactionsTable";

export default function TransactionDashboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [phone, setPhone] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState<
    TransactionData[]
  >([]);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [transactionType, setTransactionType] = useState("all");
  const [error, setError] = useState<string | null>(null);

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const router = useRouter();

  const [showPin, setShowPin] = useState(false);
  const [pinsMatch, setPinsMatch] = useState(true);
  const [sortDesc, setSortDesc] = useState(false);
  const [dateSort, setDateSort] = useState<"asc" | "desc">("desc");
  const [isDateSortActive, setIsDateSortActive] = useState(true);
  // Handle errors
  const handleError = useCallback((error: {
    response?: {
      status: number;
      data: { message: string };
    };
    request?: XMLHttpRequest;
    message: string;
  }) => {
    if (error.response) {
      setError(
        `Server error: ${error.response.status} - ${
          error.response.data?.message || "No additional details"
        }`
      );
    } else if (error.request) {
      setError("Network error - please check your connection");
    } else {
      setError("Request configuration error");
    }
  }, []);

  // Fetch sorted pages; abort old requests when filters or ordering change.
  const fetchTransactions = useCallback(async (
    page: number, limit: number, status: string | null, signal: AbortSignal
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axios.get<{
        transactions: TransactionData[];
        pagination: { currentPage: number; totalPages: number; totalItems: number };
      }>("/api/get_transactions", {
        params: { page, limit, status: status || undefined, dateOrder: dateSort, type: transactionType === "all" ? undefined : transactionType },
        signal,
      });
      if (signal.aborted) return;
      setFilteredTransactions(data.transactions);
      setTotalPages(data.pagination.totalPages);
      setIsDateSortActive(true);
    } catch (error) {
      if (signal.aborted) return;
      if (axios.isAxiosError(error)) handleError(error);
      else setError("An unexpected error occurred");
    } finally {
      if (!signal.aborted) setIsLoading(false);
    }
  }, [dateSort, transactionType, handleError]);

  useEffect(() => {
    const loggedIn = localStorage.getItem("userLoggedIn") === "true";
    setIsLoggedIn(loggedIn);
    if (!loggedIn) router.push("/admin-login");
    else setPhone(localStorage.getItem("phone") || "");
  }, [router]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const controller = new AbortController();
    fetchTransactions(currentPage, itemsPerPage, statusFilter, controller.signal);
    return () => controller.abort();
  }, [isLoggedIn, currentPage, itemsPerPage, statusFilter, fetchTransactions, refreshKey]);

  // modify pin change
  const handlePinChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const storedPhone = localStorage.getItem("phone");
    if (newPin !== confirmPin) {
      setError("PINs do not match. Please try again.");
      setIsLoading(false);
      return;
    }

    try {
      if (storedPhone !== "") {
        const response = await axios.post("/api/set_pin", {
          phone: storedPhone,
          pin: newPin,
        });

        if (response.status === 200) {
          setNewPin("");
          setConfirmPin("");
          router.push("/transaction-dashboard");
        }
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(
          err.response.data.message || "Failed to set PIN. Please try again."
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // log user out
  const handleLogout = () => {
    localStorage.removeItem("phone");
    localStorage.removeItem("userLoggedIn");
    setIsLoggedIn(false);
    router.push("/admin-login");
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    const ellipsis = <PaginationEllipsis />;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => setCurrentPage(i)}
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => setCurrentPage(1)}
            isActive={currentPage === 1}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (currentPage > 3) {
        items.push(
          <PaginationItem key="start-ellipsis">{ellipsis}</PaginationItem>
        );
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => setCurrentPage(i)}
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (currentPage < totalPages - 2) {
        items.push(
          <PaginationItem key="end-ellipsis">{ellipsis}</PaginationItem>
        );
      }

      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => setCurrentPage(totalPages)}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  if (!isLoggedIn) {
    return null;
  }

  // sort transactions
  function toggleSorted() {
    setSortDesc(!sortDesc);
  }

  const filterByDate = (): void => {
    setCurrentPage(1);
    setIsDateSortActive(true);
    if (!isDateSortActive && dateSort === "asc") {
      // Re-fetch if another column changed the visible order but the requested
      // date direction is already ascending.
      triggerRefresh();
    } else {
      setDateSort(isDateSortActive && dateSort === "asc" ? "desc" : "asc");
    }
  };
  const filterBySettled = (): void => {
    toggleSorted();
    const sortByDate = filterBySettledDate([...filteredTransactions], sortDesc);
    setFilteredTransactions(sortByDate);
    setIsDateSortActive(false);
  };
  const filterByGiftRequestStatus = (): void => {
    toggleSorted();

    const sortedByGift = filterByGiftStatus([...filteredTransactions], sortDesc);
    setFilteredTransactions(sortedByGift);
    setIsDateSortActive(false);
  };

  return (
    <div className="p-6 space-y-6 w-full bg-gray-100 text-sm">
      {/* render navbar */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-black">
          2Settle Transaction Dashboard
        </h1>
        <div className="space-x-2 space-y-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-black">
                Change PIN
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-center text-primary">
                  Change PIN
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handlePinChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPin">New PIN</Label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      size={18}
                    />
                    <Input
                      id="newPin"
                      type={showPin ? "text" : "password"}
                      value={newPin}
                      onChange={(e) => {
                        setNewPin(e.target.value);
                        setPinsMatch(e.target.value === confirmPin);
                      }}
                      className="pl-10 pr-10"
                      required
                      maxLength={6}
                      pattern="\d{6}"
                      title="Please enter a 6-digit PIN"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPin(!showPin)}
                    >
                      {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                      <span className="sr-only">
                        {showPin ? "Hide PIN" : "Show PIN"}
                      </span>
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPin">Confirm New PIN</Label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      size={18}
                    />
                    <Input
                      id="confirmPin"
                      type={showPin ? "text" : "password"}
                      value={confirmPin}
                      onChange={(e) => {
                        setConfirmPin(e.target.value);
                        setPinsMatch(e.target.value === newPin);
                      }}
                      className="pl-10 pr-10"
                      required
                      maxLength={6}
                      pattern="\d{6}"
                      title="Please enter a 6-digit PIN"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPin(!showPin)}
                    >
                      {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                      <span className="sr-only">
                        {showPin ? "Hide PIN" : "Show PIN"}
                      </span>
                    </Button>
                  </div>
                </div>
                {confirmPin !== "" && !pinsMatch && (
                  <p className="text-red-500 text-sm mt-1">PINs do not match</p>
                )}
                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-lg transition-all duration-300 ease-in-out hover:bg-blue-700 disabled:opacity-50"
                  disabled={isLoading || !pinsMatch}
                >
                  {isLoading ? "Changing PIN..." : "Change PIN"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="destructive" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
      {/* Display summary card */}
      <SummaryCard key={refreshKey} handleError={handleError} />

      <div className="bg-white rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-black">Transaction Data</h2>
          <SearchTransaction
            handleBlur={async (
              term: string
            ): Promise<TransactionData | null> => {
              const result =
                (await searchTransaction(filteredTransactions, term)) ?? {};
              const resultList = [];
              resultList.push(result);
              setFilteredTransactions(resultList);
              return result;
            }}
          />

          <Select
            onValueChange={(value) => {
              setStatusFilter(value === "all" ? null : value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[180px] text-black">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirming">Confirming</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="settling">Settling</SelectItem>
              <SelectItem value="settled">Settled</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="settlement_reversed">Settlement Reversed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* display transactions table */}
        <div className="border rounded-lg overflow-x-auto">
          {error && (
            <div className="mb-3 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 flex justify-between items-center rounded">
              <span>⚠️ {error}</span>
              <button onClick={() => setError(null)} className="ml-4 text-red-500 hover:text-red-700 font-bold">✕</button>
            </div>
          )}
          <TransactionsTable
            isLoading={isLoading}
            filteredTransactions={filteredTransactions}
            setTransactions={setFilteredTransactions}
            triggerRefresh={triggerRefresh}
            transactionType={transactionType}
            onTransactionTypeChange={(type) => {
              setTransactionType(type);
              setCurrentPage(1);
            }}
            filterByDate={filterByDate}
            dateSort={isDateSortActive ? dateSort : null}
            filterBySettled={filterBySettled}
            filterByGiftRequestStatus={filterByGiftRequestStatus}
            onError={(msg) => setError(msg)}
          />
        </div>
        {/* pagination render */}
        <div className="mt-4">
          <Pagination>
            <PaginationContent className="flex flex-wrap justify-center gap-1 sm:gap-2">
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  aria-disabled={currentPage === 1}
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>
              {renderPaginationItems()}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  aria-disabled={currentPage === totalPages}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
        {/* adjust page size */}
        <div className="mt-4 flex justify-end">
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(parseInt(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 / page</SelectItem>
              <SelectItem value="20">20 / page</SelectItem>
              <SelectItem value="50">50 / page</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
