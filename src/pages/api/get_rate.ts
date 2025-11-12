import { ExchangeRate } from "@/types/general-types";
import mysql, { RowDataPacket } from "mysql2/promise";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(
  req: NextApiRequest,

  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const dbHost = process.env.host;
  const dbUser = process.env.user;
  const dbPassword = process.env.password;
  const dbName = process.env.database;

  try {
    const connection = await mysql.createConnection({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      database: dbName,
    });

    const [results] = await connection.query<RowDataPacket[]>(
      "SELECT * FROM 2Settle_ExchangeRate"
    );

    const result = results[0] as ExchangeRate;
    const raw = result.rate;
    const array_rate = raw.toString();
    const numRate = Number(array_rate);
    const percentage = 0.8;
    const increase = (percentage / 100) * numRate;
    const rate = numRate - increase;
    const data = rate.toLocaleString();

    await connection.end();

    res.status(200).json({ rate: data });
  } catch (err) {
    console.error(
      "Error querying the 2Settle_ExchangeRate from database:",
      err
    );
    res.status(500).send("Server error");
  }
}
