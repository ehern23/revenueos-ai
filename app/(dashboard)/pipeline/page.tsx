import { DealsTable } from "@/components/dashboard/deals-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { pipelineStages } from "@/lib/dashboard-data";

export default function PipelinePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Pipeline"
        title="Deal flow and stage health"
        description="Review stage throughput, identify bottlenecks, and keep reps aligned around next actions."
      />

      <section className="grid gap-4 xl:grid-cols-4">
        {pipelineStages.map((stage) => (
          <Card
            key={stage.name}
            className="border-slate-200/70 bg-white/80 shadow-sm backdrop-blur"
          >
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base">{stage.name}</CardTitle>
                <Badge
                  variant="outline"
                  className="border-slate-300 bg-white text-slate-700"
                >
                  {stage.deals} deals
                </Badge>
              </div>
              <CardDescription>{stage.summary}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm text-slate-500">Pipeline value</p>
                  <p className="text-2xl font-semibold text-slate-950">
                    {stage.value}
                  </p>
                </div>
                <span className="text-sm font-medium text-emerald-700">
                  {stage.change}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Progress to target</span>
                  <span>{stage.progress}%</span>
                </div>
                <Progress value={stage.progress} className="h-2 bg-slate-200" />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <DealsTable />
    </div>
  );
}
