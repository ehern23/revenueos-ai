"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { revenueSeries } from "@/lib/dashboard-data";

const chartConfig = {
  actual: {
    label: "Actual revenue",
    color: "#0f172a",
  },
  target: {
    label: "Target",
    color: "#60a5fa",
  },
};

export function RevenueAreaChart() {
  return (
    <Card className="border-slate-200/70 bg-white/80 shadow-sm backdrop-blur">
      <CardHeader>
        <CardTitle>Revenue velocity</CardTitle>
        <CardDescription>
          Actuals versus target across the current operating window.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[320px] w-full">
          <AreaChart
            accessibilityLayer
            data={revenueSeries}
            margin={{ left: 8, right: 8, top: 12 }}
          >
            <defs>
              <linearGradient id="actualFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="var(--color-actual)" stopOpacity={0.28} />
                <stop offset="95%" stopColor="var(--color-actual)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="targetFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="var(--color-target)" stopOpacity={0.18} />
                <stop offset="95%" stopColor="var(--color-target)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => (
                    <div className="flex w-full items-center justify-between gap-8">
                      <span className="text-muted-foreground">{name}</span>
                      <span className="font-medium text-foreground">${value}k</span>
                    </div>
                  )}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="target"
              fill="url(#targetFill)"
              fillOpacity={1}
              stroke="var(--color-target)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="actual"
              fill="url(#actualFill)"
              fillOpacity={1}
              stroke="var(--color-actual)"
              strokeWidth={3}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
