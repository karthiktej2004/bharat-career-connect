import { createFileRoute } from "@tanstack/react-router";
import { DashShell, PageHeader } from "@/components/DashShell";
import { candidateNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Loader2, Calendar } from "lucide-react";
import { getSession } from "@/lib/mockStore";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/candidate/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Candidate" }] }),
  component: CandidateNotifications,
});

function CandidateNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      // 🚨 SSR Safe: Only call getSession inside useEffect when window is defined 🚨
      const session = typeof window !== "undefined" ? getSession() : null;
      if (!session || !session.id) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://15.207.249.155:5000"}/api/candidate/${session.id}/notifications`);
        const json = await res.json();
        if (json.success) {
          setNotifications(json.data);
        }
      } catch (err) {
        toast.error("Failed to load notifications.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchNotifications();
  }, []);

  return (
    <DashShell role="candidate" nav={candidateNav}>
      <PageHeader 
        title="Notifications" 
        description="Stay updated with announcements, interview invites, and system messages." 
      />

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-saffron" />
        </div>
      ) : notifications.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 text-center border-dashed">
          <Bell className="h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-navy mb-2">No Notifications</h3>
          <p className="text-muted-foreground max-w-md">You're all caught up! Important alerts and updates will appear here.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((n, idx) => (
            <Card key={n.id || idx} className="p-5 border-border/60 bg-white shadow-sm hover:border-saffron/40 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-saffron/10 text-navy border-saffron/30 font-bold">
                      Announcement
                    </Badge>
                    <h4 className="font-display font-bold text-navy text-base">{n.subject || "Notification"}</h4>
                  </div>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">{n.message}</p>
                </div>
                <span className="text-xs text-slate-400 shrink-0 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {n.created_at ? new Date(n.created_at).toLocaleDateString() : "Recent"}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashShell>
  );
}
