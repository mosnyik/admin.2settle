import { NextApiRequest, NextApiResponse } from "next";
import mysql from "mysql2/promise";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { notificationId } = req.body;

  const dbConfig = {
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
  };

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    await connection.execute(
      "UPDATE notifications_list SET is_read = 1 WHERE id = ?",
      [notificationId]
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
