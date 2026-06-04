import { pool } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         COUNT(*) AS count,
         SUM(fiat_amount - COALESCE(charge_amount, 0)) AS total_naira,
         SUM(COALESCE(crypto_amount, 0)) AS total_dollar
       FROM payment_sessions
       WHERE type = 'request' AND status = 'settled'`
    );

    const row = rows[0] as { count: number; total_naira: string; total_dollar: string };

    return res.status(200).json({
      success: true,
      count: row.count || 0,
      totalNaira: row.total_naira ? parseFloat(row.total_naira) : 0,
      totalDollar: row.total_dollar ? parseFloat(row.total_dollar) : 0,
    });
  } catch (error) {
    console.error("get_request_summary error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
