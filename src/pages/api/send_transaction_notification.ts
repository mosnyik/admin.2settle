// import { NextApiRequest, NextApiResponse } from "next";
// import { subscriptions } from "./save_notification";
// import webpush from "web-push";

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== "POST") {
//     res.status(405).json({ error: "Method not allowed" });
//   }

//   const { title, body } = req.body;

//   const payload = JSON.stringify({ title, body });

//   const sendPromises = subscriptions.map((sub) =>
//     webpush.sendNotification(sub, payload).catch((err) => console.error(err))
//   );

//   await Promise.all(sendPromises);

//   res.status(200).json({ success: true });
// }

import { NextApiRequest, NextApiResponse } from "next";
import mysql from "mysql2/promise";
import webpush from "web-push";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { title, body } = req.body;

  const dbConfig = {
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
  };

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    // Fetch all subscriptions from database
    const [subscriptions] = await connection.query<any[]>(
      "SELECT endpoint, p256dh, auth, expirationTime FROM notifications_subscriptions"
    );

    const payload = JSON.stringify({ title, body });

    // Send notifications to all subscriptions
    const sendPromises = (subscriptions as any[]).map((sub) => {
      const subscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
        expirationTime: sub.expirationTime,
      };
      return webpush.sendNotification(subscription, payload).catch((err) => {
        console.error("Error sending notification:", err);
      });
    });

    await Promise.all(sendPromises);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error sending notifications:", error);
    res.status(500).json({ error: "Failed to send notifications" });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
