import { fetchTransaction, fetchYTD } from "@/services/transaction-service";
import { useQuery } from "@tanstack/react-query";

export function useTransactions() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => fetchTransaction({ currentPage: 1, totalPages: 1 }),
  });
  return { data, error, isLoading };
}

export function useYTD() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["ytd"],
    queryFn: fetchYTD,
  });

  return { data, error, isLoading };
}
