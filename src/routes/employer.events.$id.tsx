import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { DashShell, PageHeader } from "@/components/DashShell";
import { employerNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Briefcase, Plus, Users, CalendarCheck, Search, ArrowLeft, MapPin,
  Store, FileText, UserCheck, XCircle, Clock, CheckCircle2, IdCard, Trash2, Pencil,
} from "lucide-react";
import {
  SEED_EVENTS, getSession, getStallApplication,
  listJobsForEvent, addPostedJob, updatePostedJob, deletePostedJob,
  getApplicantsForJob, updateApplicantStatus, logEmployerAction,
  scheduleInterview, listInterviews,
  findCandidateByPublicId, recordWalkInDecision, listWalkInDecisions,
  type Job, type Applicant, type StallApplication, type JobEvent, type WalkInCandidate,
} from "@/lib/mockStore";
import { toast } from "sonner";

export const Route = createFileRoute("/employer/events/$id")({
  head: () => ({ meta: [{ title: "Event Workspace — Employer" }] }),
  component: EventWorkspace,
});

function EventWorkspace() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const event = useMemo<JobEvent | undefined>(() => SEED_EVENTS.find((e) => e.id === id), [id]);
  const [app, setApp] = useState<StallApplication | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const uid = getSession()?.id ?? "demo-employer";
    const a = getStallApplication(id, uid);
    setApp(a);
    setReady(true);
    if (!a || a.status !== "approved" || !a.attended) {
      toast.error("Mark attendance at the gate before opening the event workspace");
      navigate({ to: "/employer/events" });
    }
  }, [id, navigate]);

  if (!event) {
    return (
      <DashShell role="employer" nav={employerNav}>
        <PageHeader title="Event not found" />
        <Button asChild variant="outline"><Link to="/employer/events"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link></Button>
      </DashShell>
    );
  }

  if (!ready || !app || !app.attended) {
    return (
      <DashShell role="employer" nav={employerNav}>
        <PageHeader title="Locked" description="Workspace opens after attendance." />
      </DashShell>
    );
  }

  return (
    <DashShell role="employer" nav={employerNav}>
      <div className="mb-4">
        <Button asChild variant="ghost" size="sm"><Link to="/employer/events"><ArrowLeft className="h-4 w-4 mr-1" /> All events</Link></Button>
      </div>
      <PageHeader
        title={event.title}
        description={`${event.venue} · ${new Date(event.date).toLocaleDateString("en-IN", { dateStyle: "long" })}`}
        action={
          <div className="flex gap-2 items-center flex-wrap">
            <Badge className="bg-india-green text-white gap-1"><CheckCircle2 className="h-3 w-3" /> Attended</Badge>
            <Badge variant="outline" className="gap-1"><Store className="h-3 w-3" /> Stall {app.stallNo} · {app.hall}</Badge>
          </div>
        }
      />

      <Tabs defaultValue="jobs" className="w-full">
        <TabsList>
          <TabsTrigger value="jobs"><Briefcase className="h-4 w-4 mr-1.5" />Job Postings</TabsTrigger>
          <TabsTrigger value="applications"><Users className="h-4 w-4 mr-1.5" />Applications</TabsTrigger>
          <TabsTrigger value="interviews"><CalendarCheck className="h-4 w-4 mr-1.5" />Interviews</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="mt-4"><JobsTab event={event} /></TabsContent>
        <TabsContent value="applications" className="mt-4"><ApplicationsTab event={event} /></TabsContent>
        <TabsContent value="interviews" className="mt-4"><InterviewsTab event={event} /></TabsContent>
      </Tabs>
    </DashShell>
  );
}

/* ----------------- Job Postings tab (event-scoped, day-of only) ----------------- */
function JobsTab({ event }: { event: JobEvent }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);

  useEffect(() => {
    const sync = () => setJobs(listJobsForEvent(event.id));
    sync();
    window.addEventListener("bcc-jobs", sync);
    return () => window.removeEventListener("bcc-jobs", sync);
  }, [event.id]);

  return (
    <>
      <div className="flex justify-between mb-3">
        <p className="text-sm text-muted-foreground">Roles posted at this event only. They stay visible for {new Date(event.date).toLocaleDateString("en-IN", { dateStyle: "medium" })} and do not appear on your main jobs list.</p>
        <Button className="bg-saffron text-navy hover:bg-saffron/90" onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Post event job
        </Button>
      </div>

      <Card className="border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Qualification</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Stall</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">No jobs posted yet for this event.</TableCell></TableRow>
            ) : jobs.map((j) => (
              <TableRow key={j.id}>
                <TableCell className="font-medium text-navy">{j.title}</TableCell>
                <TableCell><Badge variant="outline">{j.type}</Badge></TableCell>
                <TableCell className="text-sm text-muted-foreground">{j.qualification}</TableCell>
                <TableCell className="text-sm">{j.salary}</TableCell>
                <TableCell className="text-sm">{j.stallNo ?? "—"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => { setEditing(j); setOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => { deletePostedJob(j.id); toast.success("Job removed"); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <EventJobDialog event={event} open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }} editJob={editing} />
    </>
  );
}

function EventJobDialog({ event, open, onOpenChange, editJob }: {
  event: JobEvent; open: boolean; onOpenChange: (o: boolean) => void; editJob: Job | null;
}) {
  const stallNo = useMemo(() => {
    const uid = getSession()?.id ?? "demo-employer";
    return getStallApplication(event.id, uid)?.stallNo ?? "";
  }, [event.id, open]);

  const empty = { title: "", type: "Full-time" as Job["type"], qualification: "", experience: "", salary: "", skills: "", description: "" };
  const [f, setF] = useState(empty);

  useEffect(() => {
    if (editJob) {
      setF({
        title: editJob.title, type: editJob.type,
        qualification: editJob.qualification || "", experience: editJob.experience || "",
        salary: editJob.salary || "", skills: (editJob.skills || []).join(", "), description: "",
      });
    } else setF(empty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editJob, open]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.title) { toast.error("Job title is required"); return; }
    if (editJob) {
      updatePostedJob(editJob.id, {
        title: f.title, type: f.type, qualification: f.qualification || "Any",
        experience: f.experience || "Fresher", salary: f.salary || "Negotiable",
        skills: f.skills.split(",").map((s) => s.trim()).filter(Boolean),
      });
      toast.success("Job updated");
    } else {
      addPostedJob({
        id: "job-" + Date.now(),
        title: f.title, company: getSession()?.name ?? "Your Company", location: event.venue,
        type: f.type, qualification: f.qualification || "Any",
        skills: f.skills.split(",").map((s) => s.trim()).filter(Boolean),
        experience: f.experience || "Fresher", salary: f.salary || "Negotiable",
        stallNo: stallNo || undefined, eventId: event.id,
        approvalStatus: "approved",
        postedAt: new Date().toISOString().slice(0, 10),
      });
      toast.success(`"${f.title}" posted for ${event.title}`);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-saffron" /> {editJob ? "Edit event job" : "Post job at this event"}</DialogTitle>
          <DialogDescription>Visible only inside this event for candidates walking in on {new Date(event.date).toLocaleDateString("en-IN")}. Stall {stallNo || "—"}.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><Label>Title *</Label><Input required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className="mt-1" /></div>
          <div><Label>Type</Label>
            <Select value={f.type} onValueChange={(v) => setF({ ...f, type: v as Job["type"] })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Internship">Internship</SelectItem>
                <SelectItem value="Apprenticeship">Apprenticeship</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Qualification</Label><Input value={f.qualification} onChange={(e) => setF({ ...f, qualification: e.target.value })} className="mt-1" /></div>
          <div><Label>Experience</Label><Input value={f.experience} onChange={(e) => setF({ ...f, experience: e.target.value })} className="mt-1" /></div>
          <div><Label>Salary</Label><Input value={f.salary} onChange={(e) => setF({ ...f, salary: e.target.value })} className="mt-1" /></div>
          <div className="sm:col-span-2"><Label>Skills (comma separated)</Label><Input value={f.skills} onChange={(e) => setF({ ...f, skills: e.target.value })} className="mt-1" /></div>
          <div className="sm:col-span-2"><Label>Description</Label><Textarea rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className="mt-1" /></div>
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-saffron text-navy hover:bg-saffron/90">{editJob ? "Save" : "Post"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------- Applications tab (event-scoped applicants + walk-in ID lookup) ----------------- */
function ApplicationsTab({ event }: { event: JobEvent }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [lookup, setLookup] = useState("");
  const [walkIn, setWalkIn] = useState<WalkInCandidate | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [decisions, setDecisions] = useState(() => listWalkInDecisions(event.id));

  useEffect(() => {
    const sync = () => {
      const list = listJobsForEvent(event.id);
      setJobs(list);
      if (list.length && !selectedJob) setSelectedJob(list[0].id);
      setDecisions(listWalkInDecisions(event.id));
    };
    sync();
    window.addEventListener("bcc-jobs", sync);
    window.addEventListener("bcc-walkin-decisions", sync);
    return () => {
      window.removeEventListener("bcc-jobs", sync);
      window.removeEventListener("bcc-walkin-decisions", sync);
    };
  }, [event.id, selectedJob]);

  useEffect(() => {
    if (!selectedJob) { setApplicants([]); return; }
    const sync = () => setApplicants(getApplicantsForJob(selectedJob));
    sync();
    window.addEventListener("bcc-applicants", sync);
    return () => window.removeEventListener("bcc-applicants", sync);
  }, [selectedJob]);

  function doLookup() {
    setNotFound(false);
    const res = findCandidateByPublicId(lookup);
    if (!res) { setWalkIn(null); setNotFound(true); return; }
    setWalkIn(res);
  }

  function decide(d: "Shortlisted" | "Interview" | "Hired" | "Rejected") {
    if (!walkIn) return;
    recordWalkInDecision({ eventId: event.id, candidateId: walkIn.uniqueId, candidateName: walkIn.fullName, decision: d });
    toast.success(`${walkIn.fullName} marked as ${d}`);
  }

  return (
    <div className="space-y-6">
      {/* Walk-in ID lookup */}
      <Card className="p-5 border-border/60 border-saffron/40 bg-saffron/5">
        <div className="flex items-center gap-2 mb-2">
          <IdCard className="h-5 w-5 text-saffron" />
          <h3 className="font-display font-bold text-navy">Candidate ID Lookup (walk-in)</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">A candidate walked into your stall without applying online. Ask for their Bharat Career Connect ID and search — full profile appears below with quick actions.</p>
        <div className="flex gap-2">
          <Input value={lookup} onChange={(e) => setLookup(e.target.value)} placeholder="BCC-XXXXXXXX" className="font-mono" onKeyDown={(e) => e.key === "Enter" && doLookup()} />
          <Button onClick={doLookup} className="bg-navy text-white hover:bg-navy/90"><Search className="h-4 w-4 mr-1" /> Search</Button>
        </div>
        {notFound && <p className="text-sm text-red-600 mt-3">No candidate found with that ID. Try BCC-88451207 or BCC-77329918 (demo IDs).</p>}
        {walkIn && (
          <div className="mt-4 p-4 rounded-lg bg-background border border-border">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-display font-bold text-navy text-lg">{walkIn.fullName}</h4>
                  <Badge variant="outline" className="font-mono">{walkIn.uniqueId}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{walkIn.qualification ?? "—"} · {walkIn.experience ?? "—"} · {walkIn.location ?? "—"}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{walkIn.phone}{walkIn.email && ` · ${walkIn.email}`}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(walkIn.skills ?? []).map((s) => <span key={s} className="text-[11px] bg-muted px-2 py-0.5 rounded">{s}</span>)}
                </div>
                {walkIn.resumeFileName && (
                  <p className="text-xs mt-2 flex items-center gap-1.5 text-navy"><FileText className="h-3.5 w-3.5" /> {walkIn.resumeFileName}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => decide("Shortlisted")}>Shortlist</Button>
              <Button size="sm" className="bg-navy text-white hover:bg-navy/90" onClick={() => decide("Interview")}><CalendarCheck className="h-3.5 w-3.5 mr-1" /> Interview now</Button>
              <Button size="sm" className="bg-india-green text-white hover:bg-india-green/90" onClick={() => decide("Hired")}><UserCheck className="h-3.5 w-3.5 mr-1" /> Hire</Button>
              <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => decide("Rejected")}><XCircle className="h-3.5 w-3.5 mr-1" /> Not hired</Button>
            </div>
          </div>
        )}
        {decisions.length > 0 && (
          <div className="mt-4">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5">Recent walk-in decisions</p>
            <div className="space-y-1">
              {decisions.slice(0, 5).map((d) => (
                <div key={d.id} className="text-xs flex justify-between p-2 rounded bg-background border border-border/60">
                  <span className="text-navy"><span className="font-mono">{d.candidateId}</span> · {d.candidateName}</span>
                  <Badge variant="outline" className={d.decision === "Hired" ? "text-india-green border-india-green/40" : d.decision === "Rejected" ? "text-red-600 border-red-200" : ""}>{d.decision}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Online applicants */}
      <Card className="p-5 border-border/60">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="font-display font-bold text-navy">Online applicants at this event</h3>
          <Select value={selectedJob} onValueChange={setSelectedJob}>
            <SelectTrigger className="w-64"><SelectValue placeholder="Select job" /></SelectTrigger>
            <SelectContent>
              {jobs.map((j) => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {jobs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Post a job first to see applications.</p>
        ) : applicants.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No applicants for this job yet.</p>
        ) : (
          <div className="space-y-2">
            {applicants.map((a) => (
              <div key={a.id} className="p-3 rounded-lg border border-border/60 flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="font-medium text-navy">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.qualification} · {a.experience} · Match {a.matchScore}%</p>
                  <div className="flex flex-wrap gap-1 mt-1">{a.skills.map((s) => <span key={s} className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{s}</span>)}</div>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {(["Shortlisted", "Interview", "Hired", "Rejected"] as const).map((st) => (
                    <Button key={st} size="sm" variant={a.status === st ? "default" : "outline"}
                      className={a.status === st ? (st === "Hired" ? "bg-india-green text-white" : st === "Rejected" ? "bg-red-600 text-white" : "bg-navy text-white") : ""}
                      onClick={() => {
                        updateApplicantStatus(selectedJob, a.id, st);
                        logEmployerAction({ employerName: getSession()?.name ?? "Employer", jobId: selectedJob, jobTitle: jobs.find((j) => j.id === selectedJob)?.title ?? "", applicantId: a.id, applicantName: a.name, action: st });
                        toast.success(`${a.name}: ${st}`);
                      }}>{st}</Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ----------------- Interviews tab (event-scoped) ----------------- */
function InterviewsTab({ event }: { event: JobEvent }) {
  const [interviews, setInterviews] = useState(() => listInterviews());
  const eventJobIds = useMemo(() => listJobsForEvent(event.id).map((j) => j.id), [event.id]);
  const scoped = interviews.filter((iv) => eventJobIds.includes(iv.jobId));
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => setInterviews(listInterviews());
    window.addEventListener("bcc-interviews", sync);
    return () => window.removeEventListener("bcc-interviews", sync);
  }, []);

  return (
    <>
      <div className="flex justify-between mb-3">
        <p className="text-sm text-muted-foreground">Interviews scheduled for roles at this event.</p>
        <Button className="bg-saffron text-navy hover:bg-saffron/90" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Schedule walk-in interview</Button>
      </div>

      <Card className="border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>When</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scoped.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">No interviews yet at this event.</TableCell></TableRow>
            ) : scoped.map((iv) => (
              <TableRow key={iv.id}>
                <TableCell className="font-medium text-navy">{iv.applicantName}</TableCell>
                <TableCell className="text-sm">{iv.jobTitle}</TableCell>
                <TableCell><Badge variant="outline">{iv.mode}</Badge></TableCell>
                <TableCell className="text-sm">{iv.date} · {iv.time}</TableCell>
                <TableCell><Badge className={iv.status === "Completed" ? "bg-india-green/15 text-india-green" : iv.status === "Cancelled" ? "bg-red-500/15 text-red-600" : "bg-saffron/15 text-saffron"}>{iv.status}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <ScheduleWalkInDialog event={event} open={open} onOpenChange={setOpen} />
    </>
  );
}

function ScheduleWalkInDialog({ event, open, onOpenChange }: { event: JobEvent; open: boolean; onOpenChange: (o: boolean) => void }) {
  const jobs = useMemo(() => listJobsForEvent(event.id), [event.id, open]);
  const stall = useMemo(() => {
    const uid = getSession()?.id ?? "demo-employer";
    return getStallApplication(event.id, uid);
  }, [event.id, open]);

  const [f, setF] = useState({ candidateId: "", candidateName: "", jobId: "", time: "" });

  useEffect(() => { if (open) setF({ candidateId: "", candidateName: "", jobId: jobs[0]?.id ?? "", time: "10:00" }); }, [open, jobs]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.candidateName || !f.jobId || !f.time) { toast.error("Fill all fields"); return; }
    const job = jobs.find((j) => j.id === f.jobId);
    scheduleInterview({
      applicantId: f.candidateId || "WALKIN-" + Date.now(),
      applicantName: f.candidateName,
      jobId: f.jobId, jobTitle: job?.title ?? "",
      company: getSession()?.name ?? "Your Company",
      mode: "Walk-in",
      date: event.date, time: f.time,
      venue: `${event.venue} · Stall ${stall?.stallNo ?? "—"}`,
    });
    toast.success("Walk-in interview scheduled");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><CalendarCheck className="h-5 w-5 text-saffron" /> Schedule walk-in interview</DialogTitle>
          <DialogDescription>At stall {stall?.stallNo ?? "—"}, {new Date(event.date).toLocaleDateString("en-IN")}.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div><Label>Candidate name *</Label><Input required value={f.candidateName} onChange={(e) => setF({ ...f, candidateName: e.target.value })} className="mt-1" /></div>
          <div><Label>Candidate ID (optional)</Label><Input value={f.candidateId} onChange={(e) => setF({ ...f, candidateId: e.target.value })} placeholder="BCC-XXXXXXXX" className="mt-1 font-mono" /></div>
          <div><Label>Job *</Label>
            <Select value={f.jobId} onValueChange={(v) => setF({ ...f, jobId: v })}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{jobs.map((j) => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Time *</Label><Input type="time" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} className="mt-1" /></div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-saffron text-navy hover:bg-saffron/90">Schedule</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
