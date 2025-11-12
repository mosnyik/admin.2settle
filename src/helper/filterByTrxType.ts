import { TransactionData } from "@/types/general-types";

export default function filterByTrxType(
  transactions: TransactionData[],
  desc: boolean = false
): TransactionData[] {
  if (transactions.length < 1) return [];

  const order: Record<string, number> = {
    gift: 1,
    request: 2,
    transfermoney: 3,
  };

  return transactions.sort((a, b) => {
    const aOrder = order[a.mode_of_payment?.toLowerCase() ?? 99];
    const bOrder = order[b.mode_of_payment?.toLowerCase() ?? 99];
    return desc ? bOrder - aOrder : aOrder - bOrder;
  });
}
