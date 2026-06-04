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
import FilteredTransactions from "./FilteredTransactions";
import { TransactionData } from "@/types/general-types";

interface Props {
  isLoading: boolean;
  setTransactions: Dispatch<SetStateAction<TransactionData[]>>;
  filteredTransactions: TransactionData[];
  triggerRefresh: () => void;
  filterByTrxType: (transactions: TransactionData[]) => void;
  filterByDate: () => void;
  filterBySettled: () => void;
  filterByGiftRequestStatus: () => void;
  onError: (msg: string) => void;
}
const TransactionsTable = ({
  isLoading,
  setTransactions,
  filteredTransactions,
  triggerRefresh,
  filterByTrxType,
  filterByDate,
  filterBySettled,
  filterByGiftRequestStatus,
  onError,
}: Props) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="hidden md:table-cell">
            <button
              onClick={filterByDate}
              className="hover:bg-blue-100 px-2 py-1 sm:m-4 md:m-1 rounded-md"
            >
              Date
            </button>
          </TableHead>
          <TableHead>Tx ID</TableHead>
          <TableHead>
            <button
              onClick={() => filterByTrxType([...filteredTransactions])}
              className="hover:bg-blue-100 px-2 py-1 sm:m-4 md:m-1 rounded-md"
            >
              Tx Type
            </button>
          </TableHead>
          <TableHead>Amount</TableHead>
          <TableHead className="hidden md:table-cell" >Crypto</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>
            <button
              onClick={filterByGiftRequestStatus}
              className="hover:bg-blue-100 px-2 py-1 sm:m-4 md:m-1 rounded-md"
            >
              Gift/Request Status
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
            <TableCell colSpan={7} className="text-center text-gray-500 py-4">
              No transactions found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default TransactionsTable;
