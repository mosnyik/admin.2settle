import { formatCurrency } from "@/helper/format_currency";
import { pool } from "@/lib/db";
import axios from "axios";
import { RowDataPacket } from "mysql2/promise";
import { NextApiRequest, NextApiResponse } from "next";
import { cleanValue } from "./get_YTD_google";

interface VolumeAmount {
  nairaAmount: number;
  dollarAmount: number;
}

const calculateTotals = (amounts: VolumeAmount[]) => {
  const nairaTotal = amounts.reduce((s, a) => s + a.nairaAmount, 0);
  const dollarTotal = amounts.reduce((s, a) => s + a.dollarAmount, 0);
  return {
    naira: nairaTotal.toLocaleString(undefined, { minimumFractionDigits: 2 }),
    dollar: dollarTotal.toLocaleString(undefined, { minimumFractionDigits: 2 }),
  };
};

const apiURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [googleResult, rows] = await Promise.all([
      axios
        .get<{ status: boolean; data: { nairaAmount: number; dollarAmount: number } }>(
          `${apiURL}/api/get_YTD_google`
        )
        .catch(() => null),
      pool.execute<RowDataPacket[]>(
        `SELECT fiat_amount, charge_amount, rate, settled_at, created_at
         FROM payment_sessions
         WHERE status = 'settled'
           AND COALESCE(settled_at, created_at) >= ? AND COALESCE(settled_at, created_at) <= ?`,
        [startOfYear, now]
      ).then(([r]) => r),
    ]);

    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const dailyClean: VolumeAmount[] = [];
    const weeklyClean: VolumeAmount[] = [];
    const monthlyClean: VolumeAmount[] = [];
    const ytdClean: VolumeAmount[] = [];

    for (const row of rows) {
      const paymentDate = new Date((row.settled_at ?? row.created_at) as string);
      const nairaAmount = Number(row.fiat_amount) - Number(row.charge_amount ?? 0);
      const dollarAmount = Number(row.rate) > 0 ? nairaAmount / Number(row.rate) : 0;
      const amount: VolumeAmount = { nairaAmount, dollarAmount };

      ytdClean.push(amount);
      if (paymentDate.toDateString() === today.toDateString()) dailyClean.push(amount);
      if (paymentDate >= oneWeekAgo) weeklyClean.push(amount);
      if (paymentDate >= startOfMonth) monthlyClean.push(amount);
    }

    const { naira: Dailynaira, dollar: Dailydollar } = calculateTotals(dailyClean);
    const { naira: Weeklynaira, dollar: Weeklydollar } = calculateTotals(weeklyClean);
    const { naira: Monthlynaira, dollar: Monthlydollar } = calculateTotals(monthlyClean);

    const { naira: ytdNairaStr, dollar: ytdDollarStr } = calculateTotals(ytdClean);
    const googleData = googleResult?.data?.data ?? { nairaAmount: 0, dollarAmount: 0 };

    const ytdNairaNum = (cleanValue(ytdNairaStr) as number) + googleData.nairaAmount;
    const ytdDollarNum = (cleanValue(ytdDollarStr) as number) + googleData.dollarAmount;

    const YTDnaira = formatCurrency(ytdNairaNum.toFixed(4), "NGN", "en-NG");
    const YTDdollar = formatCurrency(ytdDollarNum.toFixed(4), "USD");

    return res.status(200).json({
      YTDnaira,
      YTDdollar,
      Dailynaira,
      Dailydollar,
      Weeklynaira,
      Weeklydollar,
      Monthlynaira,
      Monthlydollar,
    });
  } catch (error) {
    console.error("Volume query error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
