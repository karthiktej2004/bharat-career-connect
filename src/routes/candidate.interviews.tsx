import { createFileRoute } from "@tanstack/react-router";
import { DashShell, PageHeader } from "@/components/DashShell";
import { candidateNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, MapPin, Briefcase, Loader2, Video, Clock, MessageSquare, Send, ExternalLink } from "lucide-react";
import { getSession } from "@/lib/mockStore";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/candidate/interviews")({
  head: () => ({ meta: [{ title: "My Interviews — Candidate" }] }),
  component: Interviews,
});

function Interviews() {
  const user = typeof window !== "undefined" ? getSession() : null;
  const [interviews, setInterviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Messaging state
  const [messagingApp, setMessagingApp] = useState<any | null>(null);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    async function fetchInterviews() {
      if (!user || !user.id) return;
      try {
        const res = await fetch(`https://bcc-backend-0cny.onrender.com/api/candidate/${user.id}/interviews`);
        const json = await res.json();
        if (json.success) setInterviews(json.data);
      } catch (err) {
        toast.error("Failed to load interviews.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchInterviews();
  }, []);

  const handleSendMessage = async () => {
    if (!messageText.trim()) { toast.error("Please enter a message."); return; }
    setIsSending(true);
    try {
      const res = await fetch("https://bcc-backend-0cny.onrender.com/api/applications/message", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: messagingApp.application_id, message: messageText, senderType: "candidate" })
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Slot change request sent to employer!");
        setMessagingApp(null);
        setMessageText("");
      } else { toast.error("Failed to send request."); }
    } catch (err) { toast.error("Server connection failed."); } 
    finally { setIsSending(false); }
  };

  return (
    <DashShell role="candidate" nav={candidateNav}>
      <PageHeader 
        title="My Interviews" 
        description="Interview invites from employers. Use the message box to request a slot change." 
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-saffron mb-2" />
          <p className="text-navy font-medium">Loading interviews...</p>
        </div>
      ) : interviews.length === 0 ? (
        <Card className="text-center py-20 text-muted-foreground border-border/60 bg-white">
          <p className="text-lg font-medium text-navy">No interviews scheduled yet.</p>
          <p className="text-sm mt-1">Once an employer schedules one, it appears here.</p>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {interviews.map((intv) => {
            const isOnline = intv.interview_type === "Online";

            return (
              <Card key={intv.interview_id} className="p-6 border-border/60 bg-white shadow-sm flex flex-col justify-between hover:border-saffron/40 transition-colors">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-display font-bold text-navy text-lg">{intv.job_title}</h3>
                      <p className="text-sm font-medium text-muted-foreground mt-1 flex items-center gap-2">
                        <Briefcase className="h-4 w-4" /> {intv.company_name}
                      </p>
                    </div>
                    <Badge className={intv.interview_status === 'Scheduled' ? "bg-india-green text-white" : "bg-slate-200 text-slate-600"}>
                      {intv.interview_status}
                    </Badge>
                  </div>

                  {/* DATE & TIME ROW */}
                  <div className="flex items-center gap-4 mt-6 mb-4">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-navy">
                      <Calendar className="h-4 w-4 text-saffron" />
                      {new Date(intv.interview_date).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-navy border-l border-border pl-4">
                      <Clock className="h-4 w-4 text-saffron" />
                      {intv.interview_time}
                    </div>
                  </div>

                  {/* DYNAMIC LOCATION / LINK BOX */}
                  {isOnline ? (
                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm shrink-0"><Video className="h-5 w-5 text-blue-600" /></div>
                      <div>
                        <p className="text-xs font-bold uppercase text-blue-600 tracking-wider">Virtual Interview</p>
                        <a href={intv.location_or_link} target="_blank" rel="noreferrer" className="text-sm font-medium text-navy hover:text-blue-600 hover:underline flex items-center gap-1 mt-1 truncate">
                          {intv.location_or_link} <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-saffron/5 border border-saffron/20 flex items-start gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm shrink-0"><MapPin className="h-5 w-5 text-saffron" /></div>
                      <div>
                        <p className="text-xs font-bold uppercase text-saffron tracking-wider">Walk-in Location</p>
                        <p className="text-sm font-medium text-navy mt-1">{intv.location_or_link}</p>
                        
                        {/* AUTOMATIC GOOGLE MAPS LINK GENERATOR */}
                        <a 
                          href={`https://maps.google.com/?q=${encodeURIComponent(intv.location_or_link)}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 mt-2 w-max"
                        >
                          <MapPin className="h-3 w-3" /> View on Google Maps
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* SLOT CHANGE / MESSAGING */}
                <div className="mt-6 pt-4 border-t border-border">
                  <Button 
                    variant="outline" 
                    className="w-full text-navy hover:bg-slate-50"
                    onClick={() => setMessagingApp(intv)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" /> 
                    Message Employer / Request Slot Change
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* MESSAGING MODAL */}
      <Dialog open={!!messagingApp} onOpenChange={(open) => !open && setMessagingApp(null)}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-navy font-display flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-saffron" /> Message Employer
            </DialogTitle>
            <DialogDescription>
              Sending a message regarding your interview for <strong className="text-navy">{messagingApp?.job_title}</strong> at {messagingApp?.company_name}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-2">
            <label className="text-sm font-medium text-navy">Need a slot change? Leave a note:</label>
            <Textarea 
              placeholder="e.g., I have a university exam during this time. Can we reschedule to 04:00 PM?" 
              className="min-h-[120px] bg-slate-50 mt-1"
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
              {isSending ? "Sending..." : "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashShell>
  );
}
