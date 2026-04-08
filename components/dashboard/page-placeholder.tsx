import { ArrowRight, Sparkles } from "lucide-react";

import { appNavigation } from "@/lib/app-navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";

export function PagePlaceholder({
  href,
}: Readonly<{
  href: string;
}>) {
  const page = appNavigation.find((item) => item.href === href);

  if (!page) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Application Shell"
        title={page.label}
        description={page.description}
        actions={
          <>
            <Button
              variant="outline"
              className="border-white/[0.06] bg-transparent text-slate-300 hover:bg-white/[0.04] hover:text-slate-100"
            >
              View requirements
            </Button>
            <Button className="bg-amber-500 text-[#0A0E17] shadow-lg shadow-amber-500/20 hover:bg-amber-400">
              Open workflow
              <ArrowRight />
            </Button>
          </>
        }
      />

      <Card className="card-hover border-white/[0.06] bg-[#111827]">
        <CardHeader className="gap-3">
          <Badge className="w-fit border border-amber-500/20 bg-amber-500/10 text-amber-500 hover:bg-amber-500/10">
            <Sparkles className="mr-1 size-3.5" />
            Placeholder view
          </Badge>
          <CardTitle className="text-2xl text-slate-100">
            {page.label} is ready for feature implementation
          </CardTitle>
          <CardDescription className="max-w-2xl text-base leading-relaxed text-slate-400">
            {page.purpose}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-sm font-medium text-slate-500">Primary purpose</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{page.purpose}</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-sm font-medium text-slate-500">Design direction</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              This page now sits inside the persistent application shell with the
              left sidebar navigation and premium dark theme styling.
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-sm font-medium text-slate-500">Next step</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Replace this placeholder card with the final workflow, widgets,
              and page-specific data when you are ready.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
