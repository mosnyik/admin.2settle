import { TransactionData } from "@/types/general-types";
import axios from "axios";
interface TransactionQuery {
  currentPage: number;
  totalPages: number;
}

export const fetchTransaction = (query: TransactionQuery) => {
  

  axios
    .get<TransactionData[]>(`/api/get_transactions`,{
      params:{
        page: (query.currentPage - 1) * query.currentPage,
        limit: query.totalPages
      }
    })
    .then((res) => {
      console.log("Trx data", res.data);
      return res.data;
    });
};

export function fetchYTD() {
  axios.get("/api/total_volume_tyd").then((res) => {
    console.log("YTD Data", res.data);
    return res.data;
  });
}
