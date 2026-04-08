import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deals } from "@/lib/dashboard-data";

export function DealsTable() {
  return (
    <Card className="card-hover border-white/[0.06] bg-[#111827]">
      <CardHeader>
        <CardTitle className="text-slate-100">Active opportunities</CardTitle>
        <CardDescription className="text-slate-400">
          High-signal deals prioritized for this week&apos;s operating review.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>ARR</TableHead>
              <TableHead>Close date</TableHead>
              <TableHead>Confidence</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deals.map((deal) => (
              <TableRow key={deal.account}>
                <TableCell className="font-medium text-slate-100">
                  {deal.account}
                </TableCell>
                <TableCell className="text-slate-400">{deal.owner}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="border-white/[0.1] bg-white/[0.02] text-slate-300"
                  >
                    {deal.stage}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono font-medium text-slate-100">
                  {deal.arr}
                </TableCell>
                <TableCell className="text-slate-400">
                  {deal.closeDate}
                </TableCell>
                <TableCell className="font-mono text-emerald-400">
                  {deal.confidence}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
