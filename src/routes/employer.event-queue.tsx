import { createFileRoute } from "@tanstack/react-router";
import { DashShell, PageHeader } from "@/components/DashShell";
import { employerNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, PhoneCall, CheckCircle, XCircle, Clock, Users, Ticket, History, ThumbsUp, ThumbsDown, Award } from "lucide-react";
import { getSession } from "@/lib/mockStore";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/employer/event-queue")({
  head: () => ({ meta: [{ title: "Live Event Queue — Employer" }] }),
  component: EmployerEventQueue,
});

function CountdownTimer({ expiresAt, onExpire }: { expiresAt: string; onExpire: () => void }) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!expiresAt) return;
    const calculateTime = () => {
      const diff = new Date(expiresAt).getTime() - new Date().getTime();
      const seconds = Math.floor(diff / 1000);
      if (seconds <= 0) {
        setTimeLeft(0);
        onExpire();
      } else {
        setTimeLeft(seconds);
      }
    };
    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg shadow-sm animate-pulse">
      <Clock className="h-4 w-4" />
      <span>{timeLeft > 0 ? `${minutes}:${seconds < 10 ? '0' : ''}${seconds}` : "Timer Expired!"}</span>
    </div>
  );
}

function EmployerEventQueue() {
  const user = typeof window !== "undefined" ? getSession() : null;
  const [queueList, setQueueList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [eventJobs, setEventJobs] = useState<any[]>([]);

  // Dynamically pull the event ID from the selected job
  const selectedJob = eventJobs.find(j => j.id.toString() === selectedJobId);
  const activeEventId = selectedJob?.event_id;

  const fetchEmployerJobs = async () => {
    if (!user || !user.id) return;
    try {
      // Use the filtered job-options endpoint so completed events are hidden
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/employer/${user.id}/job-options`);
      const json = await res.json();
      if (json.success) {
        setEventJobs(json.data);
        if (json.data.length > 0 && !selectedJobId) {
          setSelectedJobId(json.data[0].id.toString());
        }
      }
    } catch (err) {
      console.error("Failed to fetch event job options", err);
    }
  };

  const fetchQueue = async () => {
    if (!user || !user.id || !activeEventId) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/employer/${user.id}/events/${activeEventId}/queue${selectedJobId ? `?jobId=${selectedJobId}` : ''}`);
      const json = await res.json();
      if (json.success) setQueueList(json.data);
    } catch (err) {
      console.error("Failed to fetch queue", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployerJobs();
  }, []);

  useEffect(() => {
    if (selectedJobId && activeEventId) {
      setIsLoading(true);
      fetchQueue();
      const interval = setInterval(fetchQueue, 5000); // Auto-refresh live queue every 5s
      return () => clearInterval(interval);
    }
  }, [selectedJobId, activeEventId]);

  const handleCallNext = async () => {
    if (!selectedJobId) return toast.error("Please select a job position first.");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/employer/queue/call-next`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: Number(activeEventId), jobId: Number(selectedJobId), employerId: user?.id })
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

  const handleUpdateQueueStatus = async (queueId: number, status: string, appId: string) => {
    try {
      // 1. Update queue table status
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/employer/queue/${queueId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      
      // 2. If interview is completed, update the main application status automatically!
      if (status === 'completed' && appId) {
        await handleUpdateAppStatus(appId, "Interviewed");
      }
      
      toast.success(`Candidate marked as ${status}`);
      fetchQueue();
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  const handleUpdateAppStatus = async (appId: string, status: string) => {
    if (!appId) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/employer/applications/${appId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const json = await res.json();
      if (json.success) {
        if (status !== 'Interviewed') toast.success(`Candidate moved to ${status}`);
        fetchQueue(); // Refresh to update badges in history
      }
    } catch (err) {
      toast.error("Failed to update final status.");
    }
  };

  // Split Queue into Active and History
  const activeQueue = queueList.filter(q => q.status === 'waiting' || q.status === 'called');
  const historyQueue = queueList.filter(q => q.status === 'completed' || q.status === 'missed').reverse();

  return (
    <DashShell role="employer" nav={employerNav}>
      <PageHeader title="Live Interview Queue & Workspace" description="Manage your venue stall queue, call candidates, and finalize hiring decisions." />

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <select 
          className="border border-slate-300 rounded-lg px-4 py-2.5 bg-white text-navy font-semibold text-sm shadow-sm sm:w-80"
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
        >
          <option value="">Select Event Job Position</option>
          {eventJobs.map((j) => (
            <option key={j.id} value={j.id}>{j.title}</option>
          ))}
        </select>
        <Button onClick={fetchQueue} variant="outline" className="text-navy font-semibold bg-white shadow-sm border-slate-300">
          Refresh Queue
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 bg-white border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-saffron/10 text-saffron"><Users className="h-6 w-6" /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Waiting</p>
            <p className="text-3xl font-display font-bold text-navy">{activeQueue.filter(q => q.status === 'waiting').length}</p>
          </div>
        </Card>
        <Card className="p-6 bg-white border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-100 text-blue-600"><PhoneCall className="h-6 w-6" /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Currently Called</p>
            <p className="text-3xl font-display font-bold text-navy">{activeQueue.filter(q => q.status === 'called').length}</p>
          </div>
        </Card>
        <Card className="p-6 bg-white border-slate-200 shadow-sm flex flex-col justify-center">
          <Button onClick={handleCallNext} className="bg-saffron text-navy hover:bg-saffron/90 font-bold w-full py-6 text-base shadow-sm">
            <PhoneCall className="h-5 w-5 mr-2" /> Call Next Candidate
          </Button>
        </Card>
      </div>

      <Card className="p-6 border-slate-200 shadow-sm bg-white mb-8">
        <h3 className="font-display font-bold text-navy text-xl mb-5 flex items-center gap-2">
          <Ticket className="h-6 w-6 text-saffron" /> Active Queue Line
        </h3>

        {isLoading ? (
          <div className="py-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-saffron" /></div>
        ) : activeQueue.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-medium bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No candidates currently waiting. Go to Applications to send candidates to the queue.
          </div>
        ) : (
          <div className="space-y-4">
            {activeQueue.map((q) => {
              const isCalled = q.status === 'called';
              return (
                <div key={q.id} className={`p-4 rounded-xl border-2 flex items-center justify-between gap-4 flex-wrap transition-colors ${isCalled ? 'bg-saffron/5 border-saffron shadow-sm' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`size-14 rounded-xl flex flex-col items-center justify-center font-bold text-white shadow-sm ${isCalled ? 'bg-saffron text-navy' : 'bg-navy'}`}>
                      <span className="text-[10px] uppercase opacity-75">Token</span>
                      <span className="text-lg">#{q.tokenNumber}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-navy text-lg">{q.candidateName}</h4>
                      <p className="text-sm text-slate-500 font-medium">{q.qualification} · Phone: {q.phone || 'N/A'}</p>
                      <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Applying for: {q.jobTitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge className={`text-sm px-3 py-1 ${isCalled ? 'bg-saffron text-navy font-bold animate-pulse' : 'bg-slate-200 text-slate-700 border-0 font-semibold'}`}>
                      {q.status.toUpperCase()}
                    </Badge>

                    {isCalled && q.timerExpiresAt && (
                      <CountdownTimer expiresAt={q.timerExpiresAt} onExpire={() => handleUpdateQueueStatus(q.id, 'missed', q.applicationId)} />
                    )}

                    <div className="flex items-center gap-2">
                      <Button size="sm" className="bg-india-green text-white hover:bg-india-green/90 font-semibold shadow-sm" onClick={() => handleUpdateQueueStatus(q.id, 'completed', q.applicationId)}>
                        <CheckCircle className="h-4 w-4 mr-1.5" /> Complete
                      </Button>
                      <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 font-semibold" onClick={() => handleUpdateQueueStatus(q.id, 'missed', q.applicationId)}>
                        <XCircle className="h-4 w-4 mr-1.5" /> No-Show
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* NEW PIPELINE FEATURE: HISTORY & FINAL DECISION */}
      <Card className="p-6 border-slate-200 shadow-sm bg-white">
        <h3 className="font-display font-bold text-navy text-xl mb-5 flex items-center gap-2">
          <History className="h-6 w-6 text-slate-400" /> Queue History & Final Decisions
        </h3>
        
        {historyQueue.length === 0 ? (
          <div className="py-8 text-center text-slate-400 font-medium">No completed interviews yet.</div>
        ) : (
          <div className="space-y-4">
            {historyQueue.map((q) => {
              const appStatus = q.appStatus;
              return (
                <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-4 flex-wrap hover:border-slate-300 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm">
                      #{q.tokenNumber}
                    </div>
                    <div>
                      <h4 className="font-bold text-navy">{q.candidateName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={q.status === 'completed' ? 'text-india-green border-india-green/30 bg-india-green/5' : 'text-red-500 border-red-200 bg-red-50'}>
                          Queue: {q.status.toUpperCase()}
                        </Badge>
                        <Badge className="bg-slate-100 text-slate-600 border-0">App Status: {appStatus}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                    <Button size="sm" variant="ghost" className="text-teal-600 hover:bg-teal-50 hover:text-teal-700 font-semibold" onClick={() => handleUpdateAppStatus(q.applicationId, 'Offer')}>
                      <ThumbsUp className="h-4 w-4 mr-1.5" /> Make Offer
                    </Button>
                    <Separator orientation="vertical" className="h-6 bg-slate-200" />
                    <Button size="sm" variant="ghost" className="text-india-green hover:bg-india-green/10 hover:text-india-green font-semibold" onClick={() => handleUpdateAppStatus(q.applicationId, 'Hired')}>
                      <Award className="h-4 w-4 mr-1.5" /> Hire
                    </Button>
                    <Separator orientation="vertical" className="h-6 bg-slate-200" />
                    <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold" onClick={() => handleUpdateAppStatus(q.applicationId, 'Rejected')}>
                      <ThumbsDown className="h-4 w-4 mr-1.5" /> Reject
                    </Button>
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
