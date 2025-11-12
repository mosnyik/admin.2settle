import { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";
import axios from "axios";
import { ServerData } from "@/types/general-types";

export const cleanValue = (value: string) => {
  if (!value) {
    return 0.0;
  }
  return parseFloat(value.replace(/[N$₦,]/g, ""));
};
const getGoogleCredentials = () => {
  const base64 = process.env.GOOGLE_CREDENTIALS_BASE64;
  if (!base64)
    throw new Error("Google credentials missing in environment variables");
  return JSON.parse(Buffer.from(base64, "base64").toString("utf-8"));
};
const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res
      .status(400)
      .json({ status: false, message: "Only GET requests allowed" });
  }

  // fetch the volume from excel
  const sheetID = process.env.SHEET_ID;
  const range = process.env.RANGE;
  const credentials = getGoogleCredentials();

  const { data: rawRate } = await axios.get<ServerData>(
    `${apiURL}/api/get_rate`
  );
  const { rate } = rawRate;

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetID,
    range: range,
  });

  const value = response.data.values ? response.data.values[0][0] : null;

  const dollarValue = cleanValue(value);
  const exchangeRate = cleanValue(rate);
  const nairaValue = dollarValue * exchangeRate;
  const nairaAmount = nairaValue;
  const dollarAmount = dollarValue;
  const data = { nairaAmount, dollarAmount };

  res.status(200).json({ status: true, data });
}
