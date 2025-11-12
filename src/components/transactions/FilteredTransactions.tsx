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
}
const FilteredTransactions = ({
  setTransactions,
  filteredTransactions,
  triggerRefresh,
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
        // Check backend's success flag
        setTransactions((prevTransactions) =>
          prevTransactions.map((t) =>
            t.transac_id === transactionId ? { ...t, status: newStatus } : t
          )
        );
        {
          triggerRefresh();
        }
      }
    } catch (error) {
      console.error("Failed to update transaction status:", error);
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

  // 2. Map the sorted transactions
  return sortedTransactions.map((transaction, index) => (
    <TableRow key={index} className="text-black">
      <TableCell className="hidden md:table-cell">
        {transaction.Date || "N/A"}
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
            className={`w-[120px] ${
              transaction.status === "Successful"
                ? "bg-green-100 text-green-800"
                : transaction.status === "Processing"
                ? "bg-amber-100 text-amber-800"
                : transaction.status === "Cancel"
                ? "bg-red-100 text-red-800"
                : transaction.status === "Uncompleted"
                ? "bg-gray-100 text-gray-800"
                : transaction.status === "UnSuccessful"
                ? "bg-orange-100 text-orange-800"
                : ""
            }`}
          >
            <SelectValue placeholder={transaction.status} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Successful">Successful</SelectItem>
            <SelectItem value="Uncompleted">Uncompleted</SelectItem>
            <SelectItem value="Cancel">Cancel</SelectItem>
            <SelectItem value="UnSuccessful">Unsuccessful</SelectItem>
          </SelectContent>
        </Select>
        {/* <Select
          onValueChange={(value) =>
            handleStatusChange(transaction.transac_id!, value)
          }
        >
          <SelectTrigger
            className={`w-[120px] ${
              transaction.status === "Successful"
                ? "bg-green-100 text-green-800"
                : transaction.status === "Processing"
                ? "bg-amber-100  text-amber-800"
                : transaction.status === "Cancel"
                ? "bg-red-100 text-red-800"
                : transaction.status === "Uncompleted"
                ? "bg-gray-100  text-gray-800"
                : transaction.status === "UnSuccessful"
                ? "bg-orange-100  text-orange-800"
                : "" // Default (no background)
            }`}
          >
            <SelectValue placeholder={transaction.status} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Successful">Successful</SelectItem>
            <SelectItem value="Uncompleted">Uncompleted</SelectItem>
            <SelectItem value="Cancel">Cancel</SelectItem>
            <SelectItem value="UnSuccessful">Unsuccessful</SelectItem>
          </SelectContent>
        </Select> */}
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
      <TableCell>{transaction.settled_on || "N/A"}</TableCell>
    </TableRow>
  ));
};

export default FilteredTransactions;
