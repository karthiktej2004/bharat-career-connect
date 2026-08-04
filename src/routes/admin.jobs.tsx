import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { DashShell, PageHeader } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, Briefcase, Loader2, Calendar, History as HistoryIcon } from "lucide-react";
import { toast } from "sonner";

export interface Job {
  id: string;
  title: string;
  company_name: string;
  job_type: string;
  location: string;
  vacancies: number;
  created_at: string;
  status: "pending" | "approved" | "rejected" | "inactive";
  event_id?: number | string | null;
  event_name?: string;
  event_status?: string;
}

export const Route = createFileRoute("/admin/jobs")({
  head: () => ({ meta: [{ title: "Job Approvals — Admin" }] }),
  component: AdminJobs,
});

function AdminJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch both jobs and events simultaneously
  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsRes, eventsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/jobs`),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/events`)
      ]);

      const jobsData = await jobsRes.json();
      const eventsData = await eventsRes.json();

      if (jobsData.success) setJobs(jobsData.data);
      if (eventsData.success) {
        // Filter out completed events for the dropdown
        const activeEvents = eventsData.data.filter((e: any) => 
            e.status?.toLowerCase() === 'live' || e.status?.toLowerCase() === 'upcoming'
        );
        setEvents(activeEvents);
        
        // Auto-select the first live/upcoming event if one exists
        if (activeEvents.length > 0) {
            setSelectedEventId(activeEvents[0].id.toString());
        }
      }
    } catch (err) {
      toast.error("Network error while connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- FILTERING LOGIC ---
  
  // 1. Separate completed event jobs into History
  const historyJobs = useMemo(() => 
    jobs.filter((j) => j.event_status?.toLowerCase() === "completed"), 
  [jobs]);

  // 2. Keep active jobs (live/upcoming events + general non-event jobs)
  const activeJobs = useMemo(() => 
    jobs.filter((j) => j.event_status?.toLowerCase() !== "completed"), 
  [jobs]);

  // 3. Apply the Dropdown filter to active jobs
  const filteredActiveJobs = useMemo(() => {
    if (selectedEventId === "all") return activeJobs;
    return activeJobs.filter(j => j.event_id?.toString() === selectedEventId || j.event_id == null);
  }, [activeJobs, selectedEventId]);

  // 4. Split the filtered active jobs into approval buckets
  const eventPending = filteredActiveJobs.filter((j) => j.event_id != null && (j.status ?? "pending") === "pending");
  const generalPending = filteredActiveJobs.filter((j) => j.event_id == null && (j.status ?? "pending") === "pending");
  const approved = filteredActiveJobs.filter((j) => j.status === "approved");
  const rejected = filteredActiveJobs.filter((j) => j.status === "rejected");

  const totalActionable = eventPending.length + generalPending.length;

  // --- API ACTIONS ---
  async function act(j: Job, status: "approved" | "rejected") {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/jobs/${j.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success(`"${j.title}" marked as ${status}`);
        setJobs((prevJobs) => prevJobs.map((item) => item.id === j.id ? { ...item, status: status } : item));
      } else {
        toast.error(result.message || "Action failed.");
      }
    } catch (err) {
      toast.error("Failed to update job status on server.");
    }
  }

  return (
    <DashShell role="admin" nav={adminNav}>
      <PageHeader
        title="Job Approvals"
        description="Review jobs submitted by employers. Only approved jobs are visible to candidates."
        action={
          <Badge className="bg-saffron/15 text-saffron gap-1 px-3 py-1">
            <Briefcase className="h-4 w-4" />
            {totalActionable} action required
          </Badge>
        }
      />

      {/* ACTIVE EVENT FILTER */}
      <Card className="p-4 mb-6 border-border/60 bg-white flex flex-wrap items-center gap-4 shadow-sm">
        <div className="flex items-center gap-3 w-full max-w-sm">
            <div className="bg-navy/10 p-2 rounded-md"><Calendar className="h-5 w-5 text-navy" /></div>
            <div className="flex-1">
                <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                    <SelectTrigger className="font-semibold text-navy border-slate-300">
                        <SelectValue placeholder="Select Active Event..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Active & General Jobs</SelectItem>
                        {events.map((ev) => (
                            <SelectItem key={ev.id} value={ev.id.toString()}>
                                {ev.name} ({ev.status})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-navy" />
        </div>
      ) : (
        <Tabs defaultValue="event-pending">
          <TabsList className="mb-4">
            <TabsTrigger value="event-pending">Event Pending ({eventPending.length})</TabsTrigger>
            <TabsTrigger value="general-pending">General Pending ({generalPending.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
            <TabsTrigger value="history" className="ml-auto flex items-center gap-2 text-slate-500 data-[state=active]:text-navy">
                <HistoryIcon className="h-4 w-4" /> Past History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="event-pending">
            <JobTable jobs={eventPending} showActions onAct={act} />
          </TabsContent>
          <TabsContent value="general-pending">
            <JobTable jobs={generalPending} showActions onAct={act} />
          </TabsContent>
          <TabsContent value="approved">
            <JobTable jobs={approved} showStatus />
          </TabsContent>
          <TabsContent value="rejected">
            <JobTable jobs={rejected} showStatus />
          </TabsContent>
          <TabsContent value="history">
            <HistoryTable jobs={historyJobs} />
          </TabsContent>
        </Tabs>
      )}
    </DashShell>
  );
}

// --- STANDARD JOBS TABLE (For active queues) ---
function JobTable({ jobs, showActions, showStatus, onAct }: { jobs: Job[]; showActions?: boolean; showStatus?: boolean; onAct?: (j: Job, s: "approved" | "rejected") => void; }) {
  if (!jobs.length) return <Card className="p-6 text-center text-muted-foreground border-border/60">No jobs in this bucket.</Card>;

  return (
    <Card className="border-border/60">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job Role</TableHead>
            <TableHead>Company</TableHead>
            <TableHead className="text-center">Vacancies</TableHead>
            <TableHead>Event Context</TableHead>
            <TableHead>Posted Date</TableHead>
            {showStatus && <TableHead>Status</TableHead>}
            {showActions && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((j) => (
            <TableRow key={j.id}>
              <TableCell>
                <div className="font-semibold text-navy">{j.title}</div>
                <div className="text-xs text-muted-foreground flex gap-2 mt-1">
                    <Badge variant="secondary" className="text-[10px] font-normal">{j.job_type}</Badge>
                    <span>{j.location}</span>
                </div>
              </TableCell>
              <TableCell className="font-medium text-slate-700">{j.company_name}</TableCell>
              <TableCell className="text-center font-semibold">{j.vacancies || 'N/A'}</TableCell>
              <TableCell>
                {j.event_name ? (
                    <Badge variant="outline" className="border-navy/20 text-navy bg-navy/5">{j.event_name}</Badge>
                ) : (
                    <span className="text-xs text-muted-foreground italic">General Platform</span>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {j.created_at ? new Date(j.created_at).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }) : "Recent"}
              </TableCell>
              
              {showStatus && (
                <TableCell>
                    <Badge className={j.status === 'approved' ? "bg-india-green/15 text-india-green" : "bg-red-500/15 text-red-600"}>
                        {j.status}
                    </Badge>
                </TableCell>
              )}

              {showActions && (
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" className="bg-india-green text-white hover:bg-india-green/90 h-8" onClick={() => onAct?.(j, "approved")}>
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" className="text-orange-500 border-orange-200 hover:bg-orange-50 h-8" onClick={() => onAct?.(j, "rejected")}>
                      <XCircle className="h-4 w-4 mr-1" /> Reject
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

// --- SPECIALIZED HISTORY TABLE (For completed events) ---
function HistoryTable({ jobs }: { jobs: Job[] }) {
    if (!jobs.length) return <Card className="p-6 text-center text-muted-foreground border-border/60">No historical job data found.</Card>;
  
    return (
      <Card className="border-border/60 opacity-85">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Past Event</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Job Role</TableHead>
              <TableHead className="text-center">Vacancies Listed</TableHead>
              <TableHead>Final Status</TableHead>
              <TableHead>Posted On</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((j) => (
              <TableRow key={j.id}>
                <TableCell>
                  <div className="font-semibold text-slate-700">{j.event_name}</div>
                  <Badge variant="secondary" className="text-[10px] mt-1">Completed</Badge>
                </TableCell>
                <TableCell className="font-medium">{j.company_name}</TableCell>
                <TableCell>
                  <div className="font-medium text-navy">{j.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{j.job_type} • {j.location}</div>
                </TableCell>
                <TableCell className="text-center font-semibold text-slate-600">{j.vacancies || 0}</TableCell>
                <TableCell>
                    <Badge variant="outline" className={j.status === 'approved' ? "text-india-green border-india-green" : "text-slate-500 border-slate-300"}>
                        {j.status}
                    </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {j.created_at ? new Date(j.created_at).toLocaleString("en-IN", { dateStyle: 'medium', timeStyle: 'short' }) : "Unknown"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    );
  }
