import { engineClient } from "@/lib/paymentEngine";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { data } = await engineClient.get("/admin/reports/reconciliation", {
      params: {
        type: "gift",
        status: "confirmed",
        from: "2020-01-01",
        to: new Date().toISOString(),
        format: "json",
      },
    });

    const { count, summary } = data.data;

    return res.status(200).json({
      success: true,
      count: count || 0,
      totalNaira: summary?.totalNetFiat || 0,
      totalDollar: summary?.totalUsd || 0,
    });
  } catch (error) {
    console.error("Gift summary error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
