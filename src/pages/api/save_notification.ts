import { Subscription } from "@/types/notifications.types";
import { NextApiRequest, NextApiResponse } from "next";

// temoprary in memory store for subs
let subscriptions: Subscription[] = [];
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const subscription: Subscription = req.body;

    subscriptions.push(subscription);
    await fetch("/api/send_transaction_notification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Hello there 👋",
        body: "This is a test notification!",
      }),
    });

    res.status(201).json({ success: true });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

export { subscriptions };
