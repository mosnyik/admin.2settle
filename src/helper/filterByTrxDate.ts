import { TransactionData } from "@/types/general-types";

function toDate(dateString: string): Date {
  if (!dateString) return new Date();
  const [timePart, datePart] = dateString.split(" ");
  const [day, month, year] = datePart
    .split("/")
    .map((dateItem) => parseInt(dateItem));
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
