import { createFileRoute } from "@tanstack/react-router";
import { DashShell, PageHeader } from "@/components/DashShell";
import { candidateNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Loader2, Send, MapPin, Building2, Calendar, Clock } from "lucide-react";
import { getSession } from "@/lib/mockStore";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/candidate/applications")({
  head: () => ({ meta: [{ title: "My Applications — Candidate" }] }),
  component: Applications,
});

// Helper function to assign specific colors based on the application status
const getStatusColors = (status: string) => {
  const s = (status || "Applied").toLowerCase();
  if (s.includes("applied")) return "bg-blue-50 text-blue-700 border-blue-200";
  if (s.includes("shortlist")) return "bg-amber-50 text-amber-700 border-amber-200";
  if (s.includes("interview")) return "bg-purple-50 text-purple-700 border-purple-200";
  if (s.includes("hire") || s.includes("select") || s.includes("offer") || s.includes("accept")) return "bg-india-green/10 text-india-green border-india-green/20";
  if (s.includes("reject") || s.includes("decline")) return "bg-red-50 text-red-700 border-red-200";
  return "bg-slate-50 text-slate-700 border-slate-200"; // default fallback
};

// Helper function to determine if the message box should be available
const isMessageAllowed = (status: string) => {
  const s = (status || "").toLowerCase();
  // Allow messaging only if the status implies an interview or beyond
  return s.includes("interview") || s.includes("hire") || s.includes("select") || s.includes("offer") || s.includes("shortlist");
};

function Applications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [messagingApp, setMessagingApp] = useState<any | null>(null);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  const [viewEvent, setViewEvent] = useState<any | null>(null);

  // 1. FETCH LIVE APPLICATIONS FROM POSTGRESQL
  useEffect(() => {
    async function fetchMyApplications() {
      const session = getSession();
      if (!session || !session.id) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://15.207.249.155:5000"}/api/candidate/${session.id}/applications`);
        const json = await res.json();
        
        if (json.success) {
          setApplications(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch applications", err);
        toast.error("Could not load applications from the database.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchMyApplications();
  }, []);

  // 2. SEND MESSAGE TO EMPLOYER
  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      toast.error("Please enter a message.");
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://15.207.249.155:5000"}/api/applications/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: messagingApp.application_id,
          message: messageText,
          senderType: "candidate"
        })
      });

      const json = await res.json();

      if (json.success) {
        toast.success(json.message || "Message sent successfully!");
        setMessagingApp(null);
        setMessageText("");
      } else {
        toast.error("Failed to send message.");
      }
    } catch (err) {
      toast.error("Server connection failed.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <DashShell role="candidate" nav={candidateNav}>
      <PageHeader 
        title="My Applications" 
        description="Track every application you've submitted — updates instantly as employers shortlist, interview, or hire." 
      />

      <Card className="border-border/60 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-border text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Job Role</th>
                <th className="px-6 py-4 font-medium">Company</th>
                <th className="px-6 py-4 font-medium">Applied On</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-saffron" />
                    Fetching applications...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    You haven't applied to any jobs yet.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.application_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-navy text-base">{app.job_title}</div>
                      <div className="mt-2 flex items-center">
                        {app.event_id ? (
                          <Badge 
                            variant="outline" 
                            className="bg-saffron/10 text-saffron border-saffron/20 font-medium cursor-pointer hover:bg-saffron/20 transition-colors"
                            onClick={() => setViewEvent(app)}
                            title="Click to view event details & venue"
                          >
                            <MapPin className="h-3 w-3 mr-1" /> Event Walk-in: {app.event_name}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 font-medium">
                            <Building2 className="h-3 w-3 mr-1" /> Direct Application
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{app.company}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {app.applied_at ? new Date(app.applied_at).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }) : "—"}
                    </td>
                    <td className="px-6 py-4">
                      {/* Dynamically colored status badge fetching directly from DB status */}
                      <Badge variant="outline" className={`font-medium capitalize px-3 py-1 ${getStatusColors(app.status)}`}>
                        {app.status || "Applied"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isMessageAllowed(app.status) ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-navy hover:text-navy hover:bg-slate-100"
                          onClick={() => setMessagingApp(app)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" /> Chat
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground italic bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100">
                          Unavailable
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* EVENT DETAILS MODAL */}
      <Dialog open={!!viewEvent} onOpenChange={(open) => !open && setViewEvent(null)}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-navy font-display text-xl">Job Fair Details</DialogTitle>
            <DialogDescription>
              Information for the walk-in event for <strong className="text-navy">{viewEvent?.company}</strong>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-5">
            <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg border border-border">
              <Calendar className="h-5 w-5 text-saffron mt-0.5" />
              <div>
                <p className="font-bold text-navy">{viewEvent?.event_name}</p>
                <p className="text-sm text-slate-600 mt-1 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> 
                  {viewEvent?.event_date ? new Date(viewEvent.event_date).toLocaleDateString("en-IN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "Date TBD"}
                  {viewEvent?.start_time && ` • ${viewEvent.start_time} - ${viewEvent.end_time || ''}`}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3">
              <MapPin className="h-5 w-5 text-saffron mt-0.5" />
              <div>
                <p className="font-bold text-navy">Venue Address</p>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                  {viewEvent?.venue_address || "Exact venue details have not been provided yet."}
                </p>
                {viewEvent?.city && (
                  <p className="text-sm font-medium text-navy mt-2 border-t pt-2 border-slate-100">
                    City: {viewEvent.city}
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button className="w-full bg-navy text-white hover:bg-navy/90" onClick={() => setViewEvent(null)}>
              Close Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MESSAGING MODAL */}
      <Dialog open={!!messagingApp} onOpenChange={(open) => !open && setMessagingApp(null)}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-navy font-display">Send update to employer</DialogTitle>
            <DialogDescription>
              Sending a message regarding your application for <strong className="text-navy">{messagingApp?.job_title}</strong> at {messagingApp?.company}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea 
              placeholder="Type your message or update here..." 
              className="min-h-[120px]"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setMessagingApp(null)}>Cancel</Button>
            <Button 
              className="bg-navy text-white hover:bg-navy/90" 
              onClick={handleSendMessage}
              disabled={isSending}
            >
              {isSending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              {isSending ? "Sending..." : "Send Message"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashShell>
  );
}
