import { createFileRoute } from "@tanstack/react-router";
import { DashShell, PageHeader } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Star, CheckCircle2, XCircle, Ban } from "lucide-react";

export const Route = createFileRoute("/admin/employers")({
  head: () => ({ meta: [{ title: "Employers — Admin" }] }),
  component: Employers,
});

const list = [
  { id: "EMP-001", name: "Infosys", gst: "Verified", jobs: 24, rating: 4.7, status: "Active" },
  { id: "EMP-002", name: "Wipro", gst: "Verified", jobs: 18, rating: 4.5, status: "Active" },
  { id: "EMP-003", name: "Bosch Limited", gst: "Verified", jobs: 12, rating: 4.6, status: "Active" },
  { id: "EMP-004", name: "Reliance Retail", gst: "Verified", jobs: 32, rating: 4.2, status: "Active" },
  { id: "EMP-005", name: "Acme Pvt Ltd", gst: "Pending", jobs: 4, rating: 3.8, status: "Pending" },
  { id: "EMP-006", name: "Beta Solutions", gst: "Rejected", jobs: 0, rating: 2.1, status: "Blacklisted" },
];

function Employers() {
  return (
    <DashShell role="admin" nav={adminNav}>
      <PageHeader title="Employer Management" description="Approve, verify and rate employer participation." />
      <Card className="border-border/60">
        <Table>
          <TableHeader>
            <TableRow><TableHead>ID</TableHead><TableHead>Company</TableHead><TableHead>GST</TableHead><TableHead>Active Jobs</TableHead><TableHead>Rating</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {list.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-mono text-xs">{e.id}</TableCell>
                <TableCell className="font-medium text-navy">{e.name}</TableCell>
                <TableCell><Badge className={e.gst === "Verified" ? "bg-india-green/15 text-india-green" : e.gst === "Pending" ? "bg-saffron/15 text-saffron" : "bg-destructive/15 text-destructive"}>{e.gst}</Badge></TableCell>
                <TableCell>{e.jobs}</TableCell>
                <TableCell><span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-saffron text-saffron" />{e.rating}</span></TableCell>
                <TableCell><Badge className={e.status === "Active" ? "bg-india-green/15 text-india-green" : e.status === "Pending" ? "bg-saffron/15 text-saffron" : "bg-destructive/15 text-destructive"}>{e.status}</Badge></TableCell>
                <TableCell><div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="text-india-green"><CheckCircle2 className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-destructive"><XCircle className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-destructive"><Ban className="h-4 w-4" /></Button>
                </div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </DashShell>
  );
}
