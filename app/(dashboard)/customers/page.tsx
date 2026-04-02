import { PageHeader } from "@/components/dashboard/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { customerSegments, strategicAccounts } from "@/lib/dashboard-data";

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Customers"
        title="Customer intelligence"
        description="Monitor expansion potential, renewal confidence, and the accounts that need leadership attention."
      />

      <section className="grid gap-4 md:grid-cols-3">
        {customerSegments.map((segment) => (
          <Card
            key={segment.name}
            className="border-slate-200/70 bg-white/80 shadow-sm backdrop-blur"
          >
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base">{segment.name}</CardTitle>
                <Badge className="bg-slate-900 text-white hover:bg-slate-900">
                  {segment.count}
                </Badge>
              </div>
              <CardDescription>{segment.summary}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-2xl font-semibold text-slate-950">
                {segment.value}
              </p>
              <p className="text-sm text-emerald-700">{segment.change}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="border-slate-200/70 bg-white/80 shadow-sm backdrop-blur">
        <CardHeader>
          <CardTitle>Strategic accounts</CardTitle>
          <CardDescription>
            Champions, risk signals, and near-term plays for the accounts team.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 xl:grid-cols-2">
          {strategicAccounts.map((account) => (
            <div
              key={account.name}
              className="rounded-3xl border border-slate-200/80 bg-slate-50/90 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="size-11 border border-white bg-slate-900 text-white">
                    <AvatarFallback>{account.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-slate-950">
                      {account.name}
                    </h3>
                    <p className="text-sm text-slate-500">{account.owner}</p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="border-slate-300 bg-white text-slate-700"
                >
                  {account.stage}
                </Badge>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    ARR
                  </p>
                  <p className="mt-1 font-semibold text-slate-950">
                    {account.arr}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Renewal
                  </p>
                  <p className="mt-1 font-semibold text-slate-950">
                    {account.renewal}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Health
                  </p>
                  <p className="mt-1 font-semibold text-emerald-700">
                    {account.health}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-600">{account.nextStep}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
