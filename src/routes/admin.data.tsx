import { createFileRoute } from "@tanstack/react-router";
import { DashShell, PageHeader, StatCard } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Download, Database, History, HardDriveDownload, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/data")({
  head: () => ({ meta: [{ title: "Data Management — Admin" }] }),
  component: DataMgmt,
});

const auditLogs = [
  { user: "S. Reddy", entity: "Candidates", action: "Exported 4,820 rows (Excel)", time: "10 min ago" },
  { user: "P. Nair", entity: "Employers", action: "Bulk import (CSV) — 42 rows", time: "2 hr ago" },
  { user: "K. Singh", entity: "Events", action: "Downloaded PDF report", time: "5 hr ago" },
  { user: "M. Khan", entity: "Candidates", action: "Restored backup v2026-06-30", time: "yesterday" },
];

const backups = [
  { v: "v2026-07-06", size: "184 MB", auto: true },
  { v: "v2026-07-05", size: "182 MB", auto: true },
  { v: "v2026-07-04", size: "181 MB", auto: true },
  { v: "v2026-06-30 (pre-event)", size: "176 MB", auto: false },
];

function DataMgmt() {
  return (
    <DashShell role="admin" nav={adminNav}>
      <PageHeader title="Data Management & System Controls" description="Bulk import/export, audit logs, version control and backup/recovery." />
      <div className="grid sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="Records" value="1.2 M" icon={Database} accent="navy" />
        <StatCard label="Audit Logs" value="24,180" icon={History} accent="saffron" />
        <StatCard label="Backups" value="30 days" icon={HardDriveDownload} accent="india-green" />
        <StatCard label="Storage Used" value="5.4 GB" icon={FileSpreadsheet} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {["Candidates", "Employers", "Events"].map((k) => (
          <Card key={k} className="p-6 border-border/60">
            <h3 className="font-display font-bold text-navy mb-1">{k}</h3>
            <p className="text-xs text-muted-foreground mb-4">Bulk import / export (Excel &amp; CSV) with data filtering.</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => toast.success(`${k} import started`)}><Upload className="h-4 w-4 mr-1" />Import</Button>
              <Button size="sm" className="flex-1 bg-saffron text-navy hover:bg-saffron/90" onClick={() => toast.success(`${k} export queued`)}><Download className="h-4 w-4 mr-1" />Export</Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border/60">
          <div className="p-4 border-b border-border flex items-center gap-2"><History className="h-4 w-4 text-saffron" /><h2 className="font-display font-bold text-navy">Audit Logs — every download</h2></div>
          <Table>
            <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Entity</TableHead><TableHead>Action</TableHead><TableHead>Time</TableHead></TableRow></TableHeader>
            <TableBody>
              {auditLogs.map((l, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium text-navy">{l.user}</TableCell>
                  <TableCell><Badge variant="outline">{l.entity}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{l.action}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{l.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
        <Card className="border-border/60">
          <div className="p-4 border-b border-border flex items-center gap-2"><HardDriveDownload className="h-4 w-4 text-india-green" /><h2 className="font-display font-bold text-navy">Backup &amp; Recovery · Version Control</h2></div>
          <Table>
            <TableHeader><TableRow><TableHead>Version</TableHead><TableHead>Size</TableHead><TableHead>Type</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {backups.map((b) => (
                <TableRow key={b.v}>
                  <TableCell className="font-mono text-xs">{b.v}</TableCell>
                  <TableCell>{b.size}</TableCell>
                  <TableCell><Badge className={b.auto ? "bg-india-green/15 text-india-green" : "bg-saffron/15 text-saffron"}>{b.auto ? "Auto" : "Manual"}</Badge></TableCell>
                  <TableCell><Button size="sm" variant="outline" onClick={() => toast.success(`Restoring ${b.v}…`)}>Restore</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
      <p className="text-xs text-muted-foreground mt-4">Important for data security and compliance (DPDP Act 2023).</p>
    </DashShell>
  );
}
