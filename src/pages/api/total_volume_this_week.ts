import { pool } from "@/lib/db";
import { VOLUME_QUERY } from "@/lib/volume-query";
import { currentReportingWeek, weekBounds } from "@/helper/weekly-volume";
import { RowDataPacket } from "mysql2/promise";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Only GET requests are allowed." });
  }

  const week = req.query.week ?? currentReportingWeek();
  let bounds;
  try {
    if (typeof week !== "string" || week > currentReportingWeek()) {
      throw new Error("Choose the current week or an earlier week.");
    }
    bounds = weekBounds(week);
  } catch {
    return res.status(400).json({ message: "Choose a valid current or past week in YYYY-Www format." });
  }

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(VOLUME_QUERY, [bounds.start, bounds.end]);
    const row = rows[0];
    return res.status(200).json({
      week,
      totalNaira: String(row.totalNaira),
      totalDollar: row.totalDollar === null ? null : String(row.totalDollar),
      transactionCount: Number(row.transactionCount),
      missingRateCount: Number(row.missingRateCount),
      fallbackDateCount: Number(row.fallbackDateCount),
    });
  } catch (error) {
    console.error("Weekly volume query error:", error);
    return res.status(500).json({ message: "Unable to load weekly volume. Please try again." });
  }
}
