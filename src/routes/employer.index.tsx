import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { DashShell, PageHeader, StatCard } from "@/components/DashShell";
import { employerNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Users, CalendarCheck, Award, ArrowRight, TrendingUp, ShieldCheck, IdCard, Loader2 } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";
import { useEffect, useState } from "react";
import { getSession } from "@/lib/mockStore";

export const Route = createFileRoute("/employer/")({
  head: () => ({ meta: [{ title: "Employer Dashboard — Bharat Career Connect" }] }),
  component: EmployerHome,
});

function EmployerHome() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [employerUser, setEmployerUser] = useState<any>(null);

  useEffect(() => {
    try {
      // Use the standard session utility to match the sidebar's accuracy
      const user = getSession();

      if (!user) {
        navigate({ to: "/auth/login" });
        return;
      }

      if (user.role === "candidate") {
        navigate({ to: "/auth/login" });
        return;
      }

      setEmployerUser(user);

      const activeId = user.id ? user.id.toString() : user.email;
      
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/employer/${activeId}/dashboard`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success) {
            setData(json.data);
          }
        })
        .catch((err) => console.error("Dashboard fetch error:", err))
        .finally(() => setIsLoading(false));

    } catch (e) {
      console.error("Session verification error:", e);
      setIsLoading(false);
    }
  }, [navigate]);

  const formatEmployerId = (id: string | number) => {
    if (!id) return "N/A";
    const numMatch = String(id).match(/\d+/);
    const num = numMatch ? numMatch[0] : "1";
    return `BCC-UMP-EMP-${num.padStart(9, "0")}`;
  };

  const trend = data?.chartData?.map((d: any) => ({ d: d.day, v: d.applications })) || [
    { d: "Mon", v: 0 }, { d: "Tue", v: 0 }, { d: "Wed", v: 0 }, { d: "Thu", v: 0 }, { d: "Fri", v: 0 }, { d: "Sat", v: 0 }, { d: "Sun", v: 0 }
  ];
  
  const funnel = data ? [
    { stage: "Applied", v: data.funnelData?.Applied || 0 },
    { stage: "Shortlisted", v: data.funnelData?.Shortlisted || 0 },
    { stage: "Interview", v: data.funnelData?.Interview || 0 },
    { stage: "Offer", v: data.funnelData?.Offer || 0 },
    { stage: "Hired", v: data.funnelData?.Hired || 0 },
  ] : [];

  if (isLoading) {
    return (
      <DashShell role="employer" nav={employerNav}>
        <div className="flex h-[60vh] items-center justify-center flex-col gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-saffron" />
          <p className="text-muted-foreground animate-pulse">Loading real-time event metrics...</p>
        </div>
      </DashShell>
    );
  }

  // PRIORITIZE THE LOCAL SESSION OVER THE DUMMY API DATA
  const companyName = employerUser?.name || employerUser?.company_name || data?.profile?.company_name || "Company Profile Pending";
  const contactEmail = employerUser?.email || data?.profile?.email || "N/A";
  const displayId = formatEmployerId(employerUser?.id);

  return (
    <DashShell role="employer" nav={employerNav}>
      <PageHeader
        title="Hiring Overview"
        description="Real-time view of your pipeline across all events."
        action={
          <Button asChild className="bg-saffron text-navy hover:bg-saffron/90 font-semibold px-6">
            <Link to="/employer/event-jobs">Post a Job</Link>
          </Button>
        }
      />

      {employerUser && (
        <Card className="p-4 border-border/60 mb-6 flex items-center gap-4 flex-wrap bg-white shadow-sm">
          <div className="flex items-center gap-2 border-r border-border/60 pr-4">
            <ShieldCheck className="h-5 w-5 text-india-green" />
            <span className="font-display font-bold text-navy text-lg">{companyName}</span>
            <Badge className="bg-india-green/15 text-india-green border-0 font-semibold">Verified employer</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground border-r border-border/60 pr-4">
            <IdCard className="h-4 w-4 text-navy" />
            Employer ID: <span className="font-mono text-navy font-semibold">{displayId}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Contact: <b className="text-navy">{contactEmail}</b>
          </div>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="ACTIVE EVENT JOBS" value={data?.kpis?.activeJobs || 0} icon={Briefcase} />
        <StatCard label="APPLICATIONS" value={data?.kpis?.applications || 0} icon={Users} accent="navy" />
        <StatCard label="INTERVIEWS" value={data?.kpis?.interviews || 0} icon={CalendarCheck} accent="india-green" />
        <StatCard label="OFFERS MADE" value={data?.kpis?.offersMade || 0} icon={Award} accent="india-green" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 border-border/60 shadow-sm bg-white">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-navy">Applications — last 7 days</h2>
            <TrendingUp className="h-5 w-5 text-india-green" />
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="opacity-30" />
              <XAxis dataKey="d" axisLine={false} tickLine={false} className="text-xs text-muted-foreground" />
              <Tooltip cursor={{ stroke: "var(--border)", strokeWidth: 1, strokeDasharray: "3 3" }} />
              <Line type="monotone" dataKey="v" stroke="#f97316" strokeWidth={4} dot={{ fill: "#1e293b", r: 4, strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        
        <Card className="p-6 border-border/60 shadow-sm bg-white">
          <h2 className="font-display font-bold text-navy mb-6">Hiring Funnel</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={funnel} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="opacity-30" />
              <XAxis dataKey="stage" axisLine={false} tickLine={false} className="text-xs text-muted-foreground" />
              <Tooltip cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
              <Bar dataKey="v" fill="#15803d" radius={[6, 6, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-6 border-border/60 mt-6 shadow-sm bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-navy">Recent applicants</h2>
          <Button asChild variant="ghost" size="sm" className="text-navy hover:text-navy/80 font-semibold">
            <Link to="/employer/candidates">View all <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="space-y-3">
          {data?.recentApplicants?.length > 0 ? (
            data.recentApplicants.map((app: any) => {
              const appliedDate = new Date(app.applied_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
              
              return (
                <div key={app.application_id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                  <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center text-navy font-bold shrink-0 border border-slate-200">
                    {app.candidate_name?.charAt(0) || "C"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy truncate">{app.candidate_name}</p>
                    <p className="text-sm text-muted-foreground truncate">{app.job_title} · Applied on {appliedDate}</p>
                  </div>
                  <Badge className="bg-india-green/15 text-india-green hidden sm:flex border-0">{app.match_score}% Match</Badge>
                  <Button size="sm" variant="outline" className="shrink-0 border-border/60 hover:bg-slate-100">Review</Button>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-muted-foreground rounded-lg border border-dashed border-border/60 bg-slate-50">
              No recent applications found for your Event Jobs. Post a job to start receiving candidates!
            </div>
          )}
        </div>
      </Card>
    </DashShell>
  );
}
