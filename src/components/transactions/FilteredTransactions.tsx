import React, { Dispatch, SetStateAction } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";
import axios from "axios";
import { TransactionData } from "@/types/general-types";
import truncateString from "@/helper/trunctate_string";

interface Props {
  setTransactions: Dispatch<SetStateAction<TransactionData[]>>;
  filteredTransactions: TransactionData[];
  triggerRefresh: () => void;
  onError: (msg: string) => void;
}
function formatDate(iso: string | null | undefined): string {
  if (!iso) return "N/A";
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

const FilteredTransactions = ({
  setTransactions,
  filteredTransactions,
  triggerRefresh,
  onError,
}: Props) => {
  const handleStatusChange = async (
    transactionId: string,
    newStatus: string
  ) => {
    try {
      const res = await axios.post("/api/update_transaction_status", {
        transactionId,
        newStatus,
      });

      if (res.data.success) {
        setTransactions((prevTransactions) =>
          prevTransactions.map((t) =>
            t.transac_id === transactionId ? { ...t, status: newStatus } : t
          )
        );
        triggerRefresh();
      } else {
        onError(res.data.error ?? "Failed to update status");
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      const msg = axiosError.response?.data?.error ?? "Failed to update transaction status";
      onError(msg);
    }
  };

  //      const handleStatusChange = async (
  //        transactionId: string,
  //        newStatus: string
  //      ) => {
  //        try {
  //          await axios.post("/api/update_transaction_status", {
  //            transactionId,
  //            newStatus,
  //          });

  //          setTransactions((prevTransactions) =>
  //            prevTransactions.map((t) =>
  //              t.transac_id === transactionId ? { ...t, status: newStatus } : t
  //            )
  //          );
  //        } catch (error) {
  //          console.error("Error updating transaction status:", error);
  //        }
  //      };

  const IN_PROGRESS = ["created", "pending", "confirming", "confirmed", "settling"];

  // 1. Sort the transactions: in-progress statuses first
  const sortedTransactions = [...filteredTransactions]
    .sort((a, b) => {
      if (IN_PROGRESS.includes(a.status ?? "")) return -1;
      if (IN_PROGRESS.includes(b.status ?? "")) return 1;
      return 0;
    })
    .filter(
      (transaction) =>
        transaction.transac_id !== null && transaction.transac_id !== undefined
    );

  // 2. Map the sorted transactions
  return sortedTransactions.map((transaction, index) => (
    <TableRow key={index} className="text-black">
      <TableCell className="hidden md:table-cell">
        {formatDate(transaction.Date)}
      </TableCell>
      <TableCell>{transaction.transac_id || "N/A"}</TableCell>
      <TableCell>
        {`${truncateString(transaction.mode_of_payment ?? "")} - ${
          transaction.gift_chatID ?? transaction.transac_id
        }` || "N/A"}
      </TableCell>
      <TableCell>{truncateString(transaction.Amount ?? "") || "N/A"}</TableCell>
      <TableCell className="hidden md:table-cell">
        {transaction.crypto || "N/A"}
      </TableCell>
      <TableCell>
        <Select
          onValueChange={(value) =>
            handleStatusChange(transaction.transac_id!, value)
          }
        >
          <SelectTrigger
            className={`w-[160px] ${
              transaction.status === "settled"
                ? "bg-green-100 text-green-800"
                : transaction.status === "settling"
                ? "bg-blue-100 text-blue-800"
                : IN_PROGRESS.includes(transaction.status ?? "")
                ? "bg-amber-100 text-amber-800"
                : transaction.status === "expired"
                ? "bg-red-100 text-red-800"
                : transaction.status === "failed" || transaction.status === "settlement_reversed"
                ? "bg-orange-100 text-orange-800"
                : ""
            }`}
          >
            <SelectValue placeholder={transaction.status} />
          </SelectTrigger>
          <SelectContent>
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
      </TableCell>
      <TableCell>
        <div
          className={`rounded-md p-2 ${
            transaction.gift_status?.toLowerCase() === "claimed"
              ? "bg-green-100 text-green-800"
              : transaction.gift_status?.toLowerCase() === "pending"
              ? "bg-amber-100 text-amber-800"
              : transaction.gift_status?.toLowerCase() === "not claimed"
              ? "bg-red-100 text-red-800"
              : transaction.status === "Uncompleted"
              ? "bg-gray-100 text-gray-800"
              : ""
          }`}
        >
          {transaction.gift_status || "Not Gift/Request"}
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {transaction.charges || "N/A"}
      </TableCell>
      <TableCell>{transaction.receiver_name || "N/A"}</TableCell>
      <TableCell>{formatDate(transaction.settled_on)}</TableCell>
    </TableRow>
  ));
};

export default FilteredTransactions;
