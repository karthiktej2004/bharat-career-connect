import { createFileRoute } from "@tanstack/react-router";
import { DashShell, PageHeader } from "@/components/DashShell";
import { candidateNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, MapPin, Briefcase, Loader2, Video, Clock, MessageSquare, Send, ExternalLink, Ticket, Users, Play, RefreshCw } from "lucide-react";
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Queue State
  const [isJoining, setIsJoining] = useState<number | null>(null);

  // Messaging state
  const [messagingApp, setMessagingApp] = useState<any | null>(null);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);

  // 1. FETCH INTERVIEWS
  const fetchInterviews = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    
    const session = getSession();
    if (!session || !session.id) {
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://15.207.249.155:5000"}/api/candidate/${session.id}/interviews`);
      const json = await res.json();
      if (json.success) setInterviews(json.data);
    } catch (err) {
      toast.error("Failed to load interviews.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []); // <-- Empty array stops infinite looping completely

  // 2. JOIN LIVE QUEUE
  const handleJoinQueue = async (interviewId: number) => {
    setIsJoining(interviewId);
    const session = getSession();
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://15.207.249.155:5000"}/api/candidate/${session?.id}/interviews/${interviewId}/join-queue`, {
        method: "POST"
      });
      const json = await res.json();
      
      if (json.success) {
        toast.success(json.message);
        fetchInterviews(true); // Quietly refresh data to show new token
      } else {
        toast.error("Failed to join queue.");
      }
    } catch (err) {
      toast.error("Network error.");
    } finally {
      setIsJoining(null);
    }
  };

  // 3. SEND MESSAGE
  const handleSendMessage = async () => {
    if (!messageText.trim()) { toast.error("Please enter a message."); return; }
    setIsSending(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://15.207.249.155:5000"}/api/applications/message`, {
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
        title="My Interviews & Queue" 
        description="Track your interview schedules and join the virtual walk-in queue for events." 
        action={
          <Button variant="outline" onClick={() => fetchInterviews(true)} disabled={isRefreshing} className="border-slate-200">
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} /> 
            Refresh Status
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-saffron mb-2" />
          <p className="text-navy font-medium">Loading interviews & queue...</p>
        </div>
      ) : interviews.length === 0 ? (
        <Card className="text-center py-20 text-muted-foreground border-border/60 bg-white border-dashed">
          <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-navy">No interviews scheduled yet.</p>
          <p className="text-sm mt-1">Once an employer schedules or invites you, it appears here.</p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {interviews.map((intv) => {
            const isOnline = intv.interview_type === "Online";
            const hasJoined = intv.queue_number != null;
            const liveToken = intv.live_token || 0;
            const myToken = intv.queue_number || 0;
            
            // Queue Logic & UI Colors
            let queueStatusMsg = "";
            let queueStatusColor = "";
            
            if (hasJoined) {
              if (myToken === liveToken) {
                queueStatusMsg = "It's your turn! Head to the stall now.";
                queueStatusColor = "bg-green-100 text-green-700 border-green-200 animate-pulse font-bold";
              } else if (myToken < liveToken) {
                queueStatusMsg = "Your token was called. See employer immediately.";
                queueStatusColor = "bg-slate-200 text-slate-600 border-slate-300";
              } else if (myToken - liveToken <= 3) {
                queueStatusMsg = "Get ready! You are almost next.";
                queueStatusColor = "bg-amber-100 text-amber-700 border-amber-200 font-bold";
              } else {
                queueStatusMsg = `You are #${myToken - liveToken} in line. Relax in the waiting area.`;
                queueStatusColor = "bg-blue-50 text-blue-700 border-blue-200";
              }
            }

            return (
              <Card key={intv.interview_id} className="overflow-hidden border-border/60 bg-white shadow-sm flex flex-col md:flex-row hover:border-saffron/40 transition-all">
                
                {/* LEFT SIDE: Interview Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-display font-bold text-navy text-lg">{intv.job_title}</h3>
                        <p className="text-sm font-medium text-muted-foreground mt-1 flex items-center gap-2">
                          <Briefcase className="h-4 w-4" /> {intv.company_name}
                        </p>
                      </div>
                      <Badge className={intv.interview_status === 'Scheduled' || intv.interview_status === 'Interview' ? "bg-india-green text-white" : "bg-slate-200 text-slate-700"}>
                        {intv.interview_status}
                      </Badge>
                    </div>

                    {/* EVENT BADGE */}
                    {intv.event_name && (
                      <div className="mb-4 inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-md border border-indigo-100 text-sm font-medium">
                        <MapPin className="h-3.5 w-3.5" /> Event: {intv.event_name}
                      </div>
                    )}

                    {/* DATE & TIME ROW */}
                    <div className="flex items-center gap-4 mt-4 mb-4">
                      <div className="flex items-center gap-1.5 text-sm font-bold text-navy">
                        <Calendar className="h-4 w-4 text-saffron" />
                        {intv.interview_date ? new Date(intv.interview_date).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "TBD"}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm font-bold text-navy border-l border-border pl-4">
                        <Clock className="h-4 w-4 text-saffron" />
                        {intv.interview_time || "Time TBD"}
                      </div>
                    </div>

                    {/* DYNAMIC LOCATION / LINK BOX */}
                    {isOnline ? (
                      <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3 w-max max-w-full">
                        <div className="p-2 bg-white rounded-lg shadow-sm shrink-0"><Video className="h-5 w-5 text-blue-600" /></div>
                        <div className="min-w-0 pr-4">
                          <p className="text-xs font-bold uppercase text-blue-600 tracking-wider">Virtual Interview</p>
                          <a href={intv.location_or_link} target="_blank" rel="noreferrer" className="text-sm font-medium text-navy hover:text-blue-600 hover:underline flex items-center gap-1 mt-1 truncate">
                            {intv.location_or_link} <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-saffron/5 border border-saffron/20 flex items-start gap-3 w-max max-w-full">
                        <div className="p-2 bg-white rounded-lg shadow-sm shrink-0"><MapPin className="h-5 w-5 text-saffron" /></div>
                        <div className="min-w-0 pr-4">
                          <p className="text-xs font-bold uppercase text-saffron tracking-wider">Walk-in Venue</p>
                          <p className="text-sm font-medium text-navy mt-1 truncate">{intv.location_or_link || intv.venue_address || "Venue TBA"}</p>
                          <a 
                            href={`https://maps.google.com/?q=${encodeURIComponent(intv.location_or_link || intv.venue_address || '')}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 mt-2 w-max"
                          >
                            <MapPin className="h-3 w-3" /> View on Maps
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
                      Request Slot Change / Message
                    </Button>
                  </div>
                </div>

                {/* RIGHT SIDE: LIVE QUEUE TICKET */}
                <div className="p-6 md:w-[320px] shrink-0 border-t md:border-t-0 md:border-l border-dashed border-slate-300 bg-slate-50 flex flex-col justify-center">
                  {!hasJoined ? (
                    <div className="text-center">
                      <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                      <h4 className="font-bold text-navy mb-1">Walk-in Queue</h4>
                      <p className="text-xs text-muted-foreground mb-4">Join the virtual queue to get your token number and track the live stall status.</p>
                      <Button 
                        className="w-full bg-saffron hover:bg-saffron/90 text-navy font-bold shadow-sm"
                        onClick={() => handleJoinQueue(intv.interview_id)}
                        disabled={isJoining === intv.interview_id || intv.interview_status === 'Completed'}
                      >
                        {isJoining === intv.interview_id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                        Join Queue Now
                      </Button>
                    </div>
                  ) : (
                    <div className="relative bg-white rounded-xl border border-slate-200 shadow-sm p-5 text-center overflow-hidden">
                      {/* Decorative ticket cutouts */}
                      <div className="absolute -left-3 top-[40%] -translate-y-1/2 w-6 h-6 rounded-full bg-slate-50 border-r border-slate-200"></div>
                      <div className="absolute -right-3 top-[40%] -translate-y-1/2 w-6 h-6 rounded-full bg-slate-50 border-l border-slate-200"></div>
                      
                      <div className="flex justify-between items-center px-4 mb-5">
                        <div className="text-center">
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Your Token</p>
                          <p className="text-4xl font-display font-black text-navy">{myToken}</p>
                        </div>
                        <div className="h-10 w-px bg-slate-200"></div>
                        <div className="text-center">
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-center gap-1">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            Live Stall
                          </p>
                          <p className="text-4xl font-display font-black text-slate-400">{liveToken === 0 ? "-" : liveToken}</p>
                        </div>
                      </div>

                      <Badge variant="outline" className={`w-full justify-center py-2 text-center text-xs leading-tight ${queueStatusColor}`}>
                        {queueStatusMsg}
                      </Badge>
                    </div>
                  )}
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
              placeholder="e.g., I have a conflict during this time. Can we reschedule?" 
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
