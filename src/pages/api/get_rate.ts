import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

const engineURL = process.env.PAYMENT_ENGINE_URL || "http://localhost:3500";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { data } = await axios.get(`${engineURL}/v1/rate`);
    return res.status(200).json(data);
  } catch (error) {
    console.error("Rate fetch error:", error);
    return res.status(500).send("Server error");
  }
}
