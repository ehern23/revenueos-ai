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
    <Card className="card-hover border-white/[0.06] bg-[#111827]">
      <CardHeader className="space-y-1">
        <CardDescription className="text-slate-500">{metric.label}</CardDescription>
        <CardTitle className="font-mono text-3xl font-semibold tracking-tight text-slate-100">
          {metric.value}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4 text-sm">
        <span
          className={
            isPositive
              ? "flex items-center gap-1 font-mono text-emerald-400"
              : "flex items-center gap-1 font-mono text-amber-500"
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
