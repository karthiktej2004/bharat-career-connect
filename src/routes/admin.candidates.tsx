import { createFileRoute } from "@tanstack/react-router";
import { DashShell, PageHeader } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Search, CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/admin/candidates")({
  head: () => ({ meta: [{ title: "Candidates — Admin" }] }),
  component: Candidates,
});

const data = Array.from({ length: 10 }, (_, i) => ({
  id: `BCC-${10001 + i}`,
  name: ["Ramesh K.", "Priya S.", "Mohammed I.", "Lakshmi N.", "Arjun R.", "Suresh M.", "Anita P.", "Vikram J.", "Kiran B.", "Deepa R."][i],
  qual: ["BE/B-Tech", "UG Degree", "ITI", "Diploma", "12th std", "BE/B-Tech", "UG Degree", "ITI", "Diploma", "BE/B-Tech"][i],
  district: ["Bengaluru Urban", "Mysuru", "Hubballi", "Bengaluru Urban", "Bengaluru Urban", "Mysuru", "Hubballi", "Mysuru", "Bengaluru Urban", "Hubballi"][i],
  status: i % 3 === 0 ? "Pending" : i % 3 === 1 ? "Approved" : "Verified",
  attended: i % 2 === 0,
}));

function Candidates() {
  return (
    <DashShell role="admin" nav={adminNav}>
      <PageHeader title="Candidate Management" description="Approve, verify and track all registered candidates." action={
        <Button variant="outline"><Upload className="h-4 w-4 mr-1" />Bulk Import</Button>
      } />
      <Card className="p-4 mb-4 border-border/60 flex gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search by ID, name, district…" /></div>
      </Card>
      <Card className="border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"><Checkbox /></TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Qualification</TableHead>
              <TableHead>District</TableHead>
              <TableHead>Attendance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((c) => (
              <TableRow key={c.id}>
                <TableCell><Checkbox /></TableCell>
                <TableCell className="font-mono text-xs">{c.id}</TableCell>
                <TableCell className="font-medium text-navy">{c.name}</TableCell>
                <TableCell className="text-sm">{c.qual}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{c.district}</TableCell>
                <TableCell>{c.attended ? <Badge className="bg-india-green/15 text-india-green">QR ✓</Badge> : <Badge variant="outline">—</Badge>}</TableCell>
                <TableCell><Badge className={c.status === "Pending" ? "bg-saffron/15 text-saffron" : "bg-india-green/15 text-india-green"}>{c.status}</Badge></TableCell>
                <TableCell><div className="flex gap-1"><Button size="icon" variant="ghost" className="text-india-green"><CheckCircle2 className="h-4 w-4" /></Button><Button size="icon" variant="ghost" className="text-destructive"><XCircle className="h-4 w-4" /></Button></div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </DashShell>
  );
}
