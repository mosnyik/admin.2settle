import { pool } from "@/lib/db";
import { TransactionData } from "@/types/general-types";
import { RowDataPacket } from "mysql2/promise";
import { NextApiRequest, NextApiResponse } from "next";

function mapRow(row: RowDataPacket): TransactionData {
  return {
    transac_id: String(row.reference ?? ""),
    Date: row.created_at ? new Date(row.created_at as string).toISOString() : null,
    Amount: row.crypto_amount != null ? String(row.crypto_amount) : null,
    crypto: String(row.crypto ?? ""),
    status: "Processing",
    charges: row.charge_amount != null ? String(row.charge_amount) : null,
    estimation: row.fiat_amount != null ? String(row.fiat_amount) : null,
    mode_of_payment: "gift",
    gift_status: "not claimed",
    gift_chatID: row.payer_chat_id != null ? String(row.payer_chat_id) : null,
    current_rate: row.rate != null ? String(row.rate) : null,
    network: String(row.network ?? ""),
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         ps.reference, ps.type, ps.status,
         ps.fiat_amount, ps.crypto, ps.crypto_amount, ps.network,
         ps.rate, ps.charge_amount, ps.created_at,
         p.chat_id AS payer_chat_id
       FROM payment_sessions ps
       LEFT JOIN payers p ON p.id = ps.payer_id
       WHERE ps.type = 'gift' AND ps.status = 'confirmed'
       ORDER BY ps.created_at DESC`
    );

    return res.status(200).json({
      success: true,
      count: rows.length,
      data: (rows as RowDataPacket[]).map(mapRow),
    });
  } catch (error) {
    console.error("get_pending_gifts error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
