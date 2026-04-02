import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Metric } from "@/lib/dashboard-data";

export function MetricCard({ metric }: Readonly<{ metric: Metric }>) {
  const isPositive = metric.trend === "up";
  const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className="border-slate-200/70 bg-white/80 shadow-sm backdrop-blur">
      <CardHeader className="space-y-1">
        <CardDescription>{metric.label}</CardDescription>
        <CardTitle className="text-3xl font-semibold tracking-tight">
          {metric.value}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4 text-sm">
        <span
          className={
            isPositive
              ? "flex items-center gap-1 text-emerald-700"
              : "flex items-center gap-1 text-amber-700"
          }
        >
          <TrendIcon className="size-4" />
          {metric.change}
        </span>
        <span className="text-slate-500">{metric.context}</span>
      </CardContent>
    </Card>
  );
}
