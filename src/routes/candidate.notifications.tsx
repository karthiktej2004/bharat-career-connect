import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DashShell, PageHeader } from "@/components/DashShell";
import { candidateNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle2, Loader2, MailOpen, Clock } from "lucide-react";
import { getSession } from "@/lib/mockStore";
import { toast } from "sonner";

export const Route = createFileRoute("/candidate/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Candidate" }] }),
  component: CandidateNotifications,
});

function CandidateNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    const session = getSession();
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
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://15.207.249.155:5000"}/api/candidate/notifications/${id}/read`, {
        method: "POST"
      });
      const json = await res.json();
      if (json.success) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        toast.success("Marked as read");
      }
    } catch (err) {
      toast.error("Connection failed.");
    }
  };

  return (
    <DashShell role="candidate" nav={candidateNav}>
      <PageHeader 
        title="Notifications" 
        description="Stay updated with interview schedules, employer messages, and announcements." 
      />

      <div className="max-w-3xl mx-auto mt-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-saffron mb-2" />
            <p className="text-navy font-medium">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <Card className="p-12 text-center bg-white border-border/60">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <h3 className="font-display font-bold text-navy text-lg">No notifications yet</h3>
            <p className="text-sm text-muted-foreground mt-1">You're all caught up! Important updates will appear here.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif) => (
              <Card 
                key={notif.id} 
                className={`p-5 transition-all bg-white border-border/60 flex items-start justify-between gap-4 ${!notif.is_read ? 'border-l-4 border-l-saffron bg-saffron/[0.02]' : ''}`}
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-navy text-base">{notif.title}</h3>
                    {!notif.is_read && <Badge className="bg-saffron text-navy text-[10px] px-2 py-0.5">New</Badge>}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{notif.message}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 pt-1">
                    <Clock className="h-3 w-3" /> {new Date(notif.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>

                {!notif.is_read && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="shrink-0 text-xs text-navy hover:bg-slate-50"
                    onClick={() => handleMarkAsRead(notif.id)}
                  >
                    <MailOpen className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" /> Mark Read
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashShell>
  );
}
