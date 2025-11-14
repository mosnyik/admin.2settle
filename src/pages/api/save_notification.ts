// import { Subscription } from "@/types/notifications.types";
// import { NextApiRequest, NextApiResponse } from "next";

// // temoprary in memory store for subs
// const subscriptions: Subscription[] = [];
// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method === "POST") {
//     const subscription: Subscription = req.body;

//     subscriptions.push(subscription);
//     await fetch("/api/send_transaction_notification", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         title: "Hello there 👋",
//         body: "This is a test notification!",
//       }),
//     });

//     res.status(201).json({ success: true });
//   } else {
//     res.status(405).json({ error: "Method not allowed" });
//   }
// }

// export { subscriptions };

import { Subscription } from "@/types/notifications.types";
import mysql from "mysql2/promise";
import { NextApiRequest, NextApiResponse } from "next";
const apiURL = process.env.NEXT_PUBLIC_API_URL || "";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const subscription: Subscription = req.body;

    const dbConfig = {
      host: process.env.host,
      user: process.env.user,
      password: process.env.password,
      database: process.env.database,
    };

    let connection;
    try {
      connection = await mysql.createConnection(dbConfig);

      // Save subscription to database
      await connection.execute(
        "INSERT INTO notifications_subscriptions (endpoint, p256dh, auth, expirationTime) VALUES (?, ?, ?, ?)",
        [
          subscription.endpoint,
          subscription.keys.p256dh,
          subscription.keys.auth,
          subscription.expirationTime,
        ]
      );

      // Send test notification
      await fetch(`${apiURL}/api/send_transaction_notification`, {
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
    } catch (error) {
      console.error("Error saving subscription:", error);
      res.status(500).json({ error: "Failed to save subscription" });
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
