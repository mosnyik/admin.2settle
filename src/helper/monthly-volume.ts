export const REPORTING_TIME_ZONE = "Africa/Lagos";

export interface MonthlyVolume {
  month: string;
  totalNaira: string;
  totalDollar: string | null;
  transactionCount: number;
  missingRateCount: number;
  fallbackDateCount: number;
}

export function currentReportingMonth(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: REPORTING_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);
  return `${parts.find((part) => part.type === "year")!.value}-${parts.find((part) => part.type === "month")!.value}`;
}

export function monthBounds(month: string) {
  if (!/^[1-9]\d{3}-(0[1-9]|1[0-2])$/.test(month)) {
    throw new Error("Choose a valid month in YYYY-MM format.");
  }
  const [year, monthNumber] = month.split("-").map(Number);
  // Lagos uses UTC+01:00 with no daylight-saving changes. Send epoch seconds
  // to SQL so the Node process and database session time zones cannot shift bounds.
  return {
    start: (Date.UTC(year, monthNumber - 1, 1) - 3_600_000) / 1000,
    end: (Date.UTC(year, monthNumber, 1) - 3_600_000) / 1000,
  };
}

export function monthLabel(month: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: REPORTING_TIME_ZONE,
  }).format(new Date(monthBounds(month).start * 1000));
}
