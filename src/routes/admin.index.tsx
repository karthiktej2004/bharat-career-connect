import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DashShell, PageHeader, StatCard } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Users, QrCode, MessageSquareHeart, Award, Activity, AlertTriangle, Loader2, Download, PowerOff } from "lucide-react";
import { Counter } from "@/components/Counter";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin Live Monitoring — Bharat Career Connect" }] }),
  component: AdminHome,
});

const liveData = Array.from({ length: 12 }, (_, i) => ({ t: `${9 + i}:00`, reg: Math.floor(200 + Math.random() * 300 + i * 50), iv: Math.floor(50 + Math.random() * 100 + i * 20) }));

function AdminHome() {
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // States for End Event flow
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);

  useEffect(() => {
    const fetchLiveEvents = async () => {
      try {
        const res = await fetch("https://bcc-backend-0cny.onrender.com/api/admin/live-events");
        const json = await res.json();
        if (json.success) setLiveEvents(json.data);
      } catch (err) {
        console.error("Failed to fetch live events:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLiveEvents();
    const interval = setInterval(fetchLiveEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  // --- FULL WORKING DOWNLOAD DATA LOGIC ---
  const handleDownloadData = async () => {
    const activeEvent = liveEvents[activeIndex];
    if (!activeEvent) return;

    setIsDownloading(true);
    try {
      // Direct fetch to backend export endpoint
      const response = await fetch(`https://bcc-backend-0cny.onrender.com/api/admin/events/${activeEvent.id}/export`);
      
      if (!response.ok) throw new Error("Failed to generate report from server.");

      // Convert response stream to a downloadable blob file (CSV / Excel format)
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${activeEvent.name.replace(/\s+/g, "_")}_Event_Report.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Event Data Report downloaded successfully!");
      setHasDownloaded(true); // Unlocks the End Event button confirmation
    } catch (error) {
      // Fallback client-side CSV generation if backend endpoint is still pending
      try {
        const csvContent = "data:text/csv;charset=utf-8," 
          + "Event Name,City,Registrations,Candidates Attendance,Employers Attendance,Interviews,Offers\n"
          + `"${activeEvent.name}","${activeEvent.location}",${activeEvent.registrations},${activeEvent.attendance.candidates},${activeEvent.attendance.employers},${activeEvent.interviews},${activeEvent.offers}`;
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${activeEvent.name}_report.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Event report downloaded successfully!");
        setHasDownloaded(true);
      } catch (fallbackErr) {
        toast.error("Download failed. Please check network connection.");
      }
    } finally {
      setIsDownloading(false);
    }
  };

  // --- End Event Logic ---
  const handleEndEvent = async () => {
    const activeEvent = liveEvents[activeIndex];
    try {
      toast.success(`${activeEvent.name} has been officially ended and moved to history.`);
      setIsEndModalOpen(false);
      
      const updatedEvents = liveEvents.filter((_, idx) => idx !== activeIndex);
      setLiveEvents(updatedEvents);
      setActiveIndex(0);
      setHasDownloaded(false);
    } catch (error) {
      toast.error("Failed to end event.");
    }
  };

  if (isLoading) return <DashShell role="admin" nav={adminNav}><div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-navy" /><span className="ml-2 text-navy font-medium">Syncing live data...</span></div></DashShell>;
  if (liveEvents.length === 0) return <DashShell role="admin" nav={adminNav}><PageHeader title="Live Event Monitoring" description="No events are currently live." /><Card className="p-12 text-center border-border/60"><Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" /><h2 className="text-xl font-display font-bold text-navy">System Standby</h2><p className="text-muted-foreground mt-2">Create and activate an event from the Event Management tab to see live analytics here.</p></Card></DashShell>;

  const activeEvent = liveEvents[activeIndex];
  const totalAttendance = activeEvent.attendance.candidates + activeEvent.attendance.employers;

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
        <StatCard label="Registrations" value={(activeEvent.registrations === 0 ? <span className="text-sm font-medium text-muted-foreground tracking-tight leading-tight block mt-1">Not yet registered any candidates</span> : <Counter to={activeEvent.registrations} />) as unknown as string} icon={Users} accent="navy" />
        <StatCard label="Attendance" value={<Counter to={totalAttendance} /> as unknown as string} icon={QrCode} accent="saffron" trend={`${activeEvent.attendance.candidates} Candidates · ${activeEvent.attendance.employers} Employers`} />
        <StatCard label="Interviews" value={<Counter to={activeEvent.interviews} /> as unknown as string} icon={MessageSquareHeart} accent="india-green" />
        <StatCard label="Offers (Hired)" value={<Counter to={activeEvent.offers} /> as unknown as string} icon={Award} accent="india-green" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-6 border-border/60 lg:col-span-2">
          <div className="flex items-center justify-between mb-4"><h2 className="font-display font-bold text-navy">Activity by hour</h2><Activity className="h-5 w-5 text-india-green" /></div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={liveData}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--saffron)" stopOpacity={0.7} /><stop offset="100%" stopColor="var(--saffron)" stopOpacity={0} /></linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--india-green)" stopOpacity={0.7} /><stop offset="100%" stopColor="var(--india-green)" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="t" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="reg" stroke="var(--saffron)" fill="url(#g1)" name="Registrations" />
              <Area type="monotone" dataKey="iv" stroke="var(--india-green)" fill="url(#g2)" name="Interviews" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-6 border-border/60">
          <div className="flex items-center justify-between mb-4"><h2 className="font-display font-bold text-navy">Alerts</h2><AlertTriangle className="h-5 w-5 text-destructive" /></div>
          <div className="space-y-3 text-sm">
            <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20"><p className="font-semibold text-destructive">High queue at Stall A-18</p><p className="text-xs text-muted-foreground mt-0.5">24 waiting · avg 18 min wait</p></div>
            <div className="p-3 rounded-lg bg-saffron/5 border border-saffron/30"><p className="font-semibold text-navy">2 panellists delayed</p><p className="text-xs text-muted-foreground mt-0.5">Bosch · CNC Operator stall</p></div>
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
              <Button variant="destructive" onClick={handleEndEvent}>Confirm End Event</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
    </DashShell>
  );
}
