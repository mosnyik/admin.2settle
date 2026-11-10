import React, { useEffect, useState } from "react";
import axios from "axios";
import { DollarSign } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { currentReportingMonth, monthLabel, MonthlyVolume } from "@/helper/monthly-volume";
import { currentReportingWeek, weekLabel } from "@/helper/weekly-volume";

import { formatCurrency } from "@/helper/format_currency";

type Period = "month" | "week";
type Volume = Omit<MonthlyVolume, "month"> & { month?: string; week?: string };
const periods = {
  month: { title: "Monthly", current: currentReportingMonth, label: monthLabel },
  week: { title: "Weekly", current: currentReportingWeek, label: weekLabel },
};

export default function PeriodVolumeCard({ period }: { period: Period }) {
  const config = periods[period];
  // Resolve the period on the client to avoid a hydration mismatch at midnight.
  const [selection, setSelection] = useState("");
  const [volume, setVolume] = useState<Volume | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => setSelection(config.current()), [config]);

  useEffect(() => {
    if (!selection) return;
    const controller = new AbortController();
    setVolume(null);
    setError("");
    axios.get<Volume>(`/api/total_volume_this_${period}`, {
      params: { [period]: selection },
      signal: controller.signal,
    }).then(({ data }) => {
      if (!controller.signal.aborted) setVolume(data);
    }).catch(() => {
      if (!controller.signal.aborted) setError(`Unable to load this ${period}’s totals.`);
    });
    return () => controller.abort();
  }, [selection, attempt, period]);

  // Never display a previous period's totals while a new request is pending.
  const selectedVolume = volume?.[period] === selection ? volume : null;
  const loading = !selectedVolume && !error;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <label htmlFor={`volume-${period}`} className="text-xs font-medium text-gray-600">
            Total {config.title} Volume
          </label>
          <input
            id={`volume-${period}`}
            type={period}
            value={selection}
            max={config.current()}
            aria-label={`Volume ${period}`}
            onChange={(event) => {
              const value = event.target.value;
              if (value && value <= config.current()) {
                setError("");
                setSelection(value);
              }
            }}
            className="min-w-0 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div className="flex items-start gap-3" aria-busy={loading} aria-live="polite">
          <div className="rounded-full bg-blue-100 p-2">
            <DollarSign className="h-4 w-4 text-blue-600" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            {error ? (
              <div role="alert" className="text-sm text-red-600">
                {error}{" "}
                <button type="button" className="underline" onClick={() => setAttempt((value) => value + 1)}>
                  Retry
                </button>
              </div>
            ) : loading ? (
              <p className="text-sm text-gray-500">Loading totals…</p>
            ) : selectedVolume && (
              <>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-lg font-bold text-blue-600">
                    {selectedVolume.totalDollar === null
                      ? "USD unavailable"
                      : formatCurrency(selectedVolume.totalDollar, "USD")}
                  </span>
                  <span className="text-sm text-gray-600">
                    {formatCurrency(selectedVolume.totalNaira, "NGN", "en-NG")}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-600">
                  {config.label(selection)} · {selectedVolume.transactionCount} settled payments
                </p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
