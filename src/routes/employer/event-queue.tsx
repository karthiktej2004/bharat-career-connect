import { createFileRoute } from "@tanstack/react-router";
import { DashShell, PageHeader } from "@/components/DashShell";
import { employerNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, PhoneCall, CheckCircle, XCircle, Clock, Users, Ticket } from "lucide-react";
import { getSession } from "@/lib/mockStore";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/employer/event-queue")({
  head: () => ({ meta: [{ title: "Live Event Queue — Employer" }] }),
  component: EmployerEventQueue,
});

function EmployerEventQueue() {
  const user = typeof window !== "undefined" ? getSession() : null;
  const [queueList, setQueueList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [eventJobs, setEventJobs] = useState<any[]>([]);
  const [activeEventId, setActiveEventId] = useState<number>(3); // Bengaluru Udyoga Mela 2026 event_id = 3

  const fetchQueue = async () => {
    if (!user || !user.id) return;
    try {
      const res = await fetch(`https://bcc-backend-0cny.onrender.com/api/employer/${user.id}/events/${activeEventId}/queue${selectedJobId ? `?jobId=${selectedJobId}` : ''}`);
      const json = await res.json();
      if (json.success) {
        setQueueList(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch queue", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployerJobs = async () => {
    if (!user || !user.id) return;
    try {
      const res = await fetch(`https://bcc-backend-0cny.onrender.com/api/employer/${user.id}/jobs-list`);
      const json = await res.json();
      if (json.success) {
        setEventJobs(json.data.filter((j: any) => j.event_id == activeEventId));
        if (json.data.length > 0 && !selectedJobId) {
          const matching = json.data.find((j: any) => j.event_id == activeEventId);
          if (matching) setSelectedJobId(matching.id.toString());
        }
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchEmployerJobs();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      fetchQueue();
      const interval = setInterval(fetchQueue, 5000); // Auto-refresh live queue every 5s
      return () => clearInterval(interval);
    }
  }, [selectedJobId]);

  const handleCallNext = async () => {
    if (!selectedJobId) { toast.error("Please select a job first."); return; }
    try {
      const res = await fetch(`https://bcc-backend-0cny.onrender.com/api/employer/queue/call-next`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: activeEventId, jobId: selectedJobId, employerId: user?.id })
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        fetchQueue();
      } else {
        toast.error(json.message || "Failed to call next candidate.");
      }
    } catch (err) {
      toast.error("Server connection error.");
    }
  };

  const handleUpdateStatus = async (queueId: number, status: string) => {
    try {
      const res = await fetch(`https://bcc-backend-0cny.onrender.com/api/employer/queue/${queueId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        fetchQueue();
      } else {
        toast.error(json.message);
      }
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  return (
    <DashShell role="employer" nav={employerNav}>
      <PageHeader title="Live Interview Queue & Workspace" description="Manage your venue stall queue, call candidates, and track active 5-minute timers." />

      <div className="flex gap-4 mb-6">
        <select 
          className="border border-border rounded-lg px-3 py-2 bg-white text-navy font-medium text-sm"
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
        >
          <option value="">Select Job Position</option>
          {eventJobs.map((j) => (
            <option key={j.id} value={j.id}>{j.title} ({j.company_name})</option>
          ))}
        </select>
        <Button onClick={fetchQueue} className="bg-navy text-white">Refresh Queue</Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 bg-white border-border/60 flex items-center gap-4">
          <div className="p-3 rounded-full bg-saffron/10 text-saffron"><Users className="h-6 w-6" /></div>
          <div>
            <p className="text-sm text-muted-foreground">Total Waiting</p>
            <p className="text-2xl font-bold text-navy">{queueList.filter(q => q.status === 'waiting').length}</p>
          </div>
        </Card>
        <Card className="p-6 bg-white border-border/60 flex items-center gap-4">
          <div className="p-3 rounded-full bg-india-green/10 text-india-green"><PhoneCall className="h-6 w-6" /></div>
          <div>
            <p className="text-sm text-muted-foreground">Currently Called</p>
            <p className="text-2xl font-bold text-navy">{queueList.filter(q => q.status === 'called').length}</p>
          </div>
        </Card>
        <Card className="p-6 bg-white border-border/60 flex flex-col justify-center">
          <Button onClick={handleCallNext} className="bg-saffron text-navy hover:bg-saffron/90 font-bold w-full py-6 text-base">
            <PhoneCall className="h-5 w-5 mr-2" /> Call Next Candidate
          </Button>
        </Card>
      </div>

      <Card className="p-6 border-border/60 bg-white">
        <h3 className="font-display font-bold text-navy text-lg mb-4 flex items-center gap-2">
          <Ticket className="h-5 w-5 text-saffron" /> Active Queue Line
        </h3>

        {isLoading ? (
          <div className="py-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-saffron" /></div>
        ) : queueList.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">No candidates currently in queue for this role.</div>
        ) : (
          <div className="space-y-3">
            {queueList.map((q) => {
              const isCalled = q.status === 'called';
              const isWaiting = q.status === 'waiting';

              return (
                <div key={q.id} className={`p-4 rounded-xl border flex items-center justify-between gap-4 flex-wrap ${isCalled ? 'bg-saffron/10 border-saffron' : 'bg-slate-50 border-border/60'}`}>
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-navy text-white flex flex-col items-center justify-center font-bold">
                      <span className="text-[10px] uppercase opacity-75">Token</span>
                      <span>#{q.tokenNumber}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-navy text-base">{q.candidateName}</h4>
                      <p className="text-xs text-muted-foreground">{q.qualification} · Phone: {q.phone || 'N/A'}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Applied for: <span className="font-semibold text-navy">{q.jobTitle}</span></p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className={isCalled ? 'bg-saffron text-navy font-bold animate-pulse' : isWaiting ? 'bg-slate-200 text-slate-700' : 'bg-india-green text-white'}>
                      {q.status.toUpperCase()}
                    </Badge>

                    {isCalled && (
                      <div className="flex items-center gap-1 text-xs font-mono text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded">
                        <Clock className="h-3.5 w-3.5" /> 5-Min Active Timer
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="outline" className="border-india-green text-india-green hover:bg-india-green/10" onClick={() => handleUpdateStatus(q.id, 'completed')}>
                        <CheckCircle className="h-4 w-4 mr-1" /> Complete
                      </Button>
                      <Button size="sm" variant="outline" className="border-red-500 text-red-500 hover:bg-red-50" onClick={() => handleUpdateStatus(q.id, 'missed')}>
                        <XCircle className="h-4 w-4 mr-1" /> No-Show
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </DashShell>
  );
}
