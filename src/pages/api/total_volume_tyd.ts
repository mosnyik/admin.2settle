// import { TotalAmountResult } from "@/types/general-types";
import mysql, { RowDataPacket } from "mysql2/promise";
import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { cleanValue } from "./get_YTD_google";
import { formatCurrency } from "@/helper/format_currency";

interface TransactionRow extends RowDataPacket {
  receiver_amount: string;
  current_rate: string;
  status: string;
  Date: string;
}

interface CleanedAmount {
  nairaAmount: number;
  dollarAmount: number;
}

export const removeString = (
  amountString: string,
  rateString: string
): CleanedAmount => {
  const amount = parseFloat(amountString.replace(/[$₦,]/g, "").trim()) || 0;
  const rate = parseFloat(rateString.replace(/[$₦,]/g, "").trim()) || 0;
  const dollarAmount = rate > 0 ? amount / rate : 0;
  return { nairaAmount: amount, dollarAmount };
};

const calculateTotalAmounts = (amounts: CleanedAmount[]) => {
  const nairaTotal = amounts.reduce((sum, a) => sum + a.nairaAmount, 0);
  const dollarTotal = amounts.reduce((sum, a) => sum + a.dollarAmount, 0);
  return {
    naira: nairaTotal.toLocaleString(undefined, { minimumFractionDigits: 2 }),
    dollar: dollarTotal.toLocaleString(undefined, { minimumFractionDigits: 2 }),
  };
};

// const getGoogleCredentials = () => {
//   const base64 = process.env.GOOGLE_CREDENTIALS_BASE64;
//   if (!base64)
//     throw new Error("Google credentials missing in environment variables");
//   return JSON.parse(Buffer.from(base64, "base64").toString("utf-8"));
// };

const apiURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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
    const repsonse = await axios.get<{
      status: boolean;
      data: { nairaAmount: number; dollarAmount: number };
    }>(`${apiURL}/api/get_YTD_google`);

    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.query<TransactionRow[]>(`
      SELECT * FROM 2settle_transaction_table
      WHERE status = 'Successful'
    `);

    const cleanedAmounts = rows.map((row) =>
      removeString(row.receiver_amount, row.current_rate)
    );

    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);

    const dailyClean = [];
    const weeklyClean = [];
    const monthlyClean = [];

    for (const row of rows) {
      const [time, date] = row.Date.split(" ");
      const [day, month, year] = date.split("/");
      let [hour] = time.slice(0, -2).split(":");
      const [minute] = time.slice(0, -2).split(":");
      const ampm = time.slice(-2);

      if (ampm === "PM" && hour !== "12")
        hour = (parseInt(hour) + 12).toString();
      if (ampm === "AM" && hour === "12") hour = "00";

      const isoString = `${year}-${month}-${day}T${hour.padStart(
        2,
        "0"
      )}:${minute.padStart(2, "0")}:00`;
      const dateObj = new Date(isoString);

      const cleaned = removeString(row.receiver_amount, row.current_rate);

      // Daily
      if (dateObj.toDateString() === today.toDateString()) {
        dailyClean.push(cleaned);
      }

      // Weekly
      if (dateObj >= oneWeekAgo && dateObj <= today) {
        weeklyClean.push(cleaned);
      }

      // Monthly
      if (
        dateObj.getMonth() === today.getMonth() &&
        dateObj.getFullYear() === today.getFullYear()
      ) {
        monthlyClean.push(cleaned);
      }
    }

    const { naira: Dailynaira = "0.00", dollar: Dailydollar = "0.00" } =
      calculateTotalAmounts(dailyClean);

    const { naira: Weeklynaira = "0.00", dollar: Weeklydollar = "0.00" } =
      calculateTotalAmounts(weeklyClean);

    const { naira: Monthlynaira = "0.00", dollar: Monthlydollar = "0.00" } =
      calculateTotalAmounts(monthlyClean);

    const getYTDValues = (): { YTDnaira: string; YTDdollar: string } => {
      const { naira, dollar } = calculateTotalAmounts(cleanedAmounts);

      const dollarValue = (
        parseFloat(cleanValue(dollar).toString()) +
        repsonse.data.data.dollarAmount
      ).toFixed(4);
      const nairaValue = (
        parseFloat(cleanValue(naira).toString()) +
        repsonse.data.data.nairaAmount
      ).toFixed(4);
      let YTDdollar = dollarValue.toString();
      let YTDnaira = nairaValue.toString();
      YTDnaira = formatCurrency(YTDnaira, "NGN", "en-NG");
      YTDdollar = formatCurrency(YTDdollar, "USD");
      return { YTDnaira, YTDdollar };
    };

    const { YTDnaira, YTDdollar } = getYTDValues();

    return res.status(200).json({
      YTDnaira,
      YTDdollar,
      Dailynaira,
      Dailydollar,
      Weeklynaira,
      Weeklydollar,
      Monthlynaira,
      Monthlydollar,
    });
  } catch (error) {
    console.error("Database query error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : String(error),
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
