import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo } from "react";
import { DashShell, PageHeader } from "@/components/DashShell";
import { employerNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator"; 
import { Target, Clock, TrendingUp, Users, Download, Loader2, Store, CalendarOff, Building2 } from "lucide-react";
import { getSession } from "@/lib/mockStore";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export const Route = createFileRoute("/employer/analytics")({
  head: () => ({ meta: [{ title: "Hiring Analytics — Bharat Career Connect" }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  return (
    <DashShell role="employer" nav={employerNav}>
      <AnalyticsBody />
    </DashShell>
  );
}

export function AnalyticsBody() {
  const user = getSession();
  const employerId = user?.id;

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [stalls, setStalls] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  
  // Filter State: "all" or specific event ID
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const fetchAllData = useCallback(async () => {
    if (!employerId) return;
    setIsLoading(true);
    try {
      const [anRes, stRes, evRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/employer/${employerId}/analytics`),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/employer/${employerId}/event-stalls`),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/events`)
      ]);
      
      const anJson = await anRes.json();
      const stJson = await stRes.json();
      const evJson = await evRes.json();

      if (anJson.success) setData(anJson.data || {});
      if (stJson.success) setStalls(stJson.data || []);
      if (evJson.success) setEvents(evJson.data || []);
    } catch (error) {
      toast.error("Failed to load analytics data.");
    } finally {
      setIsLoading(false);
    }
  }, [employerId]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const filteredHistory = useMemo(() => {
    if (!data?.history) return [];
    if (selectedFilter === "all") return data.history;
    return data.history.filter((r: any) => r.event_id?.toString() === selectedFilter);
  }, [data, selectedFilter]);

  const dynamicKpis = useMemo(() => {
    const defaultKpis = { talentPool: 0, totalHires: 0, conversionRate: 0, avgTime: "N/A" };
    
    if (selectedFilter === "all") {
      return data?.kpis || defaultKpis;
    }
    
    const pool = filteredHistory.length;
    const hires = filteredHistory.filter((r: any) => r.action_type === 'Hired').length;
    const rate = pool > 0 ? Math.round((hires / pool) * 100) : 0;
    
    return {
      talentPool: pool,
      totalHires: hires,
      conversionRate: rate,
      avgTime: "Event Specific"
    };
  }, [filteredHistory, selectedFilter, data]);

  // --- UPDATED EXCEL EXPORT ENGINE ---
  const downloadReport = () => {
    // Generate template if no data exists
    const hasData = filteredHistory.length > 0;
    const exportData = hasData ? filteredHistory : [{}]; 

    const worksheetData = exportData.map((row: any) => {
      const evt = (events || []).find(e => e.id === row.event_id);
      const stl = (stalls || []).find(s => s.eventId === row.event_id);

      return {
        "Date Applied": hasData ? new Date(row.date).toLocaleDateString("en-IN") : "N/A",
        "Candidate ID": row.candidate_unique_id || "N/A", 
        "Candidate Name": row.candidate_name || "N/A",
        "Email": row.candidate_email || "N/A",            
        "Phone": row.candidate_phone || "N/A",            
        "Job Title Applied": row.job_title || "N/A",
        "Source": row.event_id ? "Job Fair" : "Direct / Online",
        "Final Status": row.action_type || "N/A",
        "Event Name": evt?.name || row.event_name || "N/A",
        "Event Date": evt && evt.event_date ? new Date(evt.event_date).toLocaleDateString("en-IN") : "N/A",
        "Employer Stall ID": stl?.allocatedStall || stl?.stallNo || "N/A",
        "Stall Block/Floor": stl ? `${stl.block || 'Main'} - ${stl.floor || 'Ground'}` : "N/A",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    const sheetName = selectedFilter === "all" ? "Master_Hiring_Record" : "Event_Hiring_Record";
    
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, `${sheetName}_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Comprehensive Hiring Report downloaded successfully!");
  };

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-saffron" /></div>;
  }
  
  if (!data || Object.keys(data).length === 0) {
    return <div className="flex h-[50vh] items-center justify-center text-muted-foreground">Analytics data is currently unavailable.</div>;
  }

  const activeEvent = selectedFilter !== "all" ? (events || []).find(e => e.id?.toString() === selectedFilter) : null;
  const activeStall = selectedFilter !== "all" ? (stalls || []).find(s => s.eventId?.toString() === selectedFilter) : null;
  const participatingEvents = (events || []).filter(e => (stalls || []).some(s => s.eventId === e.id));

  return (
    <>
      <PageHeader
        title="Hiring Analytics & History"
        description="Your complete system of record for event ROI, candidate pipelines, and source tracking."
        action={
          <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-[240px] bg-white border-slate-300 font-semibold text-navy">
                <SelectValue placeholder="All-Time Performance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-bold text-navy">All-Time Performance</SelectItem>
                {participatingEvents.length > 0 && <Separator className="my-1" />}
                {participatingEvents.map(e => (
                  <SelectItem key={e.id} value={e.id.toString()}>{e.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={downloadReport} className="bg-india-green text-white hover:bg-india-green/90 font-bold shadow-sm">
              <Download className="h-4 w-4 mr-2" /> Download Report
            </Button>
          </div>
        }
      />

      {selectedFilter !== "all" && activeEvent && (
        <Card className="p-5 mb-6 bg-gradient-to-r from-indigo-50/50 to-white border-indigo-100 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between shadow-sm">
          <div>
             <h3 className="text-lg font-display font-bold text-navy flex items-center gap-2 mb-1">
               <Store className="h-5 w-5 text-indigo-600" /> {activeEvent.name} — Stall Record
             </h3>
             <p className="text-sm text-slate-600 flex items-center gap-1.5 font-medium">
               <Building2 className="h-3.5 w-3.5" />
               Stall ID: <strong className="text-navy bg-white px-1.5 py-0.5 rounded border shadow-sm">{activeStall?.allocatedStall || activeStall?.stallNo || "TBD"}</strong> • 
               Block: <strong className="text-navy">{activeStall?.block || "Main"}</strong> • 
               Floor: <strong className="text-navy">{activeStall?.floor || "Ground"}</strong>
             </p>
          </div>
          <div className="flex gap-6 text-sm text-right bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
             <div>
               <p className="text-slate-500 font-medium text-xs uppercase tracking-wider mb-0.5">Stall Fee Paid</p>
               <p className="font-bold text-emerald-600 text-base">₹{activeEvent.stall_price || 0}</p>
             </div>
             <div className="w-px bg-slate-200" />
             <div>
               <p className="text-slate-500 font-medium text-xs uppercase tracking-wider mb-0.5">Event Date</p>
               <p className="font-bold text-navy text-base">{new Date(activeEvent.event_date || new Date()).toLocaleDateString('en-IN', {day: '2-digit', month: 'short', year: 'numeric'})}</p>
             </div>
          </div>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-5 border-border/60 shadow-sm bg-white">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Conversion Rate</p>
            <div className="h-8 w-8 rounded-lg bg-india-green/10 flex items-center justify-center text-india-green"><Target className="h-4 w-4" /></div>
          </div>
          <h3 className="font-display font-bold text-navy text-3xl">{dynamicKpis.conversionRate || 0}%</h3>
          <p className="text-xs text-india-green font-medium mt-1">Based on Total Pool</p>
        </Card>
        <Card className="p-5 border-border/60 shadow-sm bg-white">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg. Time to Hire</p>
            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-navy"><Clock className="h-4 w-4" /></div>
          </div>
          <h3 className="font-display font-bold text-navy text-3xl">{dynamicKpis.avgTime || "N/A"}</h3>
        </Card>
        <Card className="p-5 border-border/60 shadow-sm bg-white">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Hires</p>
            <div className="h-8 w-8 rounded-lg bg-india-green/10 flex items-center justify-center text-india-green"><TrendingUp className="h-4 w-4" /></div>
          </div>
          <h3 className="font-display font-bold text-navy text-3xl">{dynamicKpis.totalHires || 0}</h3>
        </Card>
        <Card className="p-5 border-border/60 shadow-sm bg-white">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Talent Pool</p>
            <div className="h-8 w-8 rounded-lg bg-saffron/15 flex items-center justify-center text-saffron"><Users className="h-4 w-4" /></div>
          </div>
          <h3 className="font-display font-bold text-navy text-3xl">{dynamicKpis.talentPool || 0}</h3>
        </Card>
      </div>

      {selectedFilter === "all" && (
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <Card className="p-6 border-border/60 flex flex-col shadow-sm bg-white">
            <h3 className="font-display font-bold text-navy text-lg mb-6">Applications vs Hires</h3>
            <div className="relative flex-1 min-h-[200px] flex items-end justify-between px-2 pb-6 border-b border-dashed border-slate-200">
              <div className="absolute left-0 top-0 bottom-6 w-full flex flex-col justify-between pointer-events-none text-[10px] text-muted-foreground">
                <span className="flex items-center before:content-[''] before:flex-1 before:border-b before:border-dashed before:border-slate-200 before:mr-2">{Math.max(10, dynamicKpis.talentPool || 0)}</span>
                <span className="flex items-center before:content-[''] before:flex-1 before:border-b before:border-dashed before:border-slate-200 before:mr-2">{Math.max(5, Math.floor((dynamicKpis.talentPool || 0) / 2))}</span>
                <span className="flex items-center before:content-[''] before:flex-1 before:border-b before:border-dashed before:border-slate-200 before:mr-2">0</span>
              </div>

              {(data?.monthlyData || []).map((d: any, idx: number) => {
                const maxScale = Math.max(10, dynamicKpis.talentPool || 0);
                return (
                  <div key={d.month || idx} className="relative z-10 flex flex-col items-center group w-12 gap-1">
                    <div className="w-full flex items-end justify-center gap-1.5 h-[160px]">
                      <div className="w-4 bg-saffron rounded-t-sm transition-all duration-500 hover:opacity-80" style={{ height: `${((d.apps || 0) / maxScale) * 100}%` }}></div>
                      <div className="w-4 bg-india-green rounded-t-sm transition-all duration-500 hover:opacity-80" style={{ height: `${((d.hires || 0) / maxScale) * 100}%` }}></div>
                    </div>
                    <span className="absolute -bottom-6 text-xs font-semibold text-slate-500">{d.month || ''}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6 border-border/60 flex flex-col items-center shadow-sm bg-white">
            <h3 className="font-display font-bold text-navy text-lg mb-6 w-full text-left">Candidate Sources</h3>
            <div className="relative w-48 h-48 mb-8">
              <div 
                className="absolute inset-0 rounded-full" 
                style={{ background: 'conic-gradient(#f97316 0% 45%, #16a34a 45% 65%, #1e1b4b 65% 85%, #eab308 85% 100%)' }}
              ></div>
              <div className="absolute inset-5 bg-white rounded-full flex items-center justify-center shadow-inner"></div>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-sm font-semibold">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#f97316] shadow-sm"></div><span className="text-slate-600">Job Fair</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#16a34a] shadow-sm"></div><span className="text-slate-600">Direct Apply</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#1e1b4b] shadow-sm"></div><span className="text-slate-600">AI Match</span></div>
            </div>
          </Card>
        </div>
      )}

      <h3 className="font-display font-bold text-navy text-xl mt-8 mb-4 flex items-center gap-2">
        <CalendarOff className="h-5 w-5 text-saffron" /> 
        {selectedFilter === "all" ? "Master Candidate Pipeline" : "Event Pipeline Roster"}
      </h3>
      
      <Card className="border-border/60 shadow-sm bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-bold text-slate-600">Date</TableHead>
              <TableHead className="font-bold text-slate-600">Candidate</TableHead>
              <TableHead className="font-bold text-slate-600">Role Applied</TableHead>
              <TableHead className="font-bold text-slate-600">Source</TableHead>
              <TableHead className="font-bold text-slate-600">Current Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHistory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-slate-500 font-medium">
                  No candidate history found for this selection.
                </TableCell>
              </TableRow>
            ) : (
              filteredHistory.map((row: any, i: number) => {
                let badgeColor = "bg-slate-100 text-slate-700 border-slate-200";
                if (row.action_type === "Shortlisted") badgeColor = "bg-amber-100 text-amber-800 border-amber-200";
                if (row.action_type === "Interview") badgeColor = "bg-blue-100 text-blue-700 border-blue-200";
                if (row.action_type === "Interviewed") badgeColor = "bg-purple-100 text-purple-700 border-purple-200";
                if (row.action_type === "Offer") badgeColor = "bg-teal-100 text-teal-800 border-teal-200";
                if (row.action_type === "Hired") badgeColor = "bg-india-green/15 text-india-green border-india-green/20";
                if (row.action_type === "Rejected") badgeColor = "bg-red-100 text-red-700 border-red-200";

                return (
                  <TableRow key={i} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="text-slate-500 font-medium text-sm whitespace-nowrap">
                      {new Date(row.date || new Date()).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-navy">{row.candidate_name || "Unknown"}</div>
                    </TableCell>
                    <TableCell className="text-slate-600 font-medium text-sm">{row.job_title || "N/A"}</TableCell>
                    <TableCell>
                      {row.event_id ? (
                        <Badge variant="outline" className="text-saffron border-saffron/30 bg-saffron/5 font-semibold">Job Fair</Badge>
                      ) : (
                        <Badge variant="outline" className="text-india-green border-india-green/30 bg-india-green/5 font-semibold">Direct</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={`border ${badgeColor}`}>{row.action_type || "Applied"}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
