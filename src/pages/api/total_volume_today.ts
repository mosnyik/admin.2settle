
import mysql, { RowDataPacket } from "mysql2/promise";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
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
    console.log("Database connection established");

        // Define the interface for your transaction rows
interface TransactionRow extends RowDataPacket {
  receiver_amount: string;
  // Add other columns you need from the table
}
 const [rows] = await connection.query<TransactionRow[]>(`
  SELECT * FROM 2settle_transaction_table
  WHERE status = 'Successful'
    AND DATE(Date) = CURDATE()
`);
    

    console.log("Executing query:", rows);

    if (rows.length !== 0) {
          const cleanedAmounts = rows.map(row => {
      const amountString = row.receiver_amount;
      return parseFloat(
        amountString
          .replace(/₦|,/g, '')  // Remove ₦ and commas
          .trim()               // Remove extra spaces
      ) || 0; // Fallback to 0 if parsing fails
    });

    // Sum the cleaned numbers
    const totalAmountFixed = cleanedAmounts.reduce((sum, amount) => sum + amount, 0).toFixed(2);
    const totalAmount = Number(totalAmountFixed).toLocaleString(undefined, { minimumFractionDigits: 2 });
    const dollarAmount =  Number(totalAmountFixed) / 1579.94
    const dollarAmountFixed = dollarAmount.toFixed(2)
    const dollarTotalAmount = Number(dollarAmountFixed).toLocaleString(undefined, { minimumFractionDigits: 2 });

    console.log('Total successful transactions:', totalAmount);
    // res.status(200).json({ totalAmount, dollarTotalAmount });
      // 2. Send a response!
    return res.status(200).json({
      DailyNaira: totalAmount,
      DailyDollar: dollarTotalAmount
    });

    } else {
      const totalAmount = 0
      const dollarTotalAmount = 0
      return res.status(200).json({
      DailyNaira: totalAmount,
      DailyDollar: dollarTotalAmount
    });

       }

    // console.log("Total amount for today:", totalAmount);

    // res.status(200).json({ totalAmount });
  } catch (error) {
    console.error("Database query error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    res.status(500).json({
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : String(error),
    });
  }finally {
    if (connection) {
      await connection.end(); // ✅ Close the connection here
      console.log('Database connection closed');
    }
  }
}
