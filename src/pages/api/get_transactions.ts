import { TransactionData } from "@/types/general-types";
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

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  const dbConfig = {
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
  };

  try {
    const connection = await mysql.createConnection(dbConfig);

    const query = `
      SELECT SQL_CALC_FOUND_ROWS * 
      FROM 2settle_transaction_table 
      ORDER BY id DESC 
      LIMIT ${limit} OFFSET ${offset}
    `;

    const [rows] = await connection.query(query);

    const [countResult] = await connection.query(
      "SELECT FOUND_ROWS() as total"
    );

    await connection.end();

    const transactions = (rows as TransactionData[]).map((row) => ({
      id: row.id,
      Date: row.Date,
      transac_id: row.transac_id,
      Amount: row.Amount,
      crypto: row.crypto,
      status: row.status,
      charges: row.charges,
      receiver_name: row.receiver_name,
      network: row.network,
      estimation: row.estimation,
      mode_of_payment: row.mode_of_payment,
      acct_number: row.acct_number,
      bank_name: row.bank_name,
      receiver_amount: row.receiver_amount,
      crypto_sent: row.crypto_sent,
      wallet_address: row.wallet_address,
      settled_on: row.settled_on,
      customer_phoneNumber: row.customer_phoneNumber,
      gift_status: row.gift_status,
      gift_chatID: row.gift_chatID,
      asset_price: row.asset_price,
    }));

    const total = (countResult as { total: number }[])[0].total;

    res.status(200).json({
      transactions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    });
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
