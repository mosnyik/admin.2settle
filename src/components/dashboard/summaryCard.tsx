import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../ui/card";
import * as LucideIcons from "lucide-react";
import axios from "axios";

import Skeleton from "../transactions/Skeleton";
// import useVolumeStore from "@/stores.ts/volumeStore";
// 1. First define a type for your error object
export interface ApiError {
  response?: {
    status: number;
    data: { message: string };
  };
  request?: XMLHttpRequest;
  message: string;
}

// 2. Define props with that type
interface SummaryCardProps {
  handleError: (error: ApiError) => void;
}

function SummaryCard({ handleError }: SummaryCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const [ytd, setYtd] = useState();
  const [dollarYtd, setDollarYtd] = useState();

  const [daily, setDaily] = useState();
  const [dollarDaily, setDollarDaily] = useState();

  const [weekly, setWeekly] = useState();
  const [dollarWeekly, setDollarWeekly] = useState();

  const [monthly, setMonthly] = useState();
  const [dollarMonthly, setDollarMonthly] = useState();

  const [giftCount, setGiftCount] = useState(0);
  const [giftTotalNaira, setGiftTotalNaira] = useState(0);
  const [giftTotalDollar, setGiftTotalDollar] = useState(0);

  const [requestCount, setRequestCount] = useState(0);
  const [requestTotalNaira, setRequestTotalNaira] = useState(0);
  const [requestTotalDollar, setRequestTotalDollar] = useState(0);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const [volumeResult, giftResult, requestResult] = await Promise.allSettled([
          axios.get("/api/total_volume_tyd"),
          axios.get("/api/get_gift_summary"),
          axios.get("/api/get_request_summary"),
        ]);

        if (volumeResult.status === "fulfilled") {
          const d = volumeResult.value.data;
          setYtd(d.YTDnaira);
          setDollarYtd(d.YTDdollar);
          setDaily(d.Dailynaira);
          setDollarDaily(d.Dailydollar);
          setWeekly(d.Weeklynaira);
          setDollarWeekly(d.Weeklydollar);
          setMonthly(d.Monthlynaira);
          setDollarMonthly(d.Monthlydollar);
        } else {
          console.error("Volume fetch failed:", volumeResult.reason);
        }

        if (giftResult.status === "fulfilled") {
          const d = giftResult.value.data;
          setGiftCount(d.count);
          setGiftTotalNaira(d.totalNaira);
          setGiftTotalDollar(d.totalDollar);
        } else {
          console.error("Gift summary fetch failed:", giftResult.reason);
        }

        if (requestResult.status === "fulfilled") {
          const d = requestResult.value.data;
          setRequestCount(d.count);
          setRequestTotalNaira(d.totalNaira);
          setRequestTotalDollar(d.totalDollar);
        } else {
          console.error("Request summary fetch failed:", requestResult.reason);
        }
      } catch (error) {
        handleError(error as ApiError);
        console.error("Error fetching summary data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, [handleError]);

  const mydata = (period: string, currency: string) => {
    if (period === "YTD" && currency === "naira") return ytd;
    if (period === "YTD" && currency === "dollar") return dollarYtd;

    if (period === "Daily" && currency === "naira") return daily;
    if (period === "Daily" && currency === "dollar") return dollarDaily;

    if (period === "Weekly" && currency === "naira") return weekly;
    if (period === "Weekly" && currency === "dollar") return dollarWeekly;

    if (period === "Monthly" && currency === "naira") return monthly;
    if (period === "Monthly" && currency === "dollar") return dollarMonthly;
    return "0.00"; // default
  };
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {["YTD", "Monthly"].map((period) => (
          <Card key={period}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <LucideIcons.DollarSign className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <span className="text-lg font-bold text-blue-600">
                    {isLoading
                      ? Skeleton.summaryCardSkeleton()
                      : `${mydata(period, "dollar") ?? "0.00"}`}
                  </span>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">
                      {isLoading
                        ? Skeleton.summaryCardSkeleton()
                        : `Total ${period} Volume`}
                    </span>
                    <span className="text-xs text-gray-600">
                      {isLoading
                        ? Skeleton.summaryCardSkeleton()
                        : `${mydata(period, "naira") ?? "0.00"}`}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {["Daily", "Weekly"].map((period) => (
          <Card key={period}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <LucideIcons.DollarSign className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <span className="text-lg font-bold text-blue-600">
                    {isLoading
                      ? Skeleton.summaryCardSkeleton()
                      : `${mydata(period, "dollar") ?? "0.00"}`}
                  </span>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">
                      {isLoading
                        ? Skeleton.summaryCardSkeleton()
                        : `Total ${period} Volume`}
                    </span>
                    <span className="text-xs text-gray-600">
                      {isLoading
                        ? Skeleton.summaryCardSkeleton()
                        : `${mydata(period, "naira") ?? "0.00"}`}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <LucideIcons.Gift className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <span className="text-lg font-bold text-purple-600">
                  {isLoading
                    ? Skeleton.summaryCardSkeleton()
                    : `$${giftTotalDollar.toFixed(2)} (${giftCount} gifts)`}
                </span>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">
                    {isLoading
                      ? Skeleton.summaryCardSkeleton()
                      : "Unclaimed Gifts"}
                  </span>
                  <span className="text-xs text-gray-600">
                    {isLoading
                      ? Skeleton.summaryCardSkeleton()
                      : `₦${giftTotalNaira.toFixed(2)}`}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <LucideIcons.Send className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <span className="text-lg font-bold text-green-600">
                  {isLoading
                    ? Skeleton.summaryCardSkeleton()
                    : `$${requestTotalDollar.toFixed(2)} (${requestCount})`}
                </span>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">
                    {isLoading
                      ? Skeleton.summaryCardSkeleton()
                      : "Unfulfilled Requests"}
                  </span>
                  <span className="text-xs text-gray-600">
                    {isLoading
                      ? Skeleton.summaryCardSkeleton()
                      : `₦${requestTotalNaira.toFixed(2)}`}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
export default SummaryCard;
