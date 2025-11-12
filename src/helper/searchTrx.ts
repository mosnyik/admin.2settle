import { TransactionData } from "@/types/general-types";

export default function searchTransaction(
  transaction: TransactionData[],
  searchTerm: string
): TransactionData | undefined {
  const trxResult = transaction.find((t) => t.transac_id === searchTerm);
  const giftResult = transaction.find((t) => t.gift_chatID === searchTerm);
  return trxResult ?? giftResult;
}
