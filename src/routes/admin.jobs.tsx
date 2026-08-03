import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DashShell, PageHeader } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, Briefcase, Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface Job {
  id: string;
  title: string;
  company_name: string;
  job_type: string;
  location: string;
  created_at: string;
  status: "pending" | "approved" | "rejected" | "inactive";
  event_id?: number | string | null; // Added to distinguish Event Jobs
}

export const Route = createFileRoute("/admin/jobs")({
  head: () => ({ meta: [{ title: "Job Approvals — Admin" }] }),
  component: AdminJobs,
});

function AdminJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 1. Fetch live job postings from backend API using AWS production server URL
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://15.207.249.155:5000/api/admin/jobs");
      const result = await res.json();
      if (result.success) {
        setJobs(result.data);
      } else {
        toast.error("Failed to fetch jobs from database.");
      }
    } catch (err) {
      console.error("Fetch Jobs Error:", err);
      toast.error("Network error while connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Split jobs into categories based on status and whether they are tied to an event
  const eventJobs = jobs.filter((j) => j.event_id != null && (j.status ?? "pending") === "pending");
  const pending = jobs.filter((j) => j.event_id == null && (j.status ?? "pending") === "pending");
  const approved = jobs.filter((j) => j.status === "approved");
  const rejected = jobs.filter((j) => j.status === "rejected");

  const totalActionable = eventJobs.length + pending.length;

  // 2. Call backend PUT API to approve or reject a job
  async function act(j: Job, status: "approved" | "rejected") {
    try {
      const res = await fetch(`http://15.207.249.155:5000/api/admin/jobs/${j.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success(`"${j.title}" marked as ${status}`);
        // Update local component state dynamically
        setJobs((prevJobs) =>
          prevJobs.map((item) =>
            item.id === j.id ? { ...item, status: status } : item
          )
        );
      } else {
        toast.error(result.message || "Action failed.");
      }
    } catch (err) {
      console.error("Review Job Error:", err);
      toast.error("Failed to update job status on server.");
    }
  }

  return (
    <DashShell role="admin" nav={adminNav}>
      <PageHeader
        title="Job Approvals"
        description="Review jobs submitted by employers. Only approved jobs are visible to candidates."
        action={
          <Badge className="bg-saffron/15 text-saffron gap-1">
            <Briefcase className="h-3 w-3" />
            {totalActionable} action required
          </Badge>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Tabs defaultValue="event-jobs">
          <TabsList>
            <TabsTrigger value="event-jobs">Event Jobs ({eventJobs.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="event-jobs">
            <JobTable jobs={eventJobs} showActions onAct={act} />
          </TabsContent>
          <TabsContent value="pending">
            <JobTable jobs={pending} showActions onAct={act} />
          </TabsContent>
          <TabsContent value="approved">
            <JobTable jobs={approved} />
          </TabsContent>
          <TabsContent value="rejected">
            <JobTable jobs={rejected} />
          </TabsContent>
        </Tabs>
      )}
    </DashShell>
  );
}

function JobTable({
  jobs,
  showActions,
  onAct,
}: {
  jobs: Job[];
  showActions?: boolean;
  onAct?: (j: Job, s: "approved" | "rejected") => void;
}) {
  if (!jobs.length)
    return (
      <Card className="p-6 text-center text-muted-foreground border-border/60 mt-4">
        No jobs in this bucket.
      </Card>
    );

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
              <TableCell>{j.company_name}</TableCell>
              <TableCell>
                <Badge variant="outline">{j.job_type}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{j.location}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {j.created_at ? new Date(j.created_at).toLocaleDateString("en-IN") : "Recent"}
              </TableCell>
              {showActions && (
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      className="bg-india-green text-white hover:bg-india-green/90"
                      onClick={() => onAct?.(j, "approved")}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive border-destructive/40 hover:bg-destructive/10"
                      onClick={() => onAct?.(j, "rejected")}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
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
