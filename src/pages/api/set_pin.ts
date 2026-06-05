import { NextApiRequest, NextApiResponse } from "next";
import { formatPhoneNumber } from "@/helper/user_login";
import { pool } from "@/lib/db";

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

  try {
    const formattedPhone = formatPhoneNumber(phone);

    await pool.execute(
      "UPDATE settle_db.supports SET pin_hash = ? WHERE phone = ?",
      [pin, formattedPhone]
    );

    res.status(200).json({ message: "PIN set successfully" });
  } catch (error) {
    console.error("Set PIN error:", error);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
}
