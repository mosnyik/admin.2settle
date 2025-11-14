import { NextApiRequest, NextApiResponse } from "next";
import mysql from "mysql2/promise";
import { SummaryRow } from "@/types/general-types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const dbConfig = {
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
  };

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.query<SummaryRow[]>(`
      SELECT 
        COUNT(*) as count,
        SUM(CAST(receiver_amount AS DECIMAL(20, 2))) as total_naira,
        SUM(CAST(Amount AS DECIMAL(20, 2))) as total_dollar
      FROM 2settle_transaction_table
      WHERE status = 'Successful' AND gift_status = 'not claimed'
    `);

    const giftData = rows[0] || { count: 0, total_naira: 0, total_dollar: 0 };

    return res.status(200).json({
      success: true,
      count: giftData.count || 0,
      totalNaira: giftData.total_naira ? parseFloat(giftData.total_naira) : 0,
      totalDollar: giftData.total_dollar
        ? parseFloat(giftData.total_dollar)
        : 0,
    });
  } catch (error) {
    console.error("Database query error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : String(error),
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
