import { pool } from "@/lib/db";
import { VOLUME_QUERY } from "@/lib/volume-query";
import { currentReportingMonth, monthBounds } from "@/helper/monthly-volume";
import { RowDataPacket } from "mysql2/promise";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Only GET requests are allowed." });
  }

  const month = req.query.month ?? currentReportingMonth();
  let bounds;
  try {
    if (typeof month !== "string" || month > currentReportingMonth()) {
      throw new Error("Choose the current month or an earlier month.");
    }
    bounds = monthBounds(month);
  } catch {
    return res.status(400).json({ message: "Choose a valid current or past month in YYYY-MM format." });
  }

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(VOLUME_QUERY, [bounds.start, bounds.end]);
    const row = rows[0];
    return res.status(200).json({
      month,
      totalNaira: String(row.totalNaira),
      totalDollar: row.totalDollar === null ? null : String(row.totalDollar),
      transactionCount: Number(row.transactionCount),
      missingRateCount: Number(row.missingRateCount),
      fallbackDateCount: Number(row.fallbackDateCount),
    });
  } catch (error) {
    console.error("Monthly volume query error:", error);
    return res.status(500).json({ message: "Unable to load monthly volume. Please try again." });
  }
}
