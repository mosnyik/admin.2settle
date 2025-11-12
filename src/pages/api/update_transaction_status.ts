import mysql from "mysql2/promise";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  const { transactionId, newStatus } = req.body;
  console.log(transactionId, newStatus);

  const dbConfig = {
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
  };

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute<mysql.OkPacket>(
      `UPDATE 2settle_transaction_table SET status = ? WHERE transac_id = ?`,
      [newStatus, transactionId]
    );

    // Check if any row was updated
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Transaction not found or no changes made" });
    }

    return res.status(200).json({
      success: true,
      message: "Update successful",
      affectedRows: result.affectedRows,
    });
    // =======
    //   const dbHost = process.env.host;
    //   const dbUser = process.env.user;
    //   const dbPassword = process.env.password;
    //   const dbName = process.env.database;

    //     let connection;
    //     try {

    //             connection = await mysql.createConnection({
    //               host: dbHost,
    //               user: dbUser,
    //               password: dbPassword,
    //               database: dbName,
    //             });
    //        const [rows] = await connection.execute<mysql.RowDataPacket[]>(
    //   `UPDATE 2settle_transaction_table SET status = ? WHERE transac_id = ?`,
    //   [newStatus, transactionId] // Parameters passed separately
    // );
    // console.log(rows);
    // >>>>>>> bfd68df (issue is fixed)
  } catch (error) {
    console.error("Update Transaction error:", error);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
}
