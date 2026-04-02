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
            <Button variant="outline">View requirements</Button>
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              Open workflow
              <ArrowRight />
            </Button>
          </>
        }
      />

      <Card className="border-slate-200 bg-slate-50 shadow-sm">
        <CardHeader className="gap-3">
          <Badge className="w-fit border border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-50">
            <Sparkles className="mr-1 size-3.5" />
            Placeholder view
          </Badge>
          <CardTitle className="text-2xl text-slate-950">
            {page.label} is ready for feature implementation
          </CardTitle>
          <CardDescription className="max-w-2xl text-base leading-7 text-slate-600">
            {page.purpose}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-medium text-slate-500">Primary purpose</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{page.purpose}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-medium text-slate-500">Design direction</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              This page now sits inside the persistent application shell with the
              left sidebar navigation and SaaS dashboard styling.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-medium text-slate-500">Next step</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Replace this placeholder card with the final workflow, widgets,
              and page-specific data when you are ready.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
