import type { NextApiRequest, NextApiResponse } from "next";
import type { RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/db";
import { parseEstimateRate, PendingKind } from "@/helper/pending-summary";
import { GIFT_SUMMARY_QUERY, REQUEST_SUMMARY_QUERY } from "./pending-summary-query";

export function pendingSummaryHandler(kind: PendingKind) {
  return async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader("Cache-Control", "no-store");
    if (req.method !== "GET") {
      res.setHeader("Allow", ["GET"]);
      return res.status(405).json({ message: "Only GET requests are allowed." });
    }
    try {
      let estimateRate: string | null = null;
      if (kind === "request") {
        try {
          // Match the rate source used by the payment engine at fulfillment.
          const [rates] = await pool.execute<RowDataPacket[]>("SELECT current_rate FROM rates LIMIT 1");
          estimateRate = parseEstimateRate(rates[0]?.current_rate);
        } catch {
          // The naira total is still valid if a current USD estimate is unavailable.
          estimateRate = null;
        }
      }
      const [rows] = await pool.execute<RowDataPacket[]>(
        kind === "gift" ? GIFT_SUMMARY_QUERY : REQUEST_SUMMARY_QUERY,
        kind === "gift" ? [] : [estimateRate],
      );
      const row = rows[0];
      return res.status(200).json({
        success: true,
        count: Number(row.count),
        totalNaira: String(row.totalNaira),
        totalDollar: row.totalDollar === null ? null : String(row.totalDollar),
        missingRateCount: Number(row.missingRateCount),
        estimatedRateCount: Number(row.estimatedRateCount),
        estimateRate: Number(row.estimatedRateCount) > 0 ? estimateRate : null,
      });
    } catch (error) {
      console.error(`${kind} summary query failed`, error);
      return res.status(500).json({ success: false, message: "Unable to load totals. Please try again." });
    }
  };
}
