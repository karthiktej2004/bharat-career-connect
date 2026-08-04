import { createFileRoute } from "@tanstack/react-router";
import { DashShell, PageHeader, StatCard } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Loader2, Calendar, UsersRound, CalendarCheck, Award, BriefcaseBusiness } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/event-candidates")({
  head: () => ({ meta: [{ title: "Event Candidates — Admin" }] }),
  component: EventCandidatesReport,
});

function EventCandidatesReport() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // 1. Fetch available events for the dropdown
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/events`)
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data.length > 0) {
          setEvents(json.data);
          setSelectedEventId(json.data[0].id.toString()); // Auto-select first event
        }
      })
      .catch(() => toast.error("Failed to load events list"));
  }, []);

  // 2. Fetch candidates whenever the selected event changes
  useEffect(() => {
    if (!selectedEventId) return;
    setIsLoading(true);
    setSelectedIds(new Set()); // Reset selections on event change
    
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/events/${selectedEventId}/candidates-report`)
      .then(res => res.json())
      .then(json => {
        if (json.success) setCandidates(json.data);
      })
      .catch(() => toast.error("Failed to load event candidates"))
      .finally(() => setIsLoading(false));
  }, [selectedEventId]);

  // --- METRICS CALCULATION ---
  const totalAttended = candidates.filter(c => c.attendance?.toLowerCase() === 'present').length;
  const totalInterviews = candidates.reduce((sum, c) => sum + parseInt(c.interviews || 0), 0);
  const totalHired = candidates.filter(c => c.is_hired).length;

  // --- SELECTION LOGIC ---
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(candidates.map((c) => c.unique_id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) newSelected.add(id);
    else newSelected.delete(id);
    setSelectedIds(newSelected);
  };

  // --- EXPORT EXCEL LOGIC ---
  const handleExport = () => {
    const dataToExport = selectedIds.size > 0 
      ? candidates.filter(c => selectedIds.has(c.unique_id)) 
      : candidates;

    if (dataToExport.length === 0) return toast.error("No data available to export.");

    const activeEventName = events.find(e => e.id.toString() === selectedEventId)?.name || "Event";

    const csvRows = ["ID,Name,Email,Phone,Attendance,Applications,Interviews,Hired,Companies Applied"];
    dataToExport.forEach((c) => {
      const companies = Array.isArray(c.companies_applied) ? c.companies_applied.join(" | ") : "";
      csvRows.push(`"${c.unique_id}","${c.name}","${c.email || ''}","${c.phone || ''}","${c.attendance}","${c.total_applications}","${c.interviews}","${c.is_hired ? 'Yes' : 'No'}","${companies}"`);
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeEventName.replace(/\s+/g, '_')}_Candidates_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success(`Exported ${dataToExport.length} candidates successfully.`);
  };

  return (
    <DashShell role="admin" nav={adminNav}>
      <PageHeader title="Event-Specific Candidates" description="Analyze candidate funnels, attendance, and hiring outcomes for specific Job Fairs." action={
        <Button variant="outline" onClick={handleExport} disabled={candidates.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          {selectedIds.size > 0 ? `Export Selected (${selectedIds.size})` : "Export Full List"}
        </Button>
      } />
      
      {/* FILTER BAR */}
      <Card className="p-4 mb-6 border-border/60 bg-white flex flex-wrap items-center gap-4 shadow-sm">
        <div className="flex items-center gap-3 w-full max-w-sm">
            <div className="bg-navy/10 p-2 rounded-md"><Calendar className="h-5 w-5 text-navy" /></div>
            <div className="flex-1">
                <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                    <SelectTrigger className="font-semibold text-navy border-slate-300">
                        <SelectValue placeholder="Select an Event..." />
                    </SelectTrigger>
                    <SelectContent>
                        {events.map((ev) => (
                            <SelectItem key={ev.id} value={ev.id.toString()}>{ev.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
      </Card>

      {/* DYNAMIC METRICS */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Registered" value={String(candidates.length)} icon={UsersRound} accent="navy" />
        <StatCard label="Total Attended" value={String(totalAttended)} icon={CalendarCheck} accent="saffron" />
        <StatCard label="Interviews Conducted" value={String(totalInterviews)} icon={BriefcaseBusiness} accent="navy" />
        <StatCard label="Total Hired" value={String(totalHired)} icon={Award} accent="india-green" />
      </div>
      
      {/* DATA TABLE */}
      <Card className="border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox 
                  checked={candidates.length > 0 && selectedIds.size === candidates.length}
                  onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                />
              </TableHead>
              <TableHead>Candidate Info</TableHead>
              <TableHead>Attendance</TableHead>
              <TableHead className="text-center">Total Apps</TableHead>
              <TableHead className="text-center">Interviews</TableHead>
              <TableHead className="text-center">Hired</TableHead>
              <TableHead>Companies Applied</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin mx-auto text-navy"/></TableCell></TableRow>
            ) : candidates.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">No candidates registered for this event yet.</TableCell></TableRow>
            ) : (
              candidates.map((c) => (
                <TableRow key={c.unique_id}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedIds.has(c.unique_id)}
                      onCheckedChange={(checked) => handleSelectOne(c.unique_id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-navy">{c.name}</div>
                    <div className="font-mono text-xs text-muted-foreground">{c.unique_id}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{c.email || c.phone}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={c.attendance?.toLowerCase() === 'present' ? "border-india-green text-india-green bg-india-green/5" : "border-slate-300 text-slate-500"}>
                        {c.attendance}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-medium">{c.total_applications}</TableCell>
                  <TableCell className="text-center font-medium">{c.interviews}</TableCell>
                  <TableCell className="text-center">
                    {c.is_hired ? (
                        <Badge className="bg-india-green/15 text-india-green border-0 uppercase text-[10px]">Yes</Badge>
                    ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <div className="flex flex-wrap gap-1">
                        {Array.isArray(c.companies_applied) && c.companies_applied.length > 0 ? (
                            c.companies_applied.map((company: string, i: number) => (
                                <Badge key={i} variant="secondary" className="text-[10px] font-normal truncate max-w-[150px]">
                                    {company}
                                </Badge>
                            ))
                        ) : (
                            <span className="text-xs text-muted-foreground">None</span>
                        )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </DashShell>
  );
}
