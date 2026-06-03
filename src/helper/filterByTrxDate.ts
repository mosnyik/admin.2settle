import { TransactionData } from "@/types/general-types";

function toDate(dateString: string): Date {
  if (!dateString) return new Date(0);
  // ISO 8601 (from payment engine)
  const iso = new Date(dateString);
  if (!isNaN(iso.getTime())) return iso;
  // Legacy format: "HH:MMam/pm dd/mm/yyyy"
  const parts = dateString.split(" ");
  if (parts.length < 2) return new Date(0);
  const [timePart, datePart] = parts;
  const [day, month, year] = datePart.split("/").map(Number);
  const time = timePart.replace(/([AP]M)$/, " $1");
  return new Date(`${year}-${month}-${day} ${time}`);
}

export default function filterByDate(
  transactions: TransactionData[],
  desc: boolean = false
) {
  if (transactions.length < 1) return [];
  return transactions.sort((a, b) => {
    const dateA = toDate(a.Date ?? "").getTime();
    const dateB = toDate(b?.Date ?? "").getTime();

    return desc ? dateB - dateA : dateA - dateB;
  });
}
export function filterBySettledDate(
  transactions: TransactionData[],
  desc: boolean = false
) {
  if (transactions.length < 1) return [];
  return transactions.sort((a, b) => {
    const dateA = toDate(a.settled_on ?? "").getTime();
    const dateB = toDate(b.settled_on ?? "").getTime();

    return desc ? dateB - dateA : dateA - dateB;
  });
}
