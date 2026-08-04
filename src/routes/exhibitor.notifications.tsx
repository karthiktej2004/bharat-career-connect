import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DashShell, PageHeader } from "@/components/DashShell";
import { exhibitorNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getSession } from "@/lib/mockStore";
import { Bell, CheckCircle2, Info, AlertTriangle, Megaphone, Loader2, CheckCheck } from "lucide-react";

export const Route = createFileRoute("/exhibitor/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Exhibitor Panel" }] }),
  component: ExhibitorNotifications,
});

function ExhibitorNotifications() {
  const user = getSession();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarking, setIsMarking] = useState(false);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/exhibitor/${user.id}/notifications`);
      const json = await res.json();
      if (json.success) setNotifications(json.data);
    } catch (error) {
      toast.error("Failed to load notifications.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?.id]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/exhibitor/notifications/${id}/read`, { method: "PUT" });
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsMarking(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/exhibitor/${user?.id}/notifications/read-all`, { method: "PUT" });
      if ((await res.json()).success) {
        setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        toast.success("All notifications marked as read.");
      }
    } catch (error) {
      toast.error("Network error.");
    } finally {
      setIsMarking(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <div className="size-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0"><CheckCircle2 className="h-5 w-5 text-emerald-600" /></div>;
      case 'warning': return <div className="size-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0"><AlertTriangle className="h-5 w-5 text-amber-600" /></div>;
      case 'alert': return <div className="size-10 rounded-full bg-red-100 flex items-center justify-center shrink-0"><Megaphone className="h-5 w-5 text-red-600" /></div>;
      default: return <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0"><Info className="h-5 w-5 text-blue-600" /></div>;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (isLoading) return <DashShell role="exhibitor" nav={exhibitorNav}><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div></DashShell>;

  return (
    <DashShell role="exhibitor" nav={exhibitorNav}>
      <PageHeader 
        title="Notifications & Announcements" 
        description="Stay updated on event approvals, candidate engagements, and platform updates." 
        action={
          unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead} disabled={isMarking} className="border-purple-200 text-purple-700 hover:bg-purple-50">
              {isMarking ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCheck className="h-4 w-4 mr-2" />} 
              Mark all as read
            </Button>
          )
        }
      />

      <Card className="border-border/60 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="text-center py-16 bg-muted/20">
            <Bell className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-navy">No notifications yet.</h3>
            <p className="text-sm text-muted-foreground mt-1">You're all caught up! We'll alert you when there's an update.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                className={`p-5 flex gap-4 transition-colors hover:bg-muted/30 ${!n.is_read ? 'bg-purple-50/50' : 'bg-white'}`}
                onMouseEnter={() => !n.is_read && handleMarkAsRead(n.id)}
              >
                {getIcon(n.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className={`font-semibold text-navy truncate ${!n.is_read ? 'font-bold' : ''}`}>{n.title}</h4>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(n.created_at).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={`text-sm ${!n.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {n.message}
                  </p>
                </div>
                {!n.is_read && (
                  <div className="flex items-center justify-center px-2">
                    <div className="size-2.5 rounded-full bg-purple-600"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </DashShell>
  );
}
