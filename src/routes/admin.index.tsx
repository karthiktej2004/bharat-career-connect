import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DashShell, PageHeader, StatCard } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Users, QrCode, MessageSquareHeart, Award, Activity, AlertTriangle, Loader2, Download, PowerOff, CheckCircle2 } from "lucide-react";
import { Counter } from "@/components/Counter";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin Live Monitoring — Bharat Career Connect" }] }),
  component: AdminHome,
});

function AdminHome() {
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [crowdData, setCrowdData] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // States for End Event flow
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);

  // 1. Fetch Master Live Events
  const fetchLiveEvents = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/live-events`);
      const json = await res.json();
      if (json.success) setLiveEvents(json.data);
    } catch (err) {
      console.error("Failed to fetch live events:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveEvents();
    const interval = setInterval(fetchLiveEvents, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // 2. Fetch Crowd Monitoring Data for the Graph & Alerts
  useEffect(() => {
    const activeEvent = liveEvents[activeIndex];
    if (!activeEvent) return;

    const fetchCrowd = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/events/${activeEvent.id}/crowd-monitoring`);
            const json = await res.json();
            if (json.success) setCrowdData(json.data);
        } catch (err) {
            console.error("Failed to fetch crowd data:", err);
        }
    };

    fetchCrowd();
    const crowdInterval = setInterval(fetchCrowd, 15000); // refresh crowd data every 15s
    return () => clearInterval(crowdInterval);
  }, [activeIndex, liveEvents]);

  // --- FULL WORKING DOWNLOAD DATA LOGIC ---
  const handleDownloadData = async () => {
    const activeEvent = liveEvents[activeIndex];
    if (!activeEvent) return;

    setIsDownloading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/events/${activeEvent.id}/export`);
      
      if (!response.ok) throw new Error("Failed to generate report from server.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${activeEvent.name.replace(/\s+/g, "_")}_Master_Report.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Event Data Report downloaded successfully!");
      setHasDownloaded(true); // Unlocks the End Event button confirmation
    } catch (error) {
      toast.error("Download failed. Please check your database connection.");
    } finally {
      setIsDownloading(false);
    }
  };

  // --- FULL WORKING END EVENT LOGIC ---
  const handleEndEvent = async () => {
    const activeEvent = liveEvents[activeIndex];
    setIsEnding(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/events/${activeEvent.id}/complete`, {
          method: "PUT"
      });
      const json = await res.json();

      if (json.success) {
          toast.success(`${activeEvent.name} has been officially ended and moved to history.`);
          setIsEndModalOpen(false);
          
          // Remove from local state
          const updatedEvents = liveEvents.filter((_, idx) => idx !== activeIndex);
          setLiveEvents(updatedEvents);
          setActiveIndex(0);
          setHasDownloaded(false);
          setCrowdData([]);
      } else {
          toast.error(json.message || "Failed to end event.");
      }
    } catch (error) {
      toast.error("Network error while trying to end event.");
    } finally {
      setIsEnding(false);
    }
  };

  // --- DYNAMIC ALERTS CALCULATION ---
  const alerts = crowdData
    .filter(c => parseInt(c.waitingCount) >= 3) // Alert triggers if 3 or more candidates are waiting
    .sort((a, b) => parseInt(b.waitingCount) - parseInt(a.waitingCount))
    .slice(0, 5); // Show top 5 worst queues

  if (isLoading) return <DashShell role="admin" nav={adminNav}><div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-navy" /><span className="ml-2 text-navy font-medium">Syncing live data...</span></div></DashShell>;
  if (liveEvents.length === 0) return <DashShell role="admin" nav={adminNav}><PageHeader title="Live Event Monitoring" description="No events are currently live." /><Card className="p-12 text-center border-border/60"><Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" /><h2 className="text-xl font-display font-bold text-navy">System Standby</h2><p className="text-muted-foreground mt-2">Activate an event from the Event Approvals tab to see live analytics here.</p></Card></DashShell>;

  const activeEvent = liveEvents[activeIndex];
  const totalAttendance = activeEvent.attendance.candidates + activeEvent.attendance.employers;
  const totalRegistrations = activeEvent.registrations.candidates + activeEvent.registrations.employers;

  return (
    <DashShell role="admin" nav={adminNav}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-navy">Live Event Monitoring</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground">{activeEvent.name} · {activeEvent.location}</p>
            <Badge className="bg-india-green text-white animate-pulse">● LIVE</Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" className="border-navy/20 text-navy hover:bg-navy/5 cursor-pointer" onClick={handleDownloadData} disabled={isDownloading}>
            {isDownloading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
            Download Data
          </Button>
          <Button variant="destructive" onClick={() => setIsEndModalOpen(true)}>
            <PowerOff className="h-4 w-4 mr-2" /> End Event
          </Button>
        </div>
      </div>

      {liveEvents.length > 1 && (
        <div className="flex overflow-x-auto gap-2 mb-6 pb-2 no-scrollbar">
          {liveEvents.map((ev, idx) => (
            <Button key={ev.id} variant={idx === activeIndex ? "default" : "outline"} onClick={() => { setActiveIndex(idx); setHasDownloaded(false); }} className={`whitespace-nowrap transition-all ${idx === activeIndex ? "bg-navy text-white hover:bg-navy/90" : "border-navy/20 text-navy hover:bg-navy/5"}`}>
              {ev.name}
            </Button>
          ))}
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          label="Registrations" 
          value={(totalRegistrations === 0 ? <span className="text-sm font-medium text-muted-foreground tracking-tight leading-tight block mt-1">No registrations yet</span> : <Counter to={totalRegistrations} />) as unknown as string} 
          icon={Users} 
          accent="navy" 
          trend={`${activeEvent.registrations.candidates} Candidates · ${activeEvent.registrations.employers} Employers`} 
        />
        <StatCard 
          label="Attendance Check-ins" 
          value={<Counter to={totalAttendance} /> as unknown as string} 
          icon={QrCode} 
          accent="saffron" 
          trend={`${activeEvent.attendance.candidates} Candidates · ${activeEvent.attendance.employers} Employers`} 
        />
        <StatCard label="Interviews Conducted" value={<Counter to={activeEvent.interviews} /> as unknown as string} icon={MessageSquareHeart} accent="india-green" />
        <StatCard label="Offers (Hired)" value={<Counter to={activeEvent.offers} /> as unknown as string} icon={Award} accent="india-green" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-6 border-border/60 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-navy">Live Stall Activity</h2>
              <Activity className="h-5 w-5 text-india-green animate-pulse" />
          </div>
          {crowdData.length === 0 ? (
              <div className="flex items-center justify-center h-[260px] text-muted-foreground">Waiting for stall activity data...</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
                <BarChart data={crowdData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" vertical={false} />
                <XAxis dataKey="companyName" axisLine={false} tickLine={false} tick={{fontSize: 11}} width={100} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: '1px solid #e2e8f0'}} />
                <Legend iconType="circle" />
                <Bar dataKey="waitingCount" name="Candidates Waiting" fill="var(--saffron)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="completedCount" name="Interviews Completed" fill="var(--india-green)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
        
        <Card className="p-6 border-border/60">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-navy">Queue Alerts</h2>
            <AlertTriangle className={alerts.length > 0 ? "h-5 w-5 text-destructive" : "h-5 w-5 text-slate-300"} />
          </div>
          <div className="space-y-3 text-sm">
            {alerts.length === 0 ? (
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
                    <CheckCircle2 className="h-8 w-8 text-india-green/50 mb-2" />
                    <p className="font-medium text-slate-600">All Clear</p>
                    <p className="text-xs text-slate-500 mt-1">No major bottlenecks reported at any stalls currently.</p>
                </div>
            ) : (
                alerts.map((alert, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                        <p className="font-semibold text-destructive">High Queue: {alert.companyName}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{alert.waitingCount} candidates currently waiting.</p>
                    </div>
                ))
            )}
          </div>
        </Card>
      </div>

      {/* End Event Confirmation Modal */}
      <Dialog open={isEndModalOpen} onOpenChange={setIsEndModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End Live Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to end <strong>{activeEvent?.name}</strong>? This will close all active QR gates and move the event to history.
            </DialogDescription>
          </DialogHeader>
          
          {!hasDownloaded && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-md text-sm mt-2">
              <AlertTriangle className="h-4 w-4 inline mr-2 mb-0.5" />
              <strong>Warning:</strong> You must download the final event data report before ending the event.
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsEndModalOpen(false)}>Cancel</Button>
            {!hasDownloaded ? (
               <Button onClick={handleDownloadData} className="bg-navy text-white hover:bg-navy/90">
                 <Download className="h-4 w-4 mr-2" /> Download Data Now
               </Button>
            ) : (
              <Button variant="destructive" onClick={handleEndEvent} disabled={isEnding}>
                  {isEnding ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <PowerOff className="h-4 w-4 mr-2" />}
                  Confirm End Event
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
    </DashShell>
  );
}
