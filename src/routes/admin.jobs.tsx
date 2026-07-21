import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashShell, PageHeader } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, Briefcase } from "lucide-react";
import { listPostedJobs, reviewJob, type Job } from "@/lib/mockStore";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/jobs")({
  head: () => ({ meta: [{ title: "Job Approvals — Admin" }] }),
  component: AdminJobs,
});

function AdminJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  useEffect(() => {
    const sync = () => setJobs(listPostedJobs());
    sync();
    window.addEventListener("bcc-jobs", sync);
    return () => window.removeEventListener("bcc-jobs", sync);
  }, []);

  const pending = jobs.filter((j) => (j.approvalStatus ?? "pending") === "pending");
  const approved = jobs.filter((j) => j.approvalStatus === "approved");
  const rejected = jobs.filter((j) => j.approvalStatus === "rejected");

  function act(j: Job, status: "approved" | "rejected") {
    reviewJob(j.id, status);
    toast.success(`"${j.title}" ${status}`);
  }

  return (
    <DashShell role="admin" nav={adminNav}>
      <PageHeader
        title="Job Approvals"
        description="Review jobs submitted by employers. Only approved jobs are visible to candidates."
        action={<Badge className="bg-saffron/15 text-saffron gap-1"><Briefcase className="h-3 w-3" />{pending.length} pending</Badge>}
      />
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending"><JobTable jobs={pending} showActions onAct={act} /></TabsContent>
        <TabsContent value="approved"><JobTable jobs={approved} /></TabsContent>
        <TabsContent value="rejected"><JobTable jobs={rejected} /></TabsContent>
      </Tabs>
    </DashShell>
  );
}

function JobTable({ jobs, showActions, onAct }: { jobs: Job[]; showActions?: boolean; onAct?: (j: Job, s: "approved" | "rejected") => void }) {
  if (!jobs.length) return <Card className="p-6 text-center text-muted-foreground border-border/60 mt-4">No jobs in this bucket.</Card>;
  return (
    <Card className="border-border/60 mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Posted</TableHead>
            {showActions && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((j) => (
            <TableRow key={j.id}>
              <TableCell className="font-medium text-navy">{j.title}</TableCell>
              <TableCell>{j.company}</TableCell>
              <TableCell><Badge variant="outline">{j.type}</Badge></TableCell>
              <TableCell className="text-muted-foreground">{j.location}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{new Date(j.postedAt).toLocaleDateString("en-IN")}</TableCell>
              {showActions && (
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" className="bg-india-green text-white hover:bg-india-green/90" onClick={() => onAct?.(j, "approved")}>
                      <CheckCircle2 className="h-4 w-4 mr-1" />Approve
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive border-destructive/40 hover:bg-destructive/10" onClick={() => onAct?.(j, "rejected")}>
                      <XCircle className="h-4 w-4 mr-1" />Reject
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
