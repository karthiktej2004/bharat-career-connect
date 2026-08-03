import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DashShell, PageHeader, StatCard } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, CalendarDays, Clock, Activity, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/interviews")({
  head: () => ({ meta: [{ title: "Interviews — Admin" }] }),
  component: AdminInterviews,
});

interface StallData {
  stall_code: string;
  company_name: string;
  waiting: string | number;
  completed: string | number;
  last_called: string | null;
}

interface ActivityData {
  company_name: string;
  action: string;
  time: string;
}

interface DashboardStats {
  activeStalls: number;
  scheduled: number;
  avgWaitTime: number;
  stalls: StallData[];
  activities: ActivityData[];
}

function AdminInterviews() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("http://15.207.249.155:5000/api/admin/interviews/dashboard");
      const json = await response.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (error) {
      console.error("Failed to load interview dashboard:", error);
      toast.error("Failed to sync live interview data.");
    } finally {
      setLoading(false);
    }
  };

  // Poll for live updates every 15 seconds
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Calculate if a stall is delayed (more than 15 minutes since last call and people are waiting)
  const getStallStatus = (stall: StallData) => {
    if (!stall.last_called || Number(stall.waiting) === 0) return { label: "On time", color: "bg-india-green/15 text-india-green" };
    
    const minutesSinceLastCall = Math.floor((new Date().getTime() - new Date(stall.last_called).getTime()) / 60000);
    if (minutesSinceLastCall > 15) {
      return { label: `Delayed ${minutesSinceLastCall}m`, color: "bg-destructive/15 text-destructive" };
    }
    return { label: "On time", color: "bg-india-green/15 text-india-green" };
  };

  const actionColor: Record<string, string> = {
    shortlisted: "bg-saffron/15 text-saffron",
    interviewed: "bg-blue-100 text-blue-700",
    hired: "bg-india-green/15 text-india-green",
  };

  return (
    <DashShell role="admin" nav={adminNav}>
      <PageHeader 
        title="Interview Management" 
        description="Real-time tracking across every stall and panel." 
      />

      {loading && !data ? (
        <div className="flex justify-center items-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-navy" />
        </div>
      ) : data ? (
        <>
          <div className="grid sm:grid-cols-3 gap-6 mb-8">
            <StatCard label="Active Stalls" value={String(data.activeStalls)} icon={Users} accent="saffron" />
            <StatCard label="Scheduled by Employers" value={String(data.scheduled)} icon={CalendarDays} accent="india-green" />
            <StatCard label="Avg. Wait Time" value={`${data.avgWaitTime} min`} icon={Clock} accent="navy" />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-display font-bold text-navy text-lg">Live stalls</h3>
              
              {data.stalls.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground border-border/60">
                  No active stalls found for live events.
                </Card>
              ) : (
                data.stalls.map((stall, idx) => {
                  const status = getStallStatus(stall);
                  const currentSlot = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <Card key={idx} className="p-5 border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-navy text-lg">{stall.stall_code} · {stall.company_name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">Current slot: {currentSlot}</p>
                      </div>
                      
                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <p className="text-xs font-medium text-muted-foreground uppercase">Waiting</p>
                          <p className="text-xl font-bold text-saffron">{stall.waiting}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-medium text-muted-foreground uppercase">Completed</p>
                          <p className="text-xl font-bold text-india-green">{stall.completed}</p>
                        </div>
                        <div className="w-24 text-right">
                          <Badge className={`${status.color} hover:bg-transparent shadow-none`}>
                            {status.label}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>

            <div>
              <Card className="p-6 border-border/60 sticky top-4 h-fit">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="h-5 w-5 text-india-green" />
                  <h3 className="font-display font-bold text-navy text-lg">Employer activity</h3>
                </div>
                
                {data.activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    No activity yet. Employer actions on applicants (Shortlist / Interview / Hire) will appear here in real time.
                  </p>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {data.activities.map((act, i) => (
                      <div key={i} className="flex gap-3 text-sm border-l-2 border-saffron/40 pl-3 py-1">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Badge className={actionColor[act.action.toLowerCase()] || "bg-muted text-navy"}>
                              {act.action}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="font-medium text-navy">
                            {act.company_name} <span className="font-normal text-muted-foreground">updated a candidate</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </>
      ) : null}
    </DashShell>
  );
}
