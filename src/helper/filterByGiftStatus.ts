import { TransactionData } from "@/types/general-types";

export default function filterByGiftRequestStatus(
  transactions: TransactionData[],
  desc: boolean = false
) {
  if (transactions.length < 1) return [];

  const order: Record<string, number> = {
    claimed: 1,
    "not claimed": 2,
    pending: 3,
  };

  return transactions.sort((a, b) => {
    const statusA = a.gift_status
      ? a.gift_status.toLowerCase()
      : a.request_status?.toLowerCase();

    const statusB = b.gift_status
      ? b.gift_status.toLowerCase()
      : b.request_status?.toLowerCase();

    const aOrder = order[statusA ?? ""] ?? null;
    const bOrder = order[statusB ?? ""] ?? null;

    if (aOrder === null && bOrder !== null) return 1;
    if (bOrder === null && aOrder !== null) return -1;
    if (aOrder === null && bOrder === null) return 0;

    return desc ? aOrder - bOrder : bOrder - aOrder;
  });
}
