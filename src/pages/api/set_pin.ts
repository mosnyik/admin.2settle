import mysql from "mysql2/promise";
import { NextApiRequest, NextApiResponse } from "next";
import { formatPhoneNumber } from "@/helper/user_login";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { phone, pin } = req.body;

  console.log("Inside setPIN api phone is ", phone);
  console.log("Inside setPIN api pin is ", pin);
  if (!phone || !pin) {
    return res.status(400).json({ message: "Phone and PIN are required" });
  }

  const dbHost = process.env.host;
  const dbUser = process.env.user;
  const dbPassword = process.env.password;
  const dbName = process.env.database;

  let connection;

  try {
    const formattedPhone = formatPhoneNumber(phone);

    connection = await mysql.createConnection({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      database: dbName,
    });

    await connection.execute(
      "UPDATE 2Settle_support_table SET support_pin = ? WHERE support_phoneNumber = ?",
      [pin, formattedPhone]
    );

    await connection.end();

    res.status(200).json({ message: "PIN set successfully" });
  } catch (error) {
    console.error("Set PIN error:", error);
    res.status(500).json({ message: "An unexpected error occurred" });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
