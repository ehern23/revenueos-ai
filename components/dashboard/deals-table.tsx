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
    <Card className="border-slate-200/70 bg-white/80 shadow-sm backdrop-blur">
      <CardHeader>
        <CardTitle>Active opportunities</CardTitle>
        <CardDescription>
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
                <TableCell className="font-medium text-slate-950">
                  {deal.account}
                </TableCell>
                <TableCell className="text-slate-600">{deal.owner}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="border-slate-300 bg-white text-slate-700"
                  >
                    {deal.stage}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium text-slate-950">
                  {deal.arr}
                </TableCell>
                <TableCell className="text-slate-600">
                  {deal.closeDate}
                </TableCell>
                <TableCell className="text-emerald-700">
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
