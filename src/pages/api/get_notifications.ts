import { NextApiRequest, NextApiResponse } from "next";
import mysql from "mysql2/promise";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const dbConfig = {
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
  };

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    const [notifications] = await connection.query<any[]>(
      "SELECT id, title, body, is_read, created_at FROM notifications_list ORDER BY created_at DESC LIMIT 50"
    );

    res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
