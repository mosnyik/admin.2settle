import { describe, it, expect } from "vitest";
import filterByTrxType from "../filterByTrxType";
import filterByGiftRequestStatus from "../filterByGiftStatus";
import {
  sampleTransactions,
  sortedByDateAsnd,
  sortedByDateDesc,
  sortedByGiftStatusAsnd,
  sortedByGiftStatusDesc,
  sortedByTransactionTypeAsnd,
  sortedByTransactionTypeDesc,
  transactionForSortByGiftStatus,
} from "@/lib/sort-data";
import filterByDate from "../filterByTrxDate";

describe("sort transactions by type", () => {
  it("It should return an empty array if the transaction array is empty", () => {
    expect(filterByTrxType([])).toStrictEqual([]);
  });
  it("It should sort the array, gift first, transaction second, request last if desc is not provided", () => {
    expect(filterByTrxType(sampleTransactions)).toStrictEqual(
      sortedByTransactionTypeDesc
    );
  });
  it("It should sort the array, gift first, request second, transaction last if desc=false", () => {
    expect(filterByTrxType(sampleTransactions, false)).toStrictEqual(
      sortedByTransactionTypeDesc
    );
  });
  it("It should sort the array, transfermoney first, request second, transaction last if desc=true", () => {
    expect(filterByTrxType(sampleTransactions, true)).toStrictEqual(
      sortedByTransactionTypeAsnd
    );
  });
});

describe("sort transactions by gift status", () => {
  it("It should return an empty array if the transaction array is empty", () => {
    expect(filterByGiftRequestStatus([])).toStrictEqual([]);
  });
  it("It should  sort the array, pending first, not claimed second, claimed last if desc not provided", () => {
    expect(
      filterByGiftRequestStatus(transactionForSortByGiftStatus)
    ).toStrictEqual(sortedByGiftStatusAsnd);
  });
  it("It should  sort the array, pending first, not claimed second, claimed next and anything else last if desc=false", () => {
    expect(
      filterByGiftRequestStatus(transactionForSortByGiftStatus, false)
    ).toStrictEqual(sortedByGiftStatusAsnd);
  });
  it("It should  sort the array, claimed first, not claimed second, pending next and anything else lastif desc=true", () => {
    expect(
      filterByGiftRequestStatus(transactionForSortByGiftStatus, true)
    ).toStrictEqual(sortedByGiftStatusDesc);
  });

});

describe("sort transactions by date", () => {
  it("It should return an empty array if the transaction array is empty", () => {
    expect(filterByDate([])).toStrictEqual([]);
  });
  it("It should  sort the array, most recent first,and  the earlier on last if desc not provided", () => {
    expect(filterByDate(transactionForSortByGiftStatus)).toStrictEqual(
      sortedByDateAsnd
    );
  });
  it("It should  sort the array, most recent first,and  the earlier on last if desc = false", () => {
    expect(filterByDate(transactionForSortByGiftStatus, false)).toStrictEqual(
      sortedByDateAsnd
    );
  });

  it("It should  sort the array, claimed first, not claimed second, pending last if desc=true", () => {
    expect(filterByDate(transactionForSortByGiftStatus, true)).toStrictEqual(
      sortedByDateDesc
    );
  });
});
