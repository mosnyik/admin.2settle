import { pool } from "@/lib/db";
import { TransactionData } from "@/types/general-types";
import { RowDataPacket } from "mysql2/promise";
import { NextApiRequest, NextApiResponse } from "next";

function mapStatus(status: string): string {
  if (status === "settled") return "Successful";
  if (status === "failed") return "UnSuccessful";
  if (status === "expired") return "Cancel";
  return "Processing";
}

function mapRow(row: RowDataPacket): TransactionData {
  const type = String(row.type ?? "");
  const status = String(row.status ?? "");
  const isSettled = ["settling", "settled"].includes(status);
  return {
    transac_id: String(row.reference ?? ""),
    Date: row.created_at ? new Date(row.created_at as string).toISOString() : null,
    Amount: row.crypto_amount != null ? String(row.crypto_amount) : null,
    crypto: String(row.crypto ?? ""),
    status: mapStatus(status),
    charges: row.charge_amount != null ? String(row.charge_amount) : null,
    receiver_name: String(row.account_name ?? ""),
    network: String(row.network ?? ""),
    estimation: row.fiat_amount != null ? String(row.fiat_amount) : null,
    mode_of_payment: type,
    acct_number: String(row.account_number ?? ""),
    bank_name: String(row.bank_name ?? ""),
    receiver_amount: row.settled_fiat_amount != null ? String(row.settled_fiat_amount) : null,
    crypto_sent: row.received_amount != null ? String(row.received_amount) : null,
    wallet_address: String(row.deposit_address ?? ""),
    settled_on: row.settled_at ? new Date(row.settled_at as string).toISOString() : null,
    customer_phoneNumber: row.payer_phone != null ? String(row.payer_phone) : null,
    gift_status: type === "gift" ? (isSettled ? "claimed" : "not claimed") : null,
    request_status: type === "request" ? (isSettled ? "claimed" : "not claimed") : null,
    gift_chatID: row.payer_chat_id != null ? String(row.payer_chat_id) : null,
    current_rate: row.rate != null ? String(row.rate) : null,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
         ps.reference, ps.type, ps.status,
         ps.fiat_amount, ps.crypto, ps.crypto_amount, ps.network,
         ps.rate, ps.charge_amount, ps.deposit_address,
         ps.received_amount, ps.settled_fiat_amount,
         ps.settled_at, ps.created_at,
         r.bank_account AS account_number, r.bank_name, r.account_name,
         p.chat_id AS payer_chat_id, p.phone AS payer_phone
       FROM payment_sessions ps
       LEFT JOIN receivers r ON r.id = ps.receiver_id
       LEFT JOIN payers p ON p.id = ps.payer_id
       ORDER BY ps.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [countResult] = await pool.execute<RowDataPacket[]>(
      "SELECT COUNT(*) AS total FROM payment_sessions"
    );

    const total = (countResult[0] as { total: number }).total;

    return res.status(200).json({
      transactions: (rows as RowDataPacket[]).map(mapRow),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    });
  } catch (error) {
    console.error("get_transactions error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
