import { createFileRoute } from "@tanstack/react-router";
import { DashShell, PageHeader } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, AlertTriangle, CheckCircle2, PhoneCall, Loader2, Building2 } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/admin/crowd-monitor")({
  head: () => ({ meta: [{ title: "Live Crowd Monitor — Admin" }] }),
  component: AdminCrowdMonitor,
});

function AdminCrowdMonitor() {
  const [crowdData, setCrowdData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const activeEventId = 3; // Bengaluru Udyoga Mela 2026 event_id = 3

  const fetchCrowdStats = async () => {
    try {
      const res = await fetch(`https://bcc-backend-0cny.onrender.com/api/admin/events/${activeEventId}/crowd-monitoring`);
      const json = await res.json();
      if (json.success) {
        setCrowdData(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch crowd monitoring stats", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCrowdStats();
    const interval = setInterval(fetchCrowdStats, 5000); // Live update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const totalWaitingGlobal = crowdData.reduce((acc, curr) => acc + parseInt(curr.waitingCount || 0), 0);

  return (
    <DashShell role="admin" nav={adminNav}>
      <PageHeader 
        title="Live Venue Crowd Monitoring" 
        description="Real-time aggregation of physical queue lines and stall congestion across the job fair venue." 
      />

      {/* Global Crowd Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 bg-white border-border/60 flex items-center gap-4">
          <div className="p-3 rounded-full bg-saffron/10 text-saffron"><Users className="h-6 w-6" /></div>
          <div>
            <p className="text-sm text-muted-foreground">Total Waiting in Venue</p>
            <p className="text-3xl font-bold text-navy">{totalWaitingGlobal}</p>
          </div>
        </Card>
        <Card className="p-6 bg-white border-border/60 flex items-center gap-4">
          <div className="p-3 rounded-full bg-india-green/10 text-india-green"><PhoneCall className="h-6 w-6" /></div>
          <div>
            <p className="text-sm text-muted-foreground">Active Interviews Going On</p>
            <p className="text-3xl font-bold text-navy">
              {crowdData.reduce((acc, curr) => acc + parseInt(curr.calledCount || 0), 0)}
            </p>
          </div>
        </Card>
        <Card className="p-6 bg-white border-border/60 flex items-center gap-4">
          <div className="p-3 rounded-full bg-blue-50 text-blue-600"><CheckCircle2 className="h-6 w-6" /></div>
          <div>
            <p className="text-sm text-muted-foreground">Completed Today</p>
            <p className="text-3xl font-bold text-navy">
              {crowdData.reduce((acc, curr) => acc + parseInt(curr.completedCount || 0), 0)}
            </p>
          </div>
        </Card>
      </div>

      {/* Stall-by-Stall Congestion Grid */}
      <h3 className="font-display font-bold text-navy text-lg mb-4 flex items-center gap-2">
        <Building2 className="h-5 w-5 text-saffron" /> Stall Congestion Breakdown
      </h3>

      {isLoading ? (
        <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-saffron" /></div>
      ) : crowdData.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">No active employer stalls found for this event.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {crowdData.map((stall) => {
            const waiting = parseInt(stall.waitingCount || 0);
            const isCongested = waiting > 10; // High congestion warning threshold

            return (
              <Card key={stall.employer_id} className={`p-5 border ${isCongested ? 'border-red-300 bg-red-50/30' : 'border-border/60 bg-white'}`}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h4 className="font-bold text-navy text-base">{stall.companyName}</h4>
                  {isCongested && (
                    <Badge className="bg-red-100 text-red-700 border-red-200 gap-1 animate-pulse">
                      <AlertTriangle className="h-3 w-3" /> Congested
                    </Badge>
                  )}
                </div>

                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg">
                    <span>Waiting in Queue:</span>
                    <span className="font-bold text-navy text-base">{waiting} students</span>
                  </div>
                  <div className="flex justify-between items-center px-3 py-1">
                    <span>Currently Called:</span>
                    <span className="font-semibold text-india-green">{stall.calledCount}</span>
                  </div>
                  <div className="flex justify-between items-center px-3 py-1">
                    <span>Completed Interviews:</span>
                    <span className="font-semibold text-slate-700">{stall.completedCount}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </DashShell>
  );
}
