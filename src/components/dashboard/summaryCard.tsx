import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../ui/card";
import * as LucideIcons from "lucide-react";
import axios from "axios";
import MonthlyVolumeCard from "./MonthlyVolumeCard";
import WeeklyVolumeCard from "./WeeklyVolumeCard";

import Skeleton from "../transactions/Skeleton";
import PendingSummaryCard from "./PendingSummaryCard";
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

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const { data: d } = await axios.get("/api/total_volume_tyd");
        setYtd(d.YTDnaira);
        setDollarYtd(d.YTDdollar);
        setDaily(d.Dailynaira);
        setDollarDaily(d.Dailydollar);
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

    return "0.00"; // default
  };
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {["YTD"].map((period) => (
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
        <MonthlyVolumeCard />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {["Daily"].map((period) => (
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
        <WeeklyVolumeCard />
        <PendingSummaryCard kind="gift" />
        <PendingSummaryCard kind="request" />
      </div>
    </>
  );
}
export default SummaryCard;
