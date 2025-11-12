import mysql from "mysql2/promise";
import { NextApiRequest, NextApiResponse } from "next";
import { formatPhoneNumber, parseSupportNumber } from "@/helper/user_login";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { phone, pin } = req.body;

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

    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM 2Settle_support_table WHERE support_phoneNumber = ?",
      [formattedPhone]
    );

    if (rows.length === 0) {
      console.log("No matching record found for the provided phone number.");
      return res.status(404).json({ message: "Invalid credentials" });
    }

    const admin = rows[0];
    console.log("Phone number from DB:", admin.support_phoneNumber);
    console.log("Support ID from DB:", admin.support_id);
    console.log("Support PIN from DB:", admin.support_pin);

    let validLogin = false;
    let requiresPinSet = false;

    if (admin.support_pin === null) {
      console.log("support_pin is null; checking support_id for login.");
      const supportNumber = parseSupportNumber(admin.support_id);
      if (supportNumber.includes(pin)) {
        validLogin = true;
        requiresPinSet = true;
      } else {
        console.log(
          "PIN mismatch. Provided PIN does not match the support ID."
        );
      }
    } else {
      console.log("Using support_pin for login.");
      if (admin.support_pin === pin) {
        validLogin = true;
      } else {
        console.log(
          "PIN mismatch. Provided PIN does not match the support PIN."
        );
      }
    }

    if (!validLogin) {
      return res.status(404).json({ message: "Invalid credentials" });
    }

    await connection.end();

    res.status(200).json({
      message: "Login successful",
      requiresPinSet,
      user: {
        phone: admin.support_phoneNumber,
        supportNumber: admin.support_id,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "An unexpected error occurred" });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
