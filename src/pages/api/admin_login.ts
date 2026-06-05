import mysql from "mysql2/promise";
import { NextApiRequest, NextApiResponse } from "next";
import { formatPhoneNumber, parseSupportNumber } from "@/helper/user_login";
import { pool } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { phone, pin } = req.body;

  if (!phone || !pin) {
    return res.status(400).json({ message: "Phone and PIN are required" });
  }

  try {
    const formattedPhone = formatPhoneNumber(phone);

    const [rows] = await pool.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM settle_db.supports WHERE phone = ?",
      [formattedPhone],
    );

    if (rows.length === 0) {
      console.log("No matching record found for the provided phone number.");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const admin = rows[0];
    console.log("Phone number from DB:", admin.phone);
    console.log("Support ID from DB:", admin.support_id);
    console.log("Support PIN from DB:", admin.pin_hash);

    let validLogin = false;
    let requiresPinSet = false;

    if (admin.pin_hash === null) {
      console.log("pin_hash is null; checking support_id for login.");
      const supportNumber = parseSupportNumber(admin.support_id);
      if (supportNumber.includes(pin)) {
        validLogin = true;
        requiresPinSet = true;
      } else {
        console.log(
          "PIN mismatch. Provided PIN does not match the support ID.",
        );
      }
    } else {
      console.log("Using pin_hash for login.");
      if (admin.pin_hash === pin) {
        validLogin = true;
      } else {
        console.log(
          "PIN mismatch. Provided PIN does not match the support PIN.",
        );
      }
    }

    if (!validLogin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      message: "Login successful",
      requiresPinSet,
      user: {
        phone: admin.phone,
        supportNumber: admin.support_id,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
}
