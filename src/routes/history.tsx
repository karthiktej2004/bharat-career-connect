import { createFileRoute } from "@tanstack/react-router";
import { DashShell, PageHeader } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, Download, Calendar, MapPin, Users, Building2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/history")({
  head: () => ({ meta: [{ title: "Event History & Reports — Admin" }] }),
  component: AdminEventHistory,
});

function AdminEventHistory() {
  const [completedEvents, setCompletedEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`https://bcc-backend-0cny.onrender.com/api/admin/events/history`);
      const json = await res.json();
      if (json.success) {
        setCompletedEvents(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch event history", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDownloadReport = async (eventId: number, eventName: string) => {
    setDownloadingId(eventId);
    try {
      const res = await fetch(`https://bcc-backend-0cny.onrender.com/api/admin/events/${eventId}/export`);
      if (!res.ok) throw new Error("Export failed");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${eventName.replace(/[^a-zA-Z0-9]/g, '_')}_Master_Report.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Event report downloaded successfully!");
    } catch (err) {
      toast.error("Failed to download event report.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <DashShell role="admin" nav={adminNav}>
      <PageHeader 
        title="Event History & Master Reports" 
        description="Archive of completed job fairs with downloadable master CSV analytics for government and institutional planning." 
      />

      {isLoading ? (
        <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-saffron" /></div>
      ) : completedEvents.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground bg-white border-border/60">
          <History className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <p className="text-base font-semibold">No completed events found in the archive.</p>
          <p className="text-xs mt-1">Events marked with status 'completed' will appear here automatically.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {completedEvents.map((evt) => (
            <Card key={evt.id} className="p-6 bg-white border-border/60 flex items-center justify-between gap-6 flex-wrap">
              <div className="space-y-1.5 max-w-xl">
                <h3 className="font-bold text-navy text-xl">{evt.name}</h3>
                <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-saffron" /> {evt.event_date ? new Date(evt.event_date).toLocaleDateString() : 'N/A'}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-saffron" /> {evt.city} ({evt.venue_address || 'Venue'})</span>
                  <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5 text-indigo-500" /> {evt.total_companies || 0} Companies</span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-india-green" /> {evt.total_attendance || 0} Checked-In</span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-1 mt-1">{evt.description || 'Completed Job Fair Event Archive.'}</p>
              </div>

              <Button 
                onClick={() => handleDownloadReport(evt.id, evt.name)} 
                disabled={downloadingId === evt.id}
                className="bg-navy text-white hover:bg-navy/90 font-bold gap-2"
              >
                {downloadingId === evt.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Download Full Event Report
              </Button>
            </Card>
          ))}
        </div>
      )}
    </DashShell>
  );
}
