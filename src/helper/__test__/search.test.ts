import { describe, it, expect } from "vitest";
import searchTransaction from "../searchTrx";
import { sampleTransactions } from "@/lib/sort-data";

describe("Search the transaction array and return search result", () => {
  it("should return the search term", () => {
    const byTRXId = "TXN001";
    const byGiftId = "GCHAT001";
    const byBadTRXId = "TXN2000";
    const byBadGiftId = "GCHAT749";
    let trxResult = searchTransaction(sampleTransactions, byTRXId);
    let giftResult = searchTransaction(sampleTransactions, byGiftId);
    let badTrxResult = searchTransaction(sampleTransactions, byBadTRXId);
    let badGiftResult = searchTransaction(sampleTransactions, byBadGiftId);

    expect(trxResult).toBeDefined();
    expect(trxResult).toMatchObject({ transac_id: "TXN001" });
    expect(giftResult).toBeDefined();
    expect(giftResult).toMatchObject({ gift_chatID: "GCHAT001" });

    // nagative test
    expect(badTrxResult).not.toBeDefined();
    expect(badGiftResult).not.toBeDefined();
  });
});
