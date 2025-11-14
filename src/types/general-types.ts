import { RowDataPacket } from "mysql2/promise";

export type TotalAmountResult = { total_amount: number }[];

export interface TransactionData {
  id?: number | null;
  crypto?: string | null;
  network?: string | null;
  estimation?: string | null;
  Amount?: string | null;
  charges?: string | null;
  mode_of_payment?: string | null;
  acct_number?: string | null;
  bank_name?: string | null;
  receiver_name?: string | null;
  receiver_amount?: string | null;
  crypto_sent?: string | null;
  wallet_address?: string | null;
  Date?: string | null;
  settled_on?: string | null;
  status?: string | null;
  customer_phoneNumber?: string | null;
  transac_id?: string | null;
  settle_walletLink?: string | null;
  chat_id?: string | null;
  current_rate?: string | null;
  merchant_rate?: string | null;
  profit_rat?: string | null;
  name?: string | null;
  gift_status?: string | null;
  request_status?: string | null;
  gift_chatID?: string | null;
  asset_price?: string | null;
}

export type ExchangeRate = { rate: number };

export type ServerData = {
  rate: string;
};

export interface TransactionRow extends RowDataPacket {
  receiver_amount: string;
  current_rate: string;
  status: string;
  Date: string;
  gift_status: string;
  request_status: string;
}

export interface GiftSummaryResponse {
  success: boolean;
  count: number;
  totalNaira: number;
  totalDollar: number;
}

export interface RequestSummaryResponse {
  success: boolean;
  count: number;
  totalNaira: number;
  totalDollar: number;
}

export interface SummaryRow extends RowDataPacket {
  count: number;
  total_naira: string;
  total_dollar: string;
}
