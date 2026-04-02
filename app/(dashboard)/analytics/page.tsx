import { MetricCard } from "@/components/dashboard/metric-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { RevenueAreaChart } from "@/components/dashboard/revenue-area-chart";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  analyticsHighlights,
  analyticsMetrics,
  channelPerformance,
} from "@/lib/dashboard-data";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analytics"
        title="Revenue analytics"
        description="A quick read on campaign efficiency, win velocity, and segment performance."
      />

      <section className="grid gap-4 md:grid-cols-3">
        {analyticsMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]">
        <RevenueAreaChart />
        <Card className="border-slate-200/70 bg-white/80 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle>Signals worth acting on</CardTitle>
            <CardDescription>
              Highlights generated from the latest performance window.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {analyticsHighlights.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-medium text-slate-900">{item.title}</h3>
                  <Badge
                    variant="outline"
                    className="border-slate-300 bg-white text-slate-700"
                  >
                    {item.delta}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-slate-600">{item.note}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {channelPerformance.map((channel) => (
          <Card
            key={channel.channel}
            className="border-slate-200/70 bg-white/80 shadow-sm backdrop-blur"
          >
            <CardHeader className="space-y-2">
              <CardTitle className="text-base">{channel.channel}</CardTitle>
              <CardDescription>{channel.summary}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm text-slate-500">Revenue influenced</p>
                  <p className="text-2xl font-semibold text-slate-950">
                    {channel.revenue}
                  </p>
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                  {channel.change}
                </Badge>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                Conversion quality:{" "}
                <span className="font-medium text-slate-900">
                  {channel.quality}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
