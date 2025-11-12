"use client";

import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
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
import filterByTrxDate, { filterBySettledDate } from "@/helper/filterByTrxDate";
import filterByTrxType from "@/helper/filterByTrxType";
import searchTransaction from "@/helper/searchTrx";
// import usePushNotifications from "@/hooks/usePushNotifications";
import { TransactionData } from "@/types/general-types";
import { Eye, EyeOff, Lock } from "lucide-react";
import SearchTransaction from "./SearchTransaction";
import TransactionsTable from "./transactions/TransactionsTable";

export default function TransactionDashboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [transactions, setTransactions] = useState<TransactionData[]>([]);
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
  const [error, setError] = useState<string | null>(null);

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const router = useRouter();

  const [showPin, setShowPin] = useState(false);
  const [pinsMatch, setPinsMatch] = useState(true);
  const [sortDesc, setSortDesc] = useState(false);
  // // reg notification
  // const { registerPushNotifications, sendNotification } =
  //   usePushNotifications();
  // useEffect(() => {
  //   console.log("We are in the useEffect");
  //   registerPushNotifications();
  // }, [registerPushNotifications]);

  // useEffect(() => {
  //   sendNotification("Transaction Notification", "There is a new transaction");
  // }, [sendNotification]);

  // Handle errors
  const handleError = (error: {
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
  };

  // fetch transactions
  const fetchTransactions = useCallback(async (page: number, limit: number) => {
    try {
      setIsLoading(true);
      setError(null);
      await axios
        .get<{
          transactions: TransactionData[];
          pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
          };
        }>(`/api/get_transactions?page=${page}&limit=${limit}`)
        .then((res) => {
          setTransactions(res.data.transactions);
          setFilteredTransactions(res.data.transactions);
          setTotalPages(res.data.pagination.totalPages);
        })
        .catch((error) => {
          handleError(error);
        });
    } catch (error) {
      if (axios.isAxiosError(error)) {
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
      } else {
        setError("An unexpected error occurred");
      }
      console.error("Error details:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // check login user/authentication
  useEffect(() => {
    const checkLoginStatus = () => {
      const storedPhone = localStorage.getItem("phone");
      const userLoggedIn = localStorage.getItem("userLoggedIn");

      setIsLoggedIn(userLoggedIn === "true");
      if (userLoggedIn !== "true") {
        router.push("/admin-login");
      } else {
        setPhone(storedPhone || "");
        fetchTransactions(currentPage, itemsPerPage);
        console.log("Stored number", storedPhone);
      }
    };

    checkLoginStatus();
  }, [phone, router, currentPage, itemsPerPage, fetchTransactions]);

  // filter transactions
  useEffect(() => {
    if (statusFilter) {
      setFilteredTransactions(
        transactions.filter(
          (transaction) =>
            transaction.status?.toLocaleLowerCase() ===
            statusFilter.toLowerCase()
        )
      );
    } else {
      setFilteredTransactions(transactions);
    }
  }, [statusFilter, transactions]);

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

  const filterByType = (transactions: TransactionData[]): void => {
    toggleSorted();
    const sortedTrxByType = filterByTrxType(transactions, sortDesc);
    setTransactions(sortedTrxByType);
  };

  const filterByDate = (): void => {
    toggleSorted();
    const sortByDate = filterByTrxDate(transactions, sortDesc);
    setTransactions(sortByDate);
  };
  const filterBySettled = (): void => {
    toggleSorted();
    const sortByDate = filterBySettledDate(transactions, sortDesc);
    setTransactions(sortByDate);
  };
  // 1. Sort the transactions: "Processing" first, others follow
  const sortedTransactions = [...filteredTransactions]
    .sort((a, b) => {
      if (a.status === "Processing") return -1;
      if (b.status === "Processing") return 1;
      if (a.gift_status === "Processing") return -1;
      if (b.gift_status === "Processing") return 1;
      return 0;
    })
    .filter(
      (transaction) =>
        transaction.transac_id !== null && transaction.transac_id !== undefined
    );

  const filterByGiftRequestStatus = (): void => {
    toggleSorted();

    const sortedByGift = filterByGiftStatus(sortedTransactions, sortDesc);
    setTransactions(sortedByGift);
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
            onValueChange={(value) =>
              setStatusFilter(
                value.toLowerCase() === "all" ? null : value || null
              )
            }
          >
            <SelectTrigger className="w-[150px] text-black">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Successful">Successful</SelectItem>
              <SelectItem value="Processing">Processing</SelectItem>
              <SelectItem value="Uncompleted">Uncompleted</SelectItem>
              <SelectItem value="Cancel">Cancel</SelectItem>
              <SelectItem value="Unsuccessful">Unsuccessful</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* display transactions table */}
        <div className="border rounded-lg overflow-x-auto">
          <TransactionsTable
            isLoading={isLoading}
            filteredTransactions={filteredTransactions}
            setTransactions={setTransactions}
            triggerRefresh={triggerRefresh}
            filterByTrxType={filterByType}
            filterByDate={filterByDate}
            filterBySettled={filterBySettled}
            filterByGiftRequestStatus={filterByGiftRequestStatus}
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
              fetchTransactions(1, parseInt(value));
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
          {error && (
            <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
              <p>
                ⚠️ {error}
                <button
                  onClick={() => fetchTransactions(currentPage, itemsPerPage)}
                  className="ml-2 text-red-700 underline"
                >
                  Retry
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
