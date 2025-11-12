import { TotalAmountResult } from "@/types/general-types";
import mysql from "mysql2/promise";
import { NextApiRequest, NextApiResponse } from "next";

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

  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log("Database connection established");

    const query = `
      SELECT SUM(receiver_amount) as total_amount
      FROM 2settle_transaction_table
      WHERE status = 'successful'
        AND Date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    `;
    console.log("Executing query:", query);

    const [result] = await connection.query(query);

    await connection.end();

    const totalAmount = (result as TotalAmountResult)[0].total_amount || 0;

    console.log("Total amount for last 7 days:", totalAmount);

    res.status(200).json({ totalAmount });
  } catch (error) {
    console.error("Database query error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    res.status(500).json({
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
