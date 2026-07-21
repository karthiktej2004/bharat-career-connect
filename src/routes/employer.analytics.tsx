import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { DashShell, PageHeader } from "@/components/DashShell";
import { employerNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Target, Clock, TrendingUp, Users, Download, Loader2, Calendar } from "lucide-react";
import { getSession } from "@/lib/mockStore";
import { toast } from "sonner";

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

  const fetchAnalytics = useCallback(async () => {
    if (!employerId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/employer/${employerId}/analytics`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (error) {
      toast.error("Failed to load analytics data.");
    } finally {
      setIsLoading(false);
    }
  }, [employerId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // ==========================================================================
  // DOWNLOAD CSV: NORMAL HIRING
  // ==========================================================================
  const downloadNormalReport = () => {
    if (!data || !data.history) return;
    const normalApps = data.history.filter((r: any) => !r.event_id);
    
    if (normalApps.length === 0) return toast.error("No Normal Hiring data available yet.");

    let csvContent = "Date,Candidate Name,Job Title,Current Status\n";
    normalApps.forEach((row: any) => {
      const date = new Date(row.date).toLocaleDateString("en-IN");
      const name = `"${row.candidate_name}"`; 
      const job = `"${row.job_title}"`;
      csvContent += `${date},${name},${job},${row.action_type}\n`;
    });

    triggerDownload(csvContent, `Normal_Hiring_Report_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // ==========================================================================
  // DOWNLOAD CSV: EVENT HIRING
  // ==========================================================================
  const downloadEventReport = () => {
    if (!data || !data.history) return;
    const eventApps = data.history.filter((r: any) => r.event_id);
    
    if (eventApps.length === 0) return toast.error("No Event Hiring data available yet.");

    let csvContent = "Date,Candidate Name,Event Name,Job Title,Current Status\n";
    eventApps.forEach((row: any) => {
      const date = new Date(row.date).toLocaleDateString("en-IN");
      const name = `"${row.candidate_name}"`; 
      const eventName = `"${row.event_name}"`;
      const job = `"${row.job_title}"`;
      csvContent += `${date},${name},${eventName},${job},${row.action_type}\n`;
    });

    triggerDownload(csvContent, `Event_Hiring_Report_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const triggerDownload = (csvContent: string, fileName: string) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${fileName} downloaded successfully!`);
  };

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-saffron" /></div>;
  }

  if (!data) return null;

  return (
    <>
      <PageHeader
        title="Hiring Analytics"
        description="Performance across events, sources, and time."
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={downloadNormalReport} variant="outline" className="border-navy text-navy hover:bg-navy/5">
              <Download className="h-4 w-4 mr-2" />
              Normal Hiring CSV
            </Button>
            <Button onClick={downloadEventReport} className="bg-navy text-white hover:bg-navy/90">
              <Calendar className="h-4 w-4 mr-2" />
              Event Hiring CSV
            </Button>
          </div>
        }
      />

      {/* KPI CARDS (Real DB Data) */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-5 border-border/60">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Conversion Rate</p>
            <div className="h-8 w-8 rounded-full bg-india-green/10 flex items-center justify-center text-india-green"><Target className="h-4 w-4" /></div>
          </div>
          <h3 className="font-display font-bold text-navy text-3xl">{data.kpis.conversionRate}%</h3>
          <p className="text-xs text-india-green font-medium mt-1">Based on Total Pool</p>
        </Card>
        <Card className="p-5 border-border/60">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Avg. Time to Hire</p>
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-navy"><Clock className="h-4 w-4" /></div>
          </div>
          <h3 className="font-display font-bold text-navy text-3xl">{data.kpis.avgTime}</h3>
        </Card>
        <Card className="p-5 border-border/60">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Hires</p>
            <div className="h-8 w-8 rounded-full bg-india-green/10 flex items-center justify-center text-india-green"><TrendingUp className="h-4 w-4" /></div>
          </div>
          <h3 className="font-display font-bold text-navy text-3xl">{data.kpis.totalHires}</h3>
        </Card>
        <Card className="p-5 border-border/60">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Talent Pool</p>
            <div className="h-8 w-8 rounded-full bg-saffron/15 flex items-center justify-center text-saffron"><Users className="h-4 w-4" /></div>
          </div>
          <h3 className="font-display font-bold text-navy text-3xl">{data.kpis.talentPool}</h3>
        </Card>
      </div>

      {/* CHARTS ROW */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        
        {/* BAR CHART: Applications vs Hires */}
        <Card className="p-6 border-border/60 flex flex-col">
          <h3 className="font-display font-bold text-navy text-lg mb-6">Applications vs Hires</h3>
          <div className="relative flex-1 min-h-[200px] flex items-end justify-between px-2 pb-6 border-b border-dashed border-border">
            
            {/* Dynamic Y-Axis Based on data scale */}
            <div className="absolute left-0 top-0 bottom-6 w-full flex flex-col justify-between pointer-events-none text-[10px] text-muted-foreground">
              <span className="flex items-center before:content-[''] before:flex-1 before:border-b before:border-dashed before:border-border/50 before:mr-2">{Math.max(10, data.kpis.talentPool)}</span>
              <span className="flex items-center before:content-[''] before:flex-1 before:border-b before:border-dashed before:border-border/50 before:mr-2">{Math.max(5, Math.floor(data.kpis.talentPool / 2))}</span>
              <span className="flex items-center before:content-[''] before:flex-1 before:border-b before:border-dashed before:border-border/50 before:mr-2">0</span>
            </div>

            {/* Bars */}
            {data.monthlyData.map((d: any) => {
              const maxScale = Math.max(10, data.kpis.talentPool); // Avoid division by zero
              return (
                <div key={d.month} className="relative z-10 flex flex-col items-center group w-12 gap-1">
                  <div className="w-full flex items-end justify-center gap-1.5 h-[160px]">
                    {/* Orange App Bar */}
                    <div className="w-4 bg-saffron rounded-t-sm transition-all duration-500 hover:opacity-80" style={{ height: `${(d.apps / maxScale) * 100}%` }}></div>
                    {/* Green Hire Bar */}
                    <div className="w-4 bg-india-green rounded-t-sm transition-all duration-500 hover:opacity-80" style={{ height: `${(d.hires / maxScale) * 100}%` }}></div>
                  </div>
                  <span className="absolute -bottom-6 text-xs font-medium text-muted-foreground">{d.month}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* DONUT CHART: Candidate Sources */}
        <Card className="p-6 border-border/60 flex flex-col items-center">
          <h3 className="font-display font-bold text-navy text-lg mb-6 w-full text-left">Candidate Sources</h3>
          
          <div className="relative w-48 h-48 mb-8">
            <div 
              className="absolute inset-0 rounded-full" 
              style={{ background: 'conic-gradient(#f97316 0% 45%, #16a34a 45% 65%, #1e1b4b 65% 85%, #eab308 85% 100%)' }}
            ></div>
            <div className="absolute inset-5 bg-white rounded-full flex items-center justify-center shadow-inner"></div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#f97316]"></div><span className="text-saffron">Job Fair</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#16a34a]"></div><span className="text-india-green">Direct Apply</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#1e1b4b]"></div><span className="text-navy">AI Match</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#eab308]"></div><span className="text-yellow-500">Referrals</span></div>
          </div>
        </Card>

      </div>

      {/* HISTORY TABLE */}
      <h3 className="font-display font-bold text-navy text-xl mt-8 mb-4">Candidate Pipeline History</h3>
      <Card className="border-border/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Candidate</TableHead>
              <TableHead>Role Applied</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Current Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.history.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No candidate history found yet.
                </TableCell>
              </TableRow>
            ) : (
              data.history.map((row: any, i: number) => {
                let badgeColor = "bg-muted text-navy";
                if (row.action_type === "Shortlisted") badgeColor = "bg-saffron/20 text-saffron";
                if (row.action_type === "Interview") badgeColor = "bg-blue-100 text-blue-700";
                if (row.action_type === "Hired") badgeColor = "bg-india-green/15 text-india-green";
                if (row.action_type === "Rejected") badgeColor = "bg-red-100 text-red-700";

                return (
                  <TableRow key={i}>
                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                      {new Date(row.date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="font-bold text-navy">{row.candidate_name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{row.job_title}</TableCell>
                    <TableCell>
                      {row.event_id ? (
                        <Badge variant="outline" className="text-saffron border-saffron/30 bg-saffron/5">Event</Badge>
                      ) : (
                        <Badge variant="outline" className="text-india-green border-india-green/30 bg-india-green/5">Direct</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={badgeColor}>{row.action_type}</Badge>
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