import { engineClient } from "@/lib/paymentEngine";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { transactionId, newStatus } = req.body as {
    transactionId: string;
    newStatus: string;
  };

  if (!transactionId || !newStatus) {
    return res.status(400).json({ error: "transactionId and newStatus are required" });
  }

  if (newStatus !== "settled") {
    return res.status(400).json({
      error: `Status '${newStatus}' cannot be set manually. Only 'settled' is supported.`,
    });
  }

  try {
    const response = await engineClient.post(`/admin/api-keys/sessions/${transactionId}/settle`);
    return res.status(200).json({ success: true, message: response.data.message });
  } catch (error: unknown) {
    const axiosError = error as { response?: { status: number; data: { error?: string } } };
    const status = axiosError.response?.status ?? 500;
    const message = axiosError.response?.data?.error ?? "Failed to settle transaction";
    return res.status(status).json({ success: false, error: message });
  }
}
