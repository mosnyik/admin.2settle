import { engineClient, mapPayment } from "@/lib/paymentEngine";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { data } = await engineClient.get("/admin/payments", {
      params: { type: "gift", status: "confirmed", limit: 200 },
    });

    const rows = (data.data.payments as Record<string, unknown>[]).map(mapPayment);

    return res.status(200).json({
      success: true,
      count: data.data.total,
      data: rows,
    });
  } catch (error) {
    console.error("Pending gifts error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
