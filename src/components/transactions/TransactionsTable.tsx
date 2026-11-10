import React, { Dispatch, SetStateAction } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import Skeleton from "./Skeleton";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import FilteredTransactions from "./FilteredTransactions";
import { TransactionData } from "@/types/general-types";

interface Props {
  isLoading: boolean;
  setTransactions: Dispatch<SetStateAction<TransactionData[]>>;
  filteredTransactions: TransactionData[];
  triggerRefresh: () => void;
  transactionType: string;
  onTransactionTypeChange: (type: string) => void;
  filterByDate: () => void;
  dateSort: "asc" | "desc" | null;
  filterBySettled: () => void;
  filterByGiftRequestStatus: () => void;
  onError: (msg: string) => void;
}
const TransactionsTable = ({
  isLoading,
  setTransactions,
  filteredTransactions,
  triggerRefresh,
  transactionType,
  onTransactionTypeChange,
  filterByDate,
  dateSort,
  filterBySettled,
  filterByGiftRequestStatus,
  onError,
}: Props) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead
            className="hidden md:table-cell"
            aria-sort={dateSort === "asc" ? "ascending" : dateSort === "desc" ? "descending" : "none"}
          >
            <button
              type="button"
              onClick={filterByDate}
              title={dateSort === "asc" ? "Oldest first. Click for newest first." : "Click to sort oldest first."}
              aria-label={`Date${dateSort ? (dateSort === "asc" ? ", oldest first" : ", newest first") : ""}. Sort ${dateSort === "asc" ? "newest" : "oldest"} first`}
              className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 font-medium text-blue-700 transition-colors hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Date
              <span className="inline-flex" aria-hidden="true">
                <ArrowUp className={`h-4 w-4 ${dateSort === "asc" ? "text-blue-700" : "text-gray-400"}`} strokeWidth={dateSort === "asc" ? 3 : 1.5} />
                <ArrowDown className={`h-4 w-4 ${dateSort === "desc" ? "text-blue-700" : "text-gray-400"}`} strokeWidth={dateSort === "desc" ? 3 : 1.5} />
              </span>
            </button>
          </TableHead>
          <TableHead>Tx ID</TableHead>
          <TableHead>
            <label htmlFor="transaction-type" className="sr-only">Filter by transaction type</label>
            <select
              id="transaction-type"
              value={transactionType}
              onChange={(event) => onTransactionTypeChange(event.target.value)}
              title="Filter by transaction type"
              className="cursor-pointer rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 font-medium text-blue-700 transition-colors hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <option value="all">Tx Type: All</option>
              <option value="gift">Gift</option>
              <option value="transfer">Transfer</option>
              <option value="request">Request</option>
            </select>
          </TableHead>
          <TableHead>Amount</TableHead>
          <TableHead className="hidden md:table-cell" >Crypto</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>
            <button
              type="button"
              onClick={filterByGiftRequestStatus}
              title="Click to sort by gift/request status"
              className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 font-medium text-blue-700 transition-colors hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Gift/Request Status
              <ArrowUpDown className="h-4 w-4 shrink-0" aria-hidden="true" />
            </button>
          </TableHead>
          <TableHead className="hidden md:table-cell">Charges</TableHead>
          <TableHead>Receiver</TableHead>
          <TableHead>
            <button
              onClick={filterBySettled}
              className="hover:bg-blue-100 px-2 py-1 sm:m-4 md:m-1 rounded-md"
            >
              Settled On
            </button>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <Skeleton.DashboardSkeleton />
        ) : filteredTransactions.length > 0 ? (
          <FilteredTransactions
            setTransactions={setTransactions}
            filteredTransactions={filteredTransactions}
            triggerRefresh={triggerRefresh}
            onError={onError}
          />
        ) : (
          <TableRow>
            <TableCell colSpan={10} className="text-center text-gray-500 py-4">
              No transactions found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default TransactionsTable;
