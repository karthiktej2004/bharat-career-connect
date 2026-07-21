import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { DashShell, PageHeader } from "@/components/DashShell";
import { candidateNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Briefcase, Calendar, FileCheck, MessageSquareHeart, UserPlus, Star,
  QrCode, FileText, Search, Trash2, Activity, Sparkles, Loader2
} from "lucide-react";
import { getSession } from "@/lib/mockStore";
import { toast } from "sonner";

export const Route = createFileRoute("/candidate/history")({
  head: () => ({ meta: [{ title: "Activity History — Candidate" }] }),
  component: HistoryPage,
});

// Define Types natively since we are bypassing the mock store
type ActivityType = "account_created" | "profile_updated" | "event_registered" | "event_pass_viewed" | "job_applied" | "job_viewed" | "interview_scheduled" | "interview_attended" | "feedback_submitted" | "resume_uploaded";

interface ActivityEntry {
  id: number;
  type: ActivityType;
  title: string;
  description: string;
  at: string;
}

const META: Record<ActivityType, { icon: typeof Briefcase; tint: string; label: string }> = {
  account_created:     { icon: UserPlus,          tint: "bg-india-green/15 text-india-green", label: "Account" },
  profile_updated:     { icon: Sparkles,          tint: "bg-saffron/15 text-saffron",         label: "Profile" },
  event_registered:    { icon: Calendar,          tint: "bg-navy/10 text-navy",               label: "Event" },
  event_pass_viewed:   { icon: QrCode,            tint: "bg-navy/10 text-navy",               label: "Event" },
  job_applied:         { icon: Briefcase,         tint: "bg-saffron/15 text-saffron",         label: "Application" },
  job_viewed:          { icon: FileText,          tint: "bg-muted text-foreground",           label: "Job" },
  interview_scheduled: { icon: MessageSquareHeart,tint: "bg-navy/10 text-navy",               label: "Interview" },
  interview_attended:  { icon: MessageSquareHeart,tint: "bg-india-green/15 text-india-green", label: "Interview" },
  feedback_submitted:  { icon: Star,              tint: "bg-saffron/15 text-saffron",         label: "Feedback" },
  resume_uploaded:     { icon: FileCheck,         tint: "bg-india-green/15 text-india-green", label: "Resume" },
};

const FILTERS: { key: "all" | ActivityType; label: string }[] = [
  { key: "all", label: "All activity" },
  { key: "job_applied", label: "Applications" },
  { key: "event_registered", label: "Events" },
  { key: "interview_scheduled", label: "Interviews" },
  { key: "feedback_submitted", label: "Feedback" },
  { key: "profile_updated", label: "Profile" },
];

// Helper to map PostgreSQL action_types to your Frontend UI icons
function mapBackendTypeToFrontend(backendType: string): ActivityType {
  switch(backendType) {
    case 'Account': return 'account_created';
    case 'Event': return 'event_registered';
    case 'Application': return 'job_applied';
    case 'Interview': return 'interview_scheduled';
    default: return 'job_viewed';
  }
}

function HistoryPage() {
  const [items, setItems] = useState<ActivityEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [q, setQ] = useState("");

  const session = typeof window !== "undefined" ? getSession() : null;

  // 1. FETCH LIVE HISTORY
  useEffect(() => {
    async function fetchHistory() {
      if (!session || !session.id) return;
      try {
        const res = await fetch(`http://localhost:5000/api/candidate/${session.id}/history`);
        const json = await res.json();
        
        if (json.success) {
          const formattedData: ActivityEntry[] = json.data.map((log: any) => ({
            id: log.id,
            type: mapBackendTypeToFrontend(log.action_type),
            title: log.title,
            description: log.description,
            at: log.created_at,
          }));
          setItems(formattedData);
        }
      } catch (err) {
        toast.error("Failed to load activity history.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchHistory();
  }, []);

  // 2. CLEAR LIVE HISTORY
  const handleClearHistory = async () => {
    if (!session || !session.id) return;
    setIsClearing(true);
    try {
      const res = await fetch(`http://localhost:5000/api/candidate/${session.id}/history`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (json.success) {
        setItems([]);
        toast.success("Activity history cleared!");
      } else {
        toast.error("Failed to clear history.");
      }
    } catch (err) {
      toast.error("Server connection failed.");
    } finally {
      setIsClearing(false);
    }
  };

  const filtered = useMemo(() => {
    return items
      .filter((i) => filter === "all" || i.type === filter)
      .filter((i) => !q.trim() || [i.title, i.description || ""].join(" ").toLowerCase().includes(q.toLowerCase()));
  }, [items, filter, q]);

  const grouped = useMemo(() => groupByDay(filtered), [filtered]);
  const counts = useMemo(() => summarize(items), [items]);

  return (
    <DashShell role="candidate" nav={candidateNav}>
      <PageHeader
        title="Activity History"
        description="Everything you've done on Bharat Career Connect — in one timeline."
        action={
          <Button variant="outline" size="sm" onClick={handleClearHistory} disabled={isClearing || items.length === 0}>
            {isClearing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />} 
            {isClearing ? "Clearing..." : "Clear log"}
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-saffron mb-2" />
          <p className="text-navy font-medium">Loading your timeline...</p>
        </div>
      ) : (
        <>
          {/* Summary strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <SummaryCard icon={Briefcase} label="Applications" value={counts.job_applied || 0} tint="bg-saffron/15 text-saffron" />
            <SummaryCard icon={Calendar} label="Events" value={(counts.event_pass_viewed || 0) + (counts.event_registered || 0)} tint="bg-navy/10 text-navy" />
            <SummaryCard icon={MessageSquareHeart} label="Interviews" value={(counts.interview_scheduled || 0) + (counts.interview_attended || 0)} tint="bg-india-green/15 text-india-green" />
            <SummaryCard icon={Activity} label="Total actions" value={items.length} tint="bg-muted text-foreground" />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your history…" className="pl-9" />
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-none">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition ${
                    filter === f.key ? "bg-navy text-white border-navy" : "bg-background text-muted-foreground border-border hover:text-navy"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline */}
          {filtered.length === 0 ? (
            <Card className="p-10 text-center border-dashed">
              <Activity className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
              <p className="mt-3 font-semibold text-navy">{q ? "No matching activity found" : "No activity yet"}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {q ? "Try adjusting your search or filters." : "Apply to a job, view an event, or submit feedback to see it here."}
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {grouped.map(([day, entries]) => (
                <section key={day}>
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">{day}</p>
                    <div className="h-px flex-1 bg-border" />
                    <Badge variant="outline" className="text-[10px]">{entries.length} {entries.length === 1 ? "action" : "actions"}</Badge>
                  </div>
                  <Card className="border-border/60 overflow-hidden">
                    <ol className="divide-y divide-border">
                      {entries.map((e) => {
                        const M = META[e.type] || META.job_viewed; // Fallback to safe icon if unknown
                        const Icon = M.icon;
                        return (
                          <li key={e.id} className="p-4 flex items-start gap-3">
                            <div className={`size-9 rounded-lg grid place-items-center shrink-0 ${M.tint}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-navy text-sm truncate">{e.title}</p>
                                <Badge variant="outline" className="text-[10px]">{M.label}</Badge>
                              </div>
                              {e.description && <p className="text-xs text-muted-foreground mt-0.5">{e.description}</p>}
                              <p className="text-[11px] text-muted-foreground mt-1">
                                {new Date(e.at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  </Card>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </DashShell>
  );
}

// UI HELPER COMPONENTS
function SummaryCard({ icon: Icon, label, value, tint }: { icon: typeof Briefcase; label: string; value: number; tint: string }) {
  return (
    <Card className="p-4 border-border/60">
      <div className="flex items-center gap-3">
        <div className={`size-10 rounded-lg grid place-items-center ${tint}`}><Icon className="h-5 w-5" /></div>
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground truncate">{label}</p>
          <p className="font-display font-bold text-xl text-navy">{value}</p>
        </div>
      </div>
    </Card>
  );
}

// PURE DATA HELPERS
function groupByDay(items: ActivityEntry[]): [string, ActivityEntry[]][] {
  const map = new Map<string, ActivityEntry[]>();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  for (const e of items) {
    const d = new Date(e.at); d.setHours(0, 0, 0, 0);
    let label: string;
    if (d.getTime() === today.getTime()) label = "Today";
    else if (d.getTime() === yesterday.getTime()) label = "Yesterday";
    else label = new Date(e.at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
    const arr = map.get(label) || [];
    arr.push(e);
    map.set(label, arr);
  }
  return Array.from(map.entries());
}

function summarize(items: ActivityEntry[]): Record<ActivityType, number> {
  const base = Object.keys(META).reduce((acc, k) => ({ ...acc, [k]: 0 }), {} as Record<ActivityType, number>);
  for (const i of items) base[i.type] = (base[i.type] || 0) + 1;
  return base;
}