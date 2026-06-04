import axios from "axios";
import { TransactionData } from "@/types/general-types";

const engineURL = process.env.PAYMENT_ENGINE_URL || "http://localhost:3500";

export const engineClient = axios.create({
  baseURL: `${engineURL}/v1`,
  headers: {
    Authorization: `Bearer ${process.env.ADMIN_SECRET ?? ""}`,
  },
});

function mapStatus(status: string): string {
  if (status === "settled") return "Successful";
  if (status === "failed") return "UnSuccessful";
  if (status === "expired") return "Cancel";
  return "Processing";
}

export function mapPayment(p: Record<string, unknown>): TransactionData {
  const type = String(p.type ?? "");
  const status = String(p.status ?? "");
  const isSettled = ["settling", "settled"].includes(status);

  return {
    transac_id: String(p.reference ?? ""),
    Date: p.created_at ? new Date(p.created_at as string).toISOString() : null,
    Amount: p.crypto_amount != null ? String(p.crypto_amount) : null,
    crypto: String(p.crypto ?? ""),
    status: mapStatus(status),
    charges: p.charge_amount != null ? String(p.charge_amount) : null,
    receiver_name: String(p.account_name ?? ""),
    network: String(p.network ?? ""),
    estimation: p.fiat_amount != null ? String(p.fiat_amount) : null,
    mode_of_payment: type,
    acct_number: String(p.account_number ?? ""),
    bank_name: String(p.bank_name ?? ""),
    receiver_amount: p.settled_fiat_amount != null ? String(p.settled_fiat_amount) : null,
    crypto_sent: p.received_amount != null ? String(p.received_amount) : null,
    wallet_address: String(p.deposit_address ?? ""),
    settled_on: p.settled_at ? new Date(p.settled_at as string).toISOString() : null,
    customer_phoneNumber: p.payer_phone != null ? String(p.payer_phone) : null,
    gift_status: type === "gift" ? (isSettled ? "claimed" : "not claimed") : null,
    request_status: type === "request" ? (isSettled ? "claimed" : "not claimed") : null,
    gift_chatID: p.payer_chat_id != null ? String(p.payer_chat_id) : null,
    asset_price: p.asset_price != null ? String(p.asset_price) : null,
    current_rate: p.rate != null ? String(p.rate) : null,
  };
}
