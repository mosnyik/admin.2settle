import { NextApiRequest, NextApiResponse } from "next";
import { subscriptions } from "./save_notification";
import webpush from "web-push";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
  }

  const { title, body } = req.body;

  const payload = JSON.stringify({ title, body });

  const sendPromises = subscriptions.map((sub) =>
    webpush.sendNotification(sub, payload).catch((err) => console.error(err))
  );

  await Promise.all(sendPromises);

  res.status(200).json({ success: true });
}
