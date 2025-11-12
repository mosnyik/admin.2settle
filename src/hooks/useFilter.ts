// import filterByGiftStatus from "@/helper/filterByGiftStatus";
// import filterByTrxDate from "@/helper/filterByTrxDate";
// import filterByTrxType from "@/helper/filterByTrxType";
// import { TransactionData } from "@/types/general-types";
// import { useState } from "react";

//  function useFilter = ()  =>{
//     const [sortDesc, setSortDesc] = useState(false)
//   function toggleSorted() {
//     setSortDesc(!sortDesc);
//   }

//   const filterByType = (transactions: TransactionData[]): void => {
//     toggleSorted();
//     const sortedTrxByType = filterByTrxType(transactions, sortDesc);
//     setTransactions(sortedTrxByType);
//   };

//   const filterByDate = (): void => {
//     toggleSorted();
//     const sortByDate = filterByTrxDate(transactions, sortDesc);
//     setTransactions(sortByDate);
//   };

//   const filterByGiftRequestStatus = (): void => {
//     toggleSorted();

//     const sortedByGift = filterByGiftStatus(transactions, sortDesc);
//     setTransactions(sortedByGift);
//   };

//   return { filterByType, filterByDate, filterByGiftRequestStatus}
// }