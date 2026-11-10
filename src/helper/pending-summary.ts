export type PendingKind = "gift" | "request";

export interface PendingSummary {
  count: number;
  totalNaira: string;
  totalDollar: string | null;
  missingRateCount: number;
  estimatedRateCount: number;
  estimateRate: string | null;
}

export function parseEstimateRate(value: unknown): string | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const normalized = String(value).trim().replace(/,/g, "");
  return /^\d+(\.\d{1,4})?$/.test(normalized) && Number(normalized) > 0
    && Number.isFinite(Number(normalized)) ? normalized : null;
}
