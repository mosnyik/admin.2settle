import React from "react";
import { Skeleton } from "../ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

const DashboardSkeleton = () => {
  return Array.from({ length: 5 }).map((_, index) => (
    <TableRow key={index}>
      <TableCell className="hidden md:table-cell">
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-8 w-[100px]" />
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
    </TableRow>
  ));
};

const summaryCardSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-20 bg-gray-300 rounded mb-2" />
    </div>
  );
};

const skeletonComponents = {
  DashboardSkeleton,
  summaryCardSkeleton,
};

export default skeletonComponents;
