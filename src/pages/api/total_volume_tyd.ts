import { formatCurrency } from "@/helper/format_currency";
import { engineClient } from "@/lib/paymentEngine";
import axios from "axios";
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
    const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString();

    const [googleRes, reconRes] = await Promise.all([
      axios.get<{ status: boolean; data: { nairaAmount: number; dollarAmount: number } }>(
        `${apiURL}/api/get_YTD_google`
      ),
      engineClient.get("/admin/reports/reconciliation", {
        params: {
          from: startOfYear,
          to: now.toISOString(),
          status: "settled",
          format: "json",
        },
      }),
    ]);

    const payments: Record<string, unknown>[] = reconRes.data.data.payments ?? [];

    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const dailyClean: VolumeAmount[] = [];
    const weeklyClean: VolumeAmount[] = [];
    const monthlyClean: VolumeAmount[] = [];
    const ytdClean: VolumeAmount[] = [];

    for (const p of payments) {
      const paymentDate = new Date(p.created_at as string);
      const nairaAmount =
        Number(p.net_fiat_amount) ||
        Number(p.fiat_amount) - Number(p.charge_amount ?? 0);
      const dollarAmount =
        Number(p.transaction_usd) || nairaAmount / Number(p.rate || 1);
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
    const googleData = googleRes.data.data;

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
