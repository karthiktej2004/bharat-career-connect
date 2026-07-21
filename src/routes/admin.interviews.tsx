import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashShell, PageHeader, StatCard } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Video, MapPin, Activity } from "lucide-react";
import { listInterviews, listEmployerActions, type ScheduledInterview, type EmployerActionEvent } from "@/lib/mockStore";

export const Route = createFileRoute("/admin/interviews")({
  head: () => ({ meta: [{ title: "Interviews — Admin" }] }),
  component: Interviews,
});

const liveStalls = [
  { stall: "A-12 · Infosys", current: "10:30", waiting: 18, completed: 24, status: "On time" },
  { stall: "A-18 · Mindtree", current: "10:45", waiting: 24, completed: 19, status: "Delayed 15m" },
  { stall: "B-04 · Reliance Retail", current: "10:20", waiting: 8, completed: 32, status: "On time" },
  { stall: "C-09 · Bosch Limited", current: "11:00", waiting: 12, completed: 18, status: "On time" },
  { stall: "A-22 · Wipro", current: "10:35", waiting: 14, completed: 21, status: "On time" },
];

function Interviews() {
  const [ivs, setIvs] = useState<ScheduledInterview[]>([]);
  const [actions, setActions] = useState<EmployerActionEvent[]>([]);
  useEffect(() => {
    const sync = () => { setIvs(listInterviews()); setActions(listEmployerActions()); };
    sync();
    window.addEventListener("bcc-interviews", sync);
    window.addEventListener("bcc-employer-actions", sync);
    return () => {
      window.removeEventListener("bcc-interviews", sync);
      window.removeEventListener("bcc-employer-actions", sync);
    };
  }, []);

  const scheduled = ivs.filter((iv) => iv.status === "Scheduled");
  const actionColor: Record<EmployerActionEvent["action"], string> = {
    Applied: "bg-muted text-navy",
    Shortlisted: "bg-saffron/15 text-saffron",
    Interview: "bg-blue-100 text-blue-700",
    Hired: "bg-india-green/15 text-india-green",
    Rejected: "bg-destructive/15 text-destructive",
  };

  return (
    <DashShell role="admin" nav={adminNav}>
      <PageHeader title="Interview Management" description="Real-time tracking across every stall and panel." />
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Active Stalls" value="22" icon={Users} />
        <StatCard label="Scheduled by Employers" value={String(scheduled.length)} icon={Calendar} accent="india-green" />
        <StatCard label="Avg. Wait Time" value="12 min" icon={Clock} accent="navy" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <h2 className="font-display font-bold text-navy">Live stalls</h2>
          {liveStalls.map((s) => (
            <Card key={s.stall} className="p-5 border-border/60 grid md:grid-cols-5 gap-4 items-center">
              <div className="md:col-span-2"><h3 className="font-display font-bold text-navy">{s.stall}</h3><p className="text-xs text-muted-foreground mt-1">Current slot: {s.current}</p></div>
              <div className="text-center"><p className="text-xs text-muted-foreground">Waiting</p><p className="font-display font-bold text-xl text-saffron">{s.waiting}</p></div>
              <div className="text-center"><p className="text-xs text-muted-foreground">Completed</p><p className="font-display font-bold text-xl text-india-green">{s.completed}</p></div>
              <div className="text-right"><Badge className={s.status === "On time" ? "bg-india-green/15 text-india-green" : "bg-destructive/15 text-destructive"}>{s.status}</Badge></div>
            </Card>
          ))}

          <h2 className="font-display font-bold text-navy mt-6">Interviews scheduled by employers</h2>
          {scheduled.length === 0 && (
            <Card className="p-6 text-center text-muted-foreground border-border/60">No employer-scheduled interviews yet.</Card>
          )}
          {scheduled.map((iv) => (
            <Card key={iv.id} className="p-4 border-border/60 flex items-center gap-4">
              <div className="text-center w-20 shrink-0">
                <p className="font-display font-bold text-navy">{iv.time}</p>
                <p className="text-xs text-muted-foreground">{new Date(iv.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy text-sm">{iv.applicantName} <span className="text-muted-foreground font-normal">→ {iv.company}</span></p>
                <p className="text-xs text-muted-foreground">{iv.jobTitle}</p>
              </div>
              <Badge className={iv.mode === "Online" ? "bg-india-green/15 text-india-green gap-1" : "bg-saffron/15 text-saffron gap-1"}>
                {iv.mode === "Online" ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}{iv.mode}
              </Badge>
            </Card>
          ))}
        </div>

        <Card className="p-4 border-border/60 h-fit">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4 text-india-green" />
            <h2 className="font-display font-bold text-navy">Employer activity</h2>
          </div>
          {actions.length === 0 && <p className="text-sm text-muted-foreground">No activity yet. Employer actions on applicants (Shortlist / Interview / Hire) will appear here in real time.</p>}
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {actions.map((a) => (
              <div key={a.id} className="text-sm border-l-2 border-saffron/40 pl-3 py-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={actionColor[a.action]}>{a.action}</Badge>
                  <span className="text-xs text-muted-foreground">{new Date(a.at).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <p className="text-navy mt-0.5"><b>{a.employerName}</b> · {a.applicantName}</p>
                <p className="text-xs text-muted-foreground">{a.jobTitle}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashShell>
  );
}
