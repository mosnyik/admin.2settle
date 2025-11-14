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
      WHERE status = 'Successful' AND request_status = 'not claimed'
    `);

    const requestData = rows[0] || {
      count: 0,
      total_naira: 0,
      total_dollar: 0,
    };

    return res.status(200).json({
      success: true,
      count: requestData.count || 0,
      totalNaira: requestData.total_naira
        ? parseFloat(requestData.total_naira)
        : 0,
      totalDollar: requestData.total_dollar
        ? parseFloat(requestData.total_dollar)
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
