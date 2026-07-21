import { createFileRoute } from "@tanstack/react-router";
import { DashShell, PageHeader } from "@/components/DashShell";
import { candidateNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Loader2, Send, MapPin, Building2 } from "lucide-react";
import { getSession } from "@/lib/mockStore";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/candidate/applications")({
  head: () => ({ meta: [{ title: "My Applications — Candidate" }] }),
  component: Applications,
});

function Applications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [messagingApp, setMessagingApp] = useState<any | null>(null);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);

  // 1. FETCH LIVE APPLICATIONS FROM POSTGRESQL
  useEffect(() => {
    async function fetchMyApplications() {
      const session = getSession();
      if (!session || !session.id) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`https://bcc-backend-0cny.onrender.com${session.id}`);
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
      const res = await fetch("http://localhost:5000/api/applications/message", {
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
        toast.success(json.message);
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
        description="Track every application you've submitted — updates as employers shortlist, interview, or reject." 
      />

      <Card className="border-border/60 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-border text-muted-foreground">
              <tr>
                {/* Candidate column removed as requested */}
                <th className="px-6 py-4 font-medium">Job</th>
                <th className="px-6 py-4 font-medium">Company</th>
                <th className="px-6 py-4 font-medium">Applied</th>
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
                      <div className="font-medium text-navy">{app.job_title}</div>
                      <div className="mt-1.5 flex items-center">
                        {/* HYBRID BADGE LOGIC INJECTED HERE */}
                        {app.event_id ? (
                          <Badge variant="outline" className="bg-saffron/10 text-saffron border-saffron/20 font-medium">
                            <MapPin className="h-3 w-3 mr-1" /> Event Walk-in: {app.event_name}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 font-medium">
                            <Building2 className="h-3 w-3 mr-1" /> Direct Application
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{app.company}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(app.applied_at).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium border-0">
                        {app.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-navy hover:text-navy hover:bg-slate-100"
                        onClick={() => setMessagingApp(app)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" /> Open
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

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
