import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { DashShell, PageHeader, StatCard } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Download, Loader2, Calendar, Building2, Users, CheckCircle2, XCircle, Clock, Award } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/interviews")({
  head: () => ({ meta: [{ title: "Interview Control — Admin" }] }),
  component: InterviewControl,
});

interface StallStat {
  stall_id: number;
  stall_code: string;
  employer_id: number;
  company_name: string;
  waiting_count: number;
  shortlisted_count: number;
  interviewed_count: number;
  hired_count: number;
  rejected_count: number;
  total_applications: number;
}

interface InterviewLog {
  application_id: number;
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string;
  job_title: string;
  company_name: string;
  stall_code: string;
  interview_status: string;
  interview_time: string;
}

function InterviewControl() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [stalls, setStalls] = useState<StallStat[]>([]);
  const [logs, setLogs] = useState<InterviewLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 1. Fetch available Events
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/events`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data.length > 0) {
          setEvents(json.data);
          // Auto-select first live or upcoming event
          const active = json.data.find((e: any) => e.status?.toLowerCase() === "live" || e.status?.toLowerCase() === "upcoming");
          setSelectedEventId(active ? active.id.toString() : json.data[0].id.toString());
        }
      })
      .catch(() => toast.error("Failed to load events list"));
  }, []);

  // 2. Fetch Interview Report whenever Event changes
  useEffect(() => {
    if (!selectedEventId) return;
    setLoading(true);

    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/events/${selectedEventId}/interviews-report`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setStalls(json.data.stalls || []);
          setLogs(json.data.logs || []);
        } else {
          toast.error("Failed to load interview report.");
        }
      })
      .catch(() => toast.error("Network error loading interview data."))
      .finally(() => setLoading(false));
  }, [selectedEventId]);

  // --- OVERALL METRICS ---
  const totalStalls = stalls.length;
  const totalShortlisted = stalls.reduce((sum, s) => sum + parseInt(String(s.shortlisted_count || 0)), 0);
  const totalInterviewed = stalls.reduce((sum, s) => sum + parseInt(String(s.interviewed_count || 0)), 0);
  const totalHired = stalls.reduce((sum, s) => sum + parseInt(String(s.hired_count || 0)), 0);
  const totalRejected = stalls.reduce((sum, s) => sum + parseInt(String(s.rejected_count || 0)), 0);

  // --- EXCEL REPORT EXPORT ---
  const handleExport = () => {
    if (stalls.length === 0 && logs.length === 0) {
      return toast.error("No interview data available to export.");
    }

    const activeEvent = events.find((e) => e.id.toString() === selectedEventId);
    const eventName = activeEvent ? activeEvent.name : "Event";

    let csvRows = [];
    csvRows.push(`"INTERVIEW CONTROL REPORT:","${eventName}"`);
    csvRows.push(`"Generated On:","${new Date().toLocaleString()}"`);
    csvRows.push("");

    // Section 1: Stall Breakdown
    csvRows.push(`"--- STALL-WISE SUMMARY ---"`);
    csvRows.push(`"Stall Code","Company Name","Waiting","Shortlisted","Interviewed","Hired","Rejected","Total Applications"`);
    stalls.forEach((s) => {
      csvRows.push(`"${s.stall_code || 'Unassigned'}","${(s.company_name || '').replace(/"/g, '""')}","${s.waiting_count}","${s.shortlisted_count}","${s.interviewed_count}","${s.hired_count}","${s.rejected_count}","${s.total_applications}"`);
    });

    csvRows.push("");
    csvRows.push("");

    // Section 2: Detailed Candidate Logs
    csvRows.push(`"--- CANDIDATE INTERVIEW LOGS ---"`);
    csvRows.push(`"Candidate ID","Candidate Name","Email","Phone","Company","Stall","Job Role","Status","Applied/Interview Date"`);
    logs.forEach((l) => {
      const formattedDate = l.interview_time ? new Date(l.interview_time).toLocaleString("en-IN") : "N/A";
      csvRows.push(`"${l.candidate_id || ''}","${(l.candidate_name || '').replace(/"/g, '""')}","${l.candidate_email || ''}","${l.candidate_phone || ''}","${(l.company_name || '').replace(/"/g, '""')}","${l.stall_code || 'N/A'}","${(l.job_title || '').replace(/"/g, '""')}","${l.interview_status}","${formattedDate}"`);
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${eventName.replace(/\s+/g, "_")}_Interview_Report.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Exported interview report successfully.");
  };

  return (
    <DashShell role="admin" nav={adminNav}>
      <PageHeader
        title="Interview Control"
        description="Real-time interview tracking across every stall, company, and panel."
        action={
          <Button variant="outline" onClick={handleExport} disabled={stalls.length === 0 && logs.length === 0}>
            <Download className="h-4 w-4 mr-2" /> Export Interview Excel
          </Button>
        }
      />

      {/* EVENT FILTER DROPDOWN */}
      <Card className="p-4 mb-6 border-border/60 bg-white flex flex-wrap items-center gap-4 shadow-sm">
        <div className="flex items-center gap-3 w-full max-w-sm">
          <div className="bg-navy/10 p-2 rounded-md">
            <Calendar className="h-5 w-5 text-navy" />
          </div>
          <div className="flex-1">
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger className="font-semibold text-navy border-slate-300">
                <SelectValue placeholder="Select Job Fair Event..." />
              </SelectTrigger>
              <SelectContent>
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

      {/* OVERALL METRICS CARDS */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label="Active Stalls" value={String(totalStalls)} icon={Building2} accent="navy" />
        <StatCard label="Shortlisted" value={String(totalShortlisted)} icon={Clock} accent="saffron" />
        <StatCard label="Interviewed" value={String(totalInterviewed)} icon={Users} accent="navy" />
        <StatCard label="Total Hired" value={String(totalHired)} icon={Award} accent="india-green" />
        <StatCard label="Rejected" value={String(totalRejected)} icon={XCircle} accent="saffron" />
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-navy" />
        </div>
      ) : (
        <Tabs defaultValue="stall-wise">
          <TabsList className="mb-4">
            <TabsTrigger value="stall-wise">Stall-wise Breakdown ({stalls.length})</TabsTrigger>
            <TabsTrigger value="candidate-logs">Candidate Logs ({logs.length})</TabsTrigger>
          </TabsList>

          {/* TAB 1: STALL-WISE BREAKDOWN */}
          <TabsContent value="stall-wise">
            <Card className="border-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Stall Code</TableHead>
                    <TableHead>Company Name</TableHead>
                    <TableHead className="text-center">Waiting</TableHead>
                    <TableHead className="text-center">Shortlisted</TableHead>
                    <TableHead className="text-center">Interviewed</TableHead>
                    <TableHead className="text-center">Hired</TableHead>
                    <TableHead className="text-center">Rejected</TableHead>
                    <TableHead className="text-center">Total Apps</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stalls.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                        No stalls or interviews recorded for this event yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    stalls.map((s) => (
                      <TableRow key={s.stall_id || s.employer_id}>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-navy border-navy/30 bg-navy/5">
                            {s.stall_code || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold text-navy">{s.company_name}</TableCell>
                        <TableCell className="text-center font-medium text-amber-600">{s.waiting_count}</TableCell>
                        <TableCell className="text-center font-medium text-blue-600">{s.shortlisted_count}</TableCell>
                        <TableCell className="text-center font-medium text-purple-600">{s.interviewed_count}</TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-india-green/15 text-india-green border-0">{s.hired_count}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-red-500/15 text-red-600 border-0">{s.rejected_count}</Badge>
                        </TableCell>
                        <TableCell className="text-center font-bold text-slate-700">{s.total_applications}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* TAB 2: CANDIDATE INTERVIEW LOGS */}
          <TabsContent value="candidate-logs">
            <Card className="border-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate Info</TableHead>
                    <TableHead>Company & Stall</TableHead>
                    <TableHead>Job Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        No candidate interview logs available.
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((l) => (
                      <TableRow key={l.application_id}>
                        <TableCell>
                          <div className="font-bold text-navy">{l.candidate_name}</div>
                          <div className="font-mono text-xs text-muted-foreground">{l.candidate_id}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{l.candidate_email || l.candidate_phone}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-slate-800">{l.company_name}</div>
                          <Badge variant="outline" className="text-[10px] mt-1">
                            Stall: {l.stall_code || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-navy">{l.job_title}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              l.interview_status?.toLowerCase().includes("hired")
                                ? "bg-india-green/15 text-india-green"
                                : l.interview_status?.toLowerCase().includes("reject")
                                ? "bg-red-500/15 text-red-600"
                                : l.interview_status?.toLowerCase().includes("shortlist")
                                ? "bg-blue-500/15 text-blue-600"
                                : "bg-saffron/15 text-saffron"
                            }
                          >
                            {l.interview_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {l.interview_time ? new Date(l.interview_time).toLocaleString("en-IN") : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </DashShell>
  );
}
