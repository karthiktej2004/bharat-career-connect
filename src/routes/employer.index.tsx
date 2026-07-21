import { createFileRoute, Link } from "@tanstack/react-router";
import { DashShell, PageHeader, StatCard } from "@/components/DashShell";
import { employerNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Users, CalendarCheck, Award, ArrowRight, TrendingUp, ShieldCheck, IdCard, Clock, Loader2 } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";
import { useEffect, useState } from "react";
import { getSession } from "@/lib/mockStore";

export const Route = createFileRoute("/employer/")({
  head: () => ({ meta: [{ title: "Employer Dashboard — Bharat Career Connect" }] }),
  component: EmployerHome,
});

function EmployerHome() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const user = getSession(); // Grabs the logged-in Employer securely

  // 1. Fetch Live Data from Backend API
  useEffect(() => {
    if (!user || user.role !== "employer") return;

    fetch(`https://bcc-backend-0cny.onrender.com/api/employer/${user.id}/dashboard`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setData(json.data);
        }
      })
      .catch((err) => console.error("Dashboard fetch error:", err))
      .finally(() => setIsLoading(false));
  }, [user]);

  // 2. Format Data for Recharts
  const trend = data?.chartData?.map((d: any) => ({ d: d.day, v: d.applications })) || [];
  
  const funnel = data ? [
    { stage: "Applied", v: data.funnelData.Applied || 0 },
    { stage: "Shortlisted", v: data.funnelData.Shortlisted || 0 },
    { stage: "Interview", v: data.funnelData.Interview || 0 },
    { stage: "Offer", v: data.funnelData.Offer || 0 },
    { stage: "Hired", v: data.funnelData.Hired || 0 },
  ] : [];

  // Loading State
  if (isLoading) {
    return (
      <DashShell role="employer" nav={employerNav}>
        <div className="flex h-[60vh] items-center justify-center flex-col gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-saffron" />
          <p className="text-muted-foreground animate-pulse">Loading dashboard metrics...</p>
        </div>
      </DashShell>
    );
  }

  return (
    <DashShell role="employer" nav={employerNav}>
      <PageHeader
        title="Hiring Overview"
        description="Real-time view of your pipeline across all events."
        action={<Button asChild className="bg-saffron text-navy hover:bg-saffron/90"><Link to="/employer/jobs">Post a Job</Link></Button>}
      />

      {user && (
        <Card className="p-4 border-border/60 mb-6 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-india-green" />
            <span className="font-display font-bold text-navy">{user.name}</span>
            <Badge className="bg-india-green/15 text-india-green">Verified employer</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <IdCard className="h-4 w-4" />
            Employer ID: <span className="font-mono text-navy">EMP-{user.id}</span>
          </div>
          <div className="text-sm text-muted-foreground">Contact: <b className="text-navy">{user.email}</b></div>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Active Jobs" value={data?.kpis?.activeJobs || 0} icon={Briefcase} />
        <StatCard label="Applications" value={data?.kpis?.applications || 0} icon={Users} accent="navy" />
        <StatCard label="Interviews" value={data?.kpis?.interviews || 0} icon={CalendarCheck} accent="india-green" />
        <StatCard label="Offers Made" value={data?.kpis?.offersMade || 0} icon={Award} accent="india-green" />
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 border-border/60">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-navy">Applications — last 7 days</h2>
            <TrendingUp className="h-5 w-5 text-india-green" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend}>
              <XAxis dataKey="d" axisLine={false} tickLine={false} className="text-xs" />
              <Tooltip />
              <Line type="monotone" dataKey="v" stroke="var(--saffron)" strokeWidth={3} dot={{ fill: "var(--navy)", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        
        <Card className="p-6 border-border/60">
          <h2 className="font-display font-bold text-navy mb-4">Hiring Funnel</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={funnel}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="stage" axisLine={false} tickLine={false} className="text-xs" />
              <Tooltip />
              <Bar dataKey="v" fill="var(--india-green)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Applicants Section */}
      <Card className="p-6 border-border/60 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-navy">Recent applicants</h2>
          <Button asChild variant="ghost" size="sm"><Link to="/employer/candidates">View all <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
        </div>
        <div className="space-y-3">
          {data?.recentApplicants?.length > 0 ? (
            data.recentApplicants.map((app: any) => {
              // Convert DB timestamp to relative time (e.g., "Applied Today")
              const appliedDate = new Date(app.applied_at).toLocaleDateString();
              
              return (
                <div key={app.application_id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/40 transition-colors">
                  <div className="size-10 rounded-full bg-gradient-to-br from-saffron to-india-green flex items-center justify-center text-white font-bold shrink-0">
                    {app.candidate_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy truncate">{app.candidate_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{app.job_title} · Applied on {appliedDate}</p>
                  </div>
                  <Badge className="bg-india-green/15 text-india-green hidden sm:flex">{app.match_score}% Match</Badge>
                  <Button size="sm" variant="outline" className="shrink-0">Review</Button>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-muted-foreground rounded-lg border border-dashed border-border/60">
              No recent applications found. Post a job to start receiving candidates!
            </div>
          )}
        </div>
      </Card>
    </DashShell>
  );
}
