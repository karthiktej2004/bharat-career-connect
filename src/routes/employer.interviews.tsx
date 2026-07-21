import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo } from "react";
import { DashShell, PageHeader, StatCard } from "@/components/DashShell";
import { employerNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CalendarCheck, Video, MapPin, Clock, XCircle, Check, Sparkles, UserCheck, Eye, MessageSquare, RefreshCcw, Loader2 } from "lucide-react";

import { getSession, type Applicant, type Job } from "@/lib/mockStore"; 
import { toast } from "sonner";
import { ApplicantDetailDialog, ScheduleInterviewDialog, type SchedulePayload } from "./employer.candidates";
import { MessageBoxDialog, RejectWithReasonDialog } from "@/components/InterviewDialogs";

export const Route = createFileRoute("/employer/interviews")({
  head: () => ({ meta: [{ title: "Interviews — Bharat Career Connect" }] }),
  component: Interviews,
});

type ShortlistedRow = { applicant: any; job: any; applicationId: string };

function summarizeInvite(p: SchedulePayload, applicantName: string, jobTitle: string, company: string, reschedule?: boolean): string {
  const when = `${new Date(p.date).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })} at ${p.time}`;
  const where = p.mode === "Online"
    ? `Online meeting → ${p.meetingLink}`
    : `Walk-in → ${p.venue}${p.locationDetail ? `\nLocation notes: ${p.locationDetail}` : ""}${p.mapsLink ? `\nMap: ${p.mapsLink}` : ""}`;
  const header = reschedule
    ? `Hi ${applicantName}, your interview with ${company} for "${jobTitle}" has been rescheduled.`
    : `Hi ${applicantName}, your interview with ${company} for "${jobTitle}" is scheduled.`;
  return [
    header, `When: ${when}`, where, p.description ? `Details & documents: ${p.description}` : "Please bring your resume and a valid ID proof.", "", "Reply here if you need to reschedule.",
  ].filter(Boolean).join("\n");
}

function Interviews() {
  const user = getSession();
  const userId = user?.id;
  const employerName = useMemo(() => user?.name || "Employer", [user]);

  const [isLoading, setIsLoading] = useState(true);
  const [list, setList] = useState<any[]>([]); 
  const [shortlisted, setShortlisted] = useState<ShortlistedRow[]>([]);
  
  const [scheduling, setScheduling] = useState<ShortlistedRow | null>(null);
  const [rescheduling, setRescheduling] = useState<{ iv?: any; job: any; applicant: any; applicationId: string } | null>(null);
  const [detail, setDetail] = useState<ShortlistedRow | null>(null);
  const [messaging, setMessaging] = useState<{ applicant: any; job: any; applicationId: string } | null>(null);
  const [rejecting, setRejecting] = useState<{ applicant: any; job: any; applicationId: string; iv?: any } | null>(null);

  const fetchShortlisted = useCallback(async () => {
    if (!userId) return;
    try {
      const jobsRes = await fetch(`http://localhost:5000/api/employer/${userId}/job-options`);
      const jobsJson = await jobsRes.json();
      if (!jobsJson.success) return;

      let allShortlisted: ShortlistedRow[] = [];
      
      for (const job of jobsJson.data) {
        const appRes = await fetch(`http://localhost:5000/api/employer/jobs/${job.id}/applications`);
        const appJson = await appRes.json();
        
        if (appJson.success) {
          // FIXED: Now grabs BOTH "Shortlisted" and "Interview" statuses!
          const filtered = appJson.data.filter((a: any) => 
            a.app_status === "Shortlisted" || a.app_status === "Interview"
          );
          
          filtered.forEach((a: any) => {
            let parsedSkills = [];
            try { parsedSkills = typeof a.skills === 'string' ? JSON.parse(a.skills) : (a.skills || []); } catch(e){}

            allShortlisted.push({
              applicationId: a.application_id.toString(),
              job: { id: job.id.toString(), title: job.title, company: employerName, location: job.location },
              applicant: {
                id: a.unique_id, name: a.full_name, email: a.email, phone: a.phone,
                qualification: a.highest_qualification || "Any",
                experience: a.experience_type || "Fresher",
                skills: parsedSkills,
                matchScore: a.matchScore || 0,
                resumeFileName: a.resume_file_name,
                status: a.app_status // Save the exact status
              }
            });
          });
        }
      }
      setShortlisted(allShortlisted);
    } catch (error) {
      console.error("Error fetching shortlisted:", error);
    }
  }, [userId, employerName]);

  const fetchInterviews = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/employer/${userId}/interviews`);
      const json = await res.json();
      if (json.success) {
        const mapped = json.data.map((iv: any) => ({
          id: iv.id.toString(),
          applicationId: iv.application_id.toString(),
          applicantId: iv.candidate_id,
          applicantName: iv.candidate_name,
          jobId: iv.job_id.toString(),
          jobTitle: iv.job_title,
          company: employerName,
          date: new Date(iv.interview_date).toISOString().split('T')[0],
          time: iv.interview_time,
          mode: iv.interview_type, 
          status: iv.status, 
          meetingLink: iv.interview_type === 'Online' ? iv.location_or_link : "",
          venue: iv.interview_type === 'Walk-in' ? iv.location_or_link : "",
        }));
        setList(mapped);
      }
    } catch (error) {
      console.error("Error fetching interviews:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, employerName]);

  useEffect(() => {
    fetchShortlisted();
    fetchInterviews();
  }, [fetchShortlisted, fetchInterviews]);

  const upcoming = list.filter((iv) => iv.status === "Scheduled");
  const online = upcoming.filter((iv) => iv.mode === "Online");
  const walkin = upcoming.filter((iv) => iv.mode === "Walk-in");
  const past = list.filter((iv) => iv.status !== "Scheduled");

  async function updateInterviewStatus(id: string, status: string, applicantName: string) {
    try {
      await fetch(`http://localhost:5000/api/employer/interviews/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      toast.success(`${applicantName}'s interview marked as ${status}`);
      fetchInterviews();
    } catch (error) { toast.error("Error updating interview"); }
  }

  function markDone(iv: any) { updateInterviewStatus(iv.id, "Completed", iv.applicantName); }
  function cancel(iv: any) { updateInterviewStatus(iv.id, "Cancelled", iv.applicantName); }

  async function handleSchedule(row: ShortlistedRow, payload: SchedulePayload, isReschedule?: boolean) {
    try {
      await fetch("http://localhost:5000/api/employer/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: row.applicationId,
          jobId: row.job.id,
          employerId: userId,
          candidateId: row.applicant.id,
          type: payload.mode,
          date: payload.date,
          time: payload.time,
          location: payload.mode === "Online" ? payload.meetingLink : `${payload.venue} ${payload.locationDetail || ''}`
        })
      });

      await fetch(`http://localhost:5000/api/applications/${row.applicationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderType: "employer",
          senderId: userId?.toString(),
          message: summarizeInvite(payload, row.applicant.name, row.job.title, row.job.company, isReschedule)
        })
      });

      toast.success(`Interview ${isReschedule ? "rescheduled" : "scheduled"} and invite sent!`);
      setScheduling(null);
      setRescheduling(null);
      fetchShortlisted();
      fetchInterviews();
    } catch (error) {
      toast.error("Failed to schedule interview.");
    }
  }

  async function handleReject(applicant: any, job: any, applicationId: string, reason: string, iv?: any) {
    try {
      await fetch(`http://localhost:5000/api/employer/applications/${applicationId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Rejected" })
      });

      await fetch(`http://localhost:5000/api/applications/${applicationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderType: "employer",
          senderId: userId?.toString(),
          message: `We're sorry — your application for "${job.title}" was not selected.\n\nReason: ${reason}`
        })
      });

      if (iv) await updateInterviewStatus(iv.id, "Cancelled", applicant.name);

      toast(`${applicant.name} rejected`);
      fetchShortlisted();
    } catch (error) {
      toast.error("Error rejecting candidate.");
    }
  }

  const defaultTab = "shortlisted";

  if (isLoading) {
    return (
      <DashShell role="employer" nav={employerNav}>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-saffron" />
        </div>
      </DashShell>
    );
  }

  return (
    <DashShell role="employer" nav={employerNav}>
      <PageHeader
        title="Interviews & Shortlists"
        description="Schedule your shortlisted candidates and manage your online meetings and walk-ins."
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Ready to schedule" value={String(shortlisted.length)} icon={UserCheck} accent="saffron" />
        <StatCard label="Online" value={String(online.length)} icon={Video} accent="navy" />
        <StatCard label="Walk-in" value={String(walkin.length)} icon={MapPin} accent="saffron" />
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="shortlisted" className="gap-1"><Sparkles className="h-3.5 w-3.5" />To Schedule ({shortlisted.length})</TabsTrigger>
          <TabsTrigger value="online">Online ({online.length})</TabsTrigger>
          <TabsTrigger value="walkin">Walk-in ({walkin.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="shortlisted">
          {shortlisted.length === 0 ? (
            <Card className="p-8 text-center border-border/60 mt-4">
              <UserCheck className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="font-medium text-navy">No candidates to schedule</p>
              <p className="text-sm text-muted-foreground mt-1">Go to <b>Applications</b> and mark candidates as <b>Shortlisted</b> or <b>Interview</b> to schedule them here.</p>
            </Card>
          ) : (
            <div className="grid gap-3 mt-4">
              {shortlisted.map((row) => (
                <Card key={row.applicationId} className="p-5 border-border/60 flex flex-col md:flex-row md:items-center gap-4 card-hover cursor-pointer" onClick={() => setDetail(row)}>
                  <div className="size-12 rounded-full bg-gradient-to-br from-saffron to-india-green flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {row.applicant.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-display font-bold text-navy">{row.applicant.name}</p>
                      
                      {/* Dynamic Badge showing actual Status */}
                      <Badge className="bg-saffron/20 text-saffron">
                        {row.applicant.status === "Interview" ? "To Interview" : "Shortlisted"}
                      </Badge>

                    </div>
                    <p className="text-sm text-muted-foreground">{row.job.title} · {row.job.location}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{row.applicant.qualification} · {row.applicant.experience}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {row.applicant.skills.map((skill: string) => <span key={skill} className="text-xs bg-muted px-2 py-0.5 rounded">{skill}</span>)}
                    </div>
                    <p className="text-[11px] text-saffron mt-2 flex items-center gap-1"><Eye className="h-3 w-3" />Click to view full details</p>
                  </div>
                  <div className="text-center shrink-0">
                    <div className="flex items-center gap-1 text-india-green font-bold"><Sparkles className="h-3 w-3" />{row.applicant.matchScore}%</div>
                    <p className="text-xs text-muted-foreground mt-1">Match</p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0 min-w-[180px]" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" className="bg-saffron text-navy hover:bg-saffron/90" onClick={() => setScheduling(row)}>
                      <CalendarCheck className="h-3.5 w-3.5 mr-1" />Schedule interview
                    </Button>
                    <Button size="sm" variant="outline" className="relative" onClick={() => setMessaging({ applicant: row.applicant, job: row.job, applicationId: row.applicationId })}>
                      <MessageSquare className="h-3.5 w-3.5 mr-1" />Message
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setRejecting({ applicant: row.applicant, job: row.job, applicationId: row.applicationId })}>
                      <XCircle className="h-3.5 w-3.5 mr-1" />Reject
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="online">
          <IvList list={online} onDone={markDone} onCancel={cancel}
            onMessage={(iv) => setMessaging({ applicant: { id: iv.applicantId, name: iv.applicantName }, job: { id: iv.jobId, title: iv.jobTitle, company: iv.company }, applicationId: iv.applicationId })}
            onReschedule={(iv) => setRescheduling({ iv, job: { id: iv.jobId, title: iv.jobTitle, company: iv.company }, applicant: { id: iv.applicantId, name: iv.applicantName }, applicationId: iv.applicationId })}
            onReject={(iv) => setRejecting({ applicant: { id: iv.applicantId, name: iv.applicantName }, job: { id: iv.jobId, title: iv.jobTitle, company: iv.company }, applicationId: iv.applicationId, iv })}
          />
        </TabsContent>
        <TabsContent value="walkin">
          <IvList list={walkin} onDone={markDone} onCancel={cancel}
             onMessage={(iv) => setMessaging({ applicant: { id: iv.applicantId, name: iv.applicantName }, job: { id: iv.jobId, title: iv.jobTitle, company: iv.company }, applicationId: iv.applicationId })}
             onReschedule={(iv) => setRescheduling({ iv, job: { id: iv.jobId, title: iv.jobTitle, company: iv.company }, applicant: { id: iv.applicantId, name: iv.applicantName }, applicationId: iv.applicationId })}
             onReject={(iv) => setRejecting({ applicant: { id: iv.applicantId, name: iv.applicantName }, job: { id: iv.jobId, title: iv.jobTitle, company: iv.company }, applicationId: iv.applicationId, iv })}
          />
        </TabsContent>
        <TabsContent value="past"><IvList list={past} readOnly /></TabsContent>
      </Tabs>

      {scheduling && (
        <ScheduleInterviewDialog
          open={!!scheduling}
          applicant={scheduling.applicant as unknown as Applicant}
          job={scheduling.job as unknown as Job}
          onClose={() => setScheduling(null)}
          onConfirm={(payload) => handleSchedule(scheduling, payload)}
        />
      )}

      {rescheduling && (
        <ScheduleInterviewDialog
          open={!!rescheduling}
          applicant={rescheduling.applicant as unknown as Applicant}
          job={rescheduling.job as unknown as Job}
          reschedule
          onClose={() => setRescheduling(null)}
          onConfirm={(payload) => handleSchedule({ applicant: rescheduling.applicant, job: rescheduling.job, applicationId: rescheduling.applicationId }, payload, true)}
        />
      )}

      {messaging && (
        <MessageBoxDialog
          open={!!messaging}
          onOpenChange={(o) => !o && setMessaging(null)}
          applicantId={messaging.applicant.id}
          applicantName={messaging.applicant.name}
          jobId={messaging.job.id}
          jobTitle={messaging.job.title}
          company={messaging.job.company}
          viewer="employer"
        />
      )}

      {rejecting && (
        <RejectWithReasonDialog
          open={!!rejecting}
          onOpenChange={(o) => !o && setRejecting(null)}
          applicantName={rejecting.applicant.name}
          onConfirm={(reason) => { handleReject(rejecting.applicant, rejecting.job, rejecting.applicationId, reason, rejecting.iv); setRejecting(null); }}
        />
      )}

      {detail && (
        <ApplicantDetailDialog
          open={!!detail}
          a={detail.applicant as unknown as Applicant}
          onOpenChange={(open) => !open && setDetail(null)}
          onStatus={async (applicant, status) => {
            await fetch(`http://localhost:5000/api/employer/applications/${detail.applicationId}/status`, {
                method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status })
            });
            toast.success(`${applicant.name} moved to ${status}`);
            setDetail(null);
            fetchShortlisted();
          }}
        />
      )}
    </DashShell>
  );
}

// ----------------------------------------------------
// HELPER COMPONENTS
// ----------------------------------------------------

function IvList({ list, onDone, onCancel, onMessage, onReschedule, onReject, readOnly }: {
  list: any[];
  onDone?: (iv: any) => void;
  onCancel?: (iv: any) => void;
  onMessage?: (iv: any) => void;
  onReschedule?: (iv: any) => void;
  onReject?: (iv: any) => void;
  readOnly?: boolean;
}) {
  if (!list.length) return <Card className="p-6 text-center text-muted-foreground border-border/60 mt-4">Nothing here.</Card>;
  return (
    <div className="grid gap-3 mt-4">
      {list.map((iv) => (
        <Card key={iv.id} className="p-5 border-border/60 flex flex-col md:flex-row md:items-start gap-4">
          <div className="text-center shrink-0 w-24">
            <p className="font-display font-bold text-navy">{iv.time}</p>
            <p className="text-xs text-muted-foreground">{new Date(iv.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</p>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-display font-bold text-navy">{iv.applicantName}</p>
              <Badge className={iv.mode === "Online" ? "bg-india-green/15 text-india-green gap-1" : "bg-saffron/15 text-saffron gap-1"}>
                {iv.mode === "Online" ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                {iv.mode}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {iv.status === "Scheduled" ? <Clock className="h-3 w-3 mr-1" /> : iv.status === "Completed" ? <Check className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                {iv.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{iv.jobTitle} · {iv.company}</p>
            {iv.mode === "Online" ? (
              <a href={iv.meetingLink} target="_blank" rel="noreferrer" className="text-xs text-india-green underline break-all">{iv.meetingLink}</a>
            ) : (
              <>
                <p className="text-xs text-muted-foreground mt-1">Venue: {iv.venue}</p>
              </>
            )}
          </div>
          {!readOnly && (
            <div className="flex flex-col gap-2 shrink-0 min-w-[170px]">
              {iv.mode === "Online" && (
                <a href={iv.meetingLink} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="outline" className="w-full"><Video className="h-3.5 w-3.5 mr-1" />Join</Button>
                </a>
              )}
              <Button size="sm" variant="outline" onClick={() => onReschedule?.(iv)}>
                <RefreshCcw className="h-3.5 w-3.5 mr-1" />Change interview
              </Button>
              <Button size="sm" variant="outline" onClick={() => onMessage?.(iv)}>
                <MessageSquare className="h-3.5 w-3.5 mr-1" />Message
              </Button>
              <Button size="sm" className="bg-india-green text-white hover:bg-india-green/90" onClick={() => onDone?.(iv)}>
                <Check className="h-3.5 w-3.5 mr-1" />Mark done
              </Button>
              <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => onReject?.(iv)}>
                <XCircle className="h-3.5 w-3.5 mr-1" />Reject
              </Button>
              <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => onCancel?.(iv)}>
                Cancel interview
              </Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}