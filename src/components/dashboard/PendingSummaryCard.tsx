import React, { useEffect, useState } from "react";
import axios from "axios";
import { Gift, Send } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { formatCurrency } from "@/helper/format_currency";
import type { PendingKind, PendingSummary } from "@/helper/pending-summary";

export default function PendingSummaryCard({ kind }: { kind: PendingKind }) {
  const [summary, setSummary] = useState<PendingSummary | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const gift = kind === "gift";
  const Icon = gift ? Gift : Send;
  const title = gift ? "Unclaimed Gifts" : "Unfulfilled Requests";

  useEffect(() => {
    const controller = new AbortController();
    setSummary(null);
    setError(false);
    axios.get<PendingSummary>(`/api/get_${kind}_summary`, { signal: controller.signal })
      .then(({ data }) => { if (!controller.signal.aborted) setSummary(data); })
      .catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, [kind, attempt]);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`rounded-full p-2 ${gift ? "bg-purple-100" : "bg-green-100"}`}>
            <Icon className={`h-4 w-4 ${gift ? "text-purple-600" : "text-green-600"}`} aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1" aria-live="polite" aria-busy={!summary && !error}>
            <p className="text-xs text-gray-600">{title}</p>
            {error ? (
              <p role="alert" className="mt-2 text-sm text-red-600">
                Unable to load totals.{" "}
                <button type="button" className="underline" onClick={() => setAttempt((value) => value + 1)}>Retry</button>
              </p>
            ) : !summary ? (
              <p className="mt-2 text-sm text-gray-500">Loading totals…</p>
            ) : (
              <>
                <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
                  <span className={`text-lg font-bold ${gift ? "text-purple-600" : "text-green-600"}`}>
                    {summary.totalDollar === null ? "USD unavailable" : `${summary.estimatedRateCount > 0 ? "≈ " : ""}${formatCurrency(summary.totalDollar, "USD")}`}
                  </span>
                  <span className="text-sm text-gray-600">{formatCurrency(summary.totalNaira, "NGN", "en-NG")}</span>
                </div>
                <p className="mt-1 text-xs text-gray-600">
                  {summary.count} {gift ? (summary.count === 1 ? "gift" : "gifts") : (summary.count === 1 ? "request" : "requests")}
                </p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
