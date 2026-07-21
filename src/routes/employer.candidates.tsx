import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useCallback } from "react";
import { DashShell, PageHeader } from "@/components/DashShell";
import { employerNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sparkles, Users, Check, Calendar as CalIcon, Download, Mail, Phone, MapPin, GraduationCap, Briefcase, Award, Eye, Pencil, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import { getSession } from "@/lib/mockStore";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export const Route = createFileRoute("/employer/candidates")({
  head: () => ({ meta: [{ title: "Applications — Bharat Career Connect" }] }),
  component: CandidatesPage,
});

function CandidatesPage() {
  return (
    <DashShell role="employer" nav={employerNav}>
      <CandidatesBody />
    </DashShell>
  );
}

export function CandidatesBody() {
  const user = getSession();
  const userId = user?.id;
  const employerName = user?.name || "Employer";

  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [applicants, setApplicants] = useState<any[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isLoadingApps, setIsLoadingApps] = useState(false);

  const fetchJobs = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/employer/${userId}/job-options`);
      const json = await res.json();
      if (json.success) {
        setJobs(json.data);
        if (json.data.length > 0 && !selectedId) setSelectedId(json.data[0].id.toString());
      }
    } catch (error) {
      console.error("Failed to fetch jobs");
    } finally {
      setIsLoadingJobs(false);
    }
  }, [userId, selectedId]);

  const fetchApplicants = useCallback(async () => {
    if (!selectedId) return;
    setIsLoadingApps(true);
    try {
      const res = await fetch(`http://localhost:5000/api/employer/jobs/${selectedId}/applications`);
      const json = await res.json();
      if (json.success) {
        const mapped = json.data.map((a: any) => {
          let parsedSkills = [];
          try { parsedSkills = typeof a.skills === 'string' ? JSON.parse(a.skills) : (a.skills || []); } catch(e) {}

          return {
            id: a.unique_id,
            applicationId: a.application_id.toString(), 
            name: a.full_name,
            email: a.email,
            phone: a.phone,
            qualification: a.highest_qualification || "Any",
            experience: a.experience_type || "Fresher",
            skills: parsedSkills,
            matchScore: a.matchScore !== undefined ? a.matchScore : 0, // FIXED: Will never randomly default to 85 anymore!
            resumeFileName: a.resume_file_name || "resume.pdf",
            appliedAt: a.applied_at || new Date().toISOString(),
            status: a.app_status || "Applied",
            location: "Not specified"
          };
        });
        setApplicants(mapped);
      }
    } catch (error) {
      console.error("Failed to fetch applicants", error);
    } finally {
      setIsLoadingApps(false);
    }
  }, [selectedId]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  const selectedJob = jobs.find(j => j.id.toString() === selectedId);

  const allSorted = useMemo(() => [...applicants].sort((a, b) => (new Date(a.appliedAt) < new Date(b.appliedAt) ? 1 : -1)), [applicants]);
  const smartSorted = useMemo(() => [...applicants].sort((a, b) => b.matchScore - a.matchScore), [applicants]);

  async function changeStatus(a: any, status: string, note?: string) {
    try {
      await fetch(`http://localhost:5000/api/employer/applications/${a.applicationId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      if (note) {
        await fetch(`http://localhost:5000/api/applications/${a.applicationId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ senderType: "employer", senderId: userId?.toString(), message: `Status updated to ${status}. Note: ${note}` })
        });
      }

      toast.success(`${a.name} → ${status === "Interview" ? "Interviewed" : status}`);
      fetchApplicants(); 
    } catch (error) {
      toast.error("Failed to update status.");
    }
  }

  return (
    <>
      <PageHeader
        title="Applications"
        description="Every candidate who applied to your jobs — view all applications or use AI Smart Matching."
      />

      <Card className="p-4 mb-4 border-border/60 flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="flex-1 min-w-0">
          <label className="text-xs text-muted-foreground">Select a job posting</label>
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="mt-1"><SelectValue placeholder={isLoadingJobs ? "Loading jobs..." : "Choose a job"} /></SelectTrigger>
            <SelectContent>
              {jobs.map((j) => (
                <SelectItem key={j.id} value={j.id.toString()}>{j.title} — {j.location}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedJob && (
          <div className="text-sm text-muted-foreground sm:text-right">
            <div className="flex items-center gap-1 sm:justify-end"><Users className="h-4 w-4" />{applicants.length} total applicants</div>
            <div className="flex items-center gap-1 sm:justify-end mt-1"><CalIcon className="h-3.5 w-3.5" />Posted {new Date(selectedJob.created_at).toLocaleDateString("en-IN")}</div>
          </div>
        )}
      </Card>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all" className="gap-1"><Users className="h-3.5 w-3.5" />All Applications ({applicants.length})</TabsTrigger>
          <TabsTrigger value="smart" className="gap-1"><Sparkles className="h-3.5 w-3.5" />Smart Matching</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          {isLoadingApps ? (
            <div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin text-saffron" /></div>
          ) : (
            <ApplicantList list={allSorted} onStatus={changeStatus} />
          )}
        </TabsContent>
        <TabsContent value="smart">
           {isLoadingApps ? (
            <div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin text-saffron" /></div>
          ) : (
            <ApplicantList list={smartSorted} onStatus={changeStatus} />
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}

export interface SchedulePayload {
  mode: "Online" | "Walk-in"; date: string; time: string; meetingLink?: string; venue?: string; locationDetail?: string; mapsLink?: string; description?: string; notifyWhatsapp: boolean; notifyEmail: boolean;
}

export function ScheduleInterviewDialog({ open, applicant, job, onClose, onConfirm, reschedule }: { open: boolean; applicant: any; job: any; onClose: () => void; onConfirm: (p: SchedulePayload) => void; reschedule?: boolean; }) {
  const [mode, setMode] = useState<"Online" | "Walk-in">("Online");
  const [date, setDate] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [time, setTime] = useState("10:00");
  const [meetingLink, setMeetingLink] = useState("https://meet.google.com/new");
  const [venue, setVenue] = useState(job.company ? `${job.company}, ${job.location}` : job.location);
  const [locationDetail, setLocationDetail] = useState("");
  const [mapsLink, setMapsLink] = useState("");
  const [description, setDescription] = useState("");
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onConfirm({ mode, date, time, description, notifyWhatsapp, notifyEmail, meetingLink: mode === "Online" ? meetingLink : undefined, venue: mode === "Walk-in" ? venue : undefined, locationDetail: mode === "Walk-in" ? locationDetail : undefined, mapsLink: mode === "Walk-in" ? mapsLink : undefined });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{reschedule ? "Change interview slot" : "Schedule interview"} — {applicant.name}</DialogTitle>
          <DialogDescription>{job.title} · {job.location} {reschedule && <span className="block text-saffron mt-1">A new interview slot will be added for this candidate.</span>}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label className="mb-2 block">Interview mode</Label>
            <RadioGroup value={mode} onValueChange={(v) => setMode(v as "Online" | "Walk-in")} className="grid grid-cols-2 gap-2">
              <label className={`flex items-center gap-2 border rounded-md p-3 cursor-pointer ${mode === "Online" ? "border-saffron bg-saffron/5" : "border-border"}`}><RadioGroupItem value="Online" /><span className="text-sm font-medium">Online</span></label>
              <label className={`flex items-center gap-2 border rounded-md p-3 cursor-pointer ${mode === "Walk-in" ? "border-saffron bg-saffron/5" : "border-border"}`}><RadioGroupItem value="Walk-in" /><span className="text-sm font-medium">Walk-in</span></label>
            </RadioGroup>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1" required /></div>
            <div><Label>Time</Label><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1" required /></div>
          </div>
          {mode === "Online" ? (
            <div><Label>Meeting link</Label><Input value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} className="mt-1" placeholder="https://meet.google.com/..." required /></div>
          ) : (
            <>
              <div><Label>Company location</Label><Input value={venue} onChange={(e) => setVenue(e.target.value)} className="mt-1" placeholder="Company name, city" required /></div>
              <div><Label>Google Maps link</Label><Input value={mapsLink} onChange={(e) => setMapsLink(e.target.value)} className="mt-1" placeholder="https://maps.google.com/?q=..." /><p className="text-[11px] text-muted-foreground mt-1">Paste the Google Maps link — the candidate can tap it to navigate.</p></div>
              <div><Label>Location details (manual)</Label><textarea value={locationDetail} onChange={(e) => setLocationDetail(e.target.value)} className="mt-1 w-full min-h-[64px] rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="e.g. 3rd floor, opposite XYZ Mall, near the metro station" /></div>
            </>
          )}
          <div><Label>Description & documents required</Label><textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Round details, documents to bring (resume, ID proof, marksheets), dress code, etc." /></div>
          <div className="rounded-md border border-border/60 p-3 space-y-2 bg-muted/30">
            <p className="text-xs font-medium text-navy">Send invite via</p>
            <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={notifyWhatsapp} onChange={(e) => setNotifyWhatsapp(e.target.checked)} />WhatsApp message to candidate</label>
            <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} />Email to candidate</label>
            <p className="text-[11px] text-muted-foreground">One combined message with details is sent — and saved in the candidate's message box.</p>
          </div>
          <DialogFooter><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" className="bg-saffron text-navy hover:bg-saffron/90">{reschedule ? "Add changed slot" : "Schedule Meeting"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ApplicantDetailDialog({ a, open, onOpenChange, onStatus }: { a: any; open: boolean; onOpenChange: (o: boolean) => void; onStatus: (a: any, s: string) => void }) {
  const d = useMemo(() => buildDetail(a), [a]);
  const statusLabel = a.status === "Interview" ? "Interviewed" : a.status;

  function downloadResume() {
    const lines = [`RESUME — ${a.name}`, `Candidate ID: ${d.uniqueId}`, ``, `CONTACT`, `Email: ${d.email}`, `Phone: ${d.phone}`, `Location: ${d.district}, ${d.state} — ${d.pincode}`, ``, `PROFILE`, d.about, ``, `EDUCATION`, `${a.qualification} — ${d.specialization}`, `${d.institution}`, `Year of Passing: ${d.yearOfPassing} · Score: ${d.percentage}`, ``, `EXPERIENCE`, `${d.currentRole} @ ${d.currentCompany} (${a.experience})`, ``, `SKILLS`, a.skills.join(", "), ``, `CERTIFICATIONS`, d.certifications.join(", "), ``, `LANGUAGES`, d.languages.join(", "), ``, `PREFERENCES`, `Roles: ${d.preferredRoles.join(", ")}`, `Locations: ${d.preferredLocations.join(", ")}`, `Job Type: ${d.preferredJobType} · Expected: ${d.expectedSalary}`].join("\n");
    const blob = new Blob([lines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = d.resumeFileName.replace(/\.pdf$/, ".txt");
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-full bg-gradient-to-br from-saffron to-india-green flex items-center justify-center text-white font-bold text-2xl shrink-0">{a.name ? a.name.charAt(0) : "U"}</div>
            <div className="min-w-0">
              <DialogTitle className="text-xl">{a.name}</DialogTitle>
              <DialogDescription className="flex flex-wrap items-center gap-2 mt-1">
                <span className="font-mono text-xs">{d.uniqueId}</span>
                <Badge className="bg-india-green/15 text-india-green gap-1"><Sparkles className="h-3 w-3" />{a.matchScore}% match</Badge>
                <Badge variant="outline">{statusLabel}</Badge>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="grid sm:grid-cols-2 gap-3 mt-2">
          <InfoRow icon={Mail} label="Email" value={d.email} />
          <InfoRow icon={Phone} label="Phone" value={d.phone} />
          <InfoRow icon={MapPin} label="Location" value={`${d.district}, ${d.state} — ${d.pincode}`} />
          <InfoRow icon={CalIcon} label="Applied on" value={new Date(a.appliedAt).toLocaleDateString("en-IN")} />
        </div>
        <Separator className="my-2" />
        <Section icon={Users} title="About"><p className="text-sm text-muted-foreground">{d.about}</p></Section>
        <Section icon={GraduationCap} title="Education"><div className="text-sm"><p className="font-medium text-navy">{a.qualification} — {d.specialization}</p><p className="text-muted-foreground">{d.institution}</p><p className="text-muted-foreground text-xs mt-0.5">Year of Passing: {d.yearOfPassing} · Score: {d.percentage}</p></div></Section>
        <Section icon={Briefcase} title="Experience"><p className="text-sm"><span className="font-medium text-navy">{d.currentRole}</span>{d.currentCompany !== "—" && <> @ <span className="text-muted-foreground">{d.currentCompany}</span></>}<span className="text-muted-foreground"> · {a.experience}</span></p></Section>
        <Section icon={Sparkles} title="Skills"><div className="flex flex-wrap gap-1.5">{a.skills && a.skills.map((s: string) => <Badge key={s} variant="outline">{s}</Badge>)}</div></Section>
        <Section icon={Award} title="Certifications"><div className="flex flex-wrap gap-1.5">{d.certifications.map((c) => <Badge key={c} className="bg-saffron/15 text-saffron">{c}</Badge>)}</div></Section>
        <Section icon={Users} title="Languages"><p className="text-sm text-muted-foreground">{d.languages.join(" · ")}</p></Section>
        <Section icon={Briefcase} title="Job Preferences"><div className="grid sm:grid-cols-2 gap-2 text-sm"><div><span className="text-muted-foreground">Roles:</span> {d.preferredRoles.join(", ")}</div><div><span className="text-muted-foreground">Locations:</span> {d.preferredLocations.join(", ")}</div><div><span className="text-muted-foreground">Job Type:</span> {d.preferredJobType}</div><div><span className="text-muted-foreground">Expected Salary:</span> {d.expectedSalary}</div></div></Section>
        <DialogFooter className="mt-4 flex-wrap gap-2">
          <Button variant="outline" onClick={downloadResume}><Download className="h-4 w-4 mr-1" />Download Resume</Button>
          <div className="flex-1" />
          <Button variant="outline" onClick={() => { onStatus(a, "Shortlisted"); onOpenChange(false); }}>Shortlist</Button>
          <Button variant="outline" onClick={() => { onStatus(a, "Interview"); onOpenChange(false); }}>Mark Interviewed</Button>
          <Button className="bg-india-green text-white hover:bg-india-green/90" onClick={() => { onStatus(a, "Hired"); onOpenChange(false); }}><Check className="h-4 w-4 mr-1" />Hire</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ApplicantList({ list, onStatus }: { list: any[]; onStatus: (a: any, s: string) => void }) {
  return (
    <div className="grid gap-3 mt-4">
      {list.map((a) => <ApplicantCard key={a.applicationId} a={a} onStatus={onStatus} />)}
      {list.length === 0 && <Card className="p-6 text-center text-muted-foreground border-border/60">No applications yet for this job.</Card>}
    </div>
  );
}

function ApplicantCard({ a, onStatus }: { a: any; onStatus: (a: any, s: string) => void }) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const statusColor: Record<string, string> = { Applied: "bg-muted text-navy", Shortlisted: "bg-saffron/20 text-saffron", Interview: "bg-blue-100 text-blue-700", Hired: "bg-india-green/15 text-india-green", Rejected: "bg-red-100 text-red-700", "Interview Scheduled": "bg-blue-100 text-blue-700" };
  
  return (
    <>
      <Card className="p-5 border-border/60 flex flex-col md:flex-row md:items-center gap-4 card-hover cursor-pointer hover:border-saffron/60 transition" onClick={() => setOpen(true)}>
        <div className="size-12 rounded-full bg-gradient-to-br from-saffron to-india-green flex items-center justify-center text-white font-bold text-lg shrink-0">{a.name ? a.name.charAt(0) : "U"}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-display font-bold text-navy">{a.name}</p>
            <Badge className={statusColor[a.status] || "bg-muted"}>{a.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{a.qualification} · {a.experience} · {a.location}</p>
          <div className="flex flex-wrap gap-1 mt-2">{a.skills && a.skills.map((s: string) => <span key={s} className="text-xs bg-muted px-2 py-0.5 rounded">{s}</span>)}</div>
          <p className="text-[11px] text-saffron mt-2 flex items-center gap-1"><Eye className="h-3 w-3" />Click to view full details</p>
        </div>
        <div className="text-center shrink-0">
          <div className="flex items-center gap-1 text-india-green font-bold"><Sparkles className="h-3 w-3" />{a.matchScore}%</div><p className="text-xs text-muted-foreground mt-1">Match</p>
        </div>
        <div className="flex md:flex-col gap-2 shrink-0 flex-wrap" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="outline" onClick={() => onStatus(a, "Shortlisted")}>Shortlist</Button>
          <Button size="sm" className="bg-india-green text-white hover:bg-india-green/90" onClick={() => onStatus(a, "Hired")}><Check className="h-3.5 w-3.5 mr-1" />Hire</Button>
          <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}><Pencil className="h-3.5 w-3.5 mr-1" />Edit</Button>
        </div>
      </Card>
      <ApplicantDetailDialog a={a} open={open} onOpenChange={setOpen} onStatus={onStatus} />
      <EditStatusDialog a={a} open={editOpen} onOpenChange={setEditOpen} onStatus={onStatus} />
    </>
  );
}

function EditStatusDialog({ a, open, onOpenChange, onStatus }: { a: any; open: boolean; onOpenChange: (o: boolean) => void; onStatus: (a: any, s: string, note: string) => void }) {
  const [status, setStatus] = useState<string>(a.status);
  const [note, setNote] = useState("");
  useEffect(() => { if (open) { setStatus(a.status); setNote(""); } }, [open, a.status]);
  const options = ["Applied", "Shortlisted", "Interview", "Hired", "Rejected"];

  function update() {
    onStatus(a, status, note);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Edit status — {a.name}</DialogTitle><DialogDescription>Change this candidate's application stage and share a short note.</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">New status</Label>
            <div className="grid grid-cols-2 gap-2">{options.map((s) => (<button key={s} type="button" onClick={() => setStatus(s)} className={`border rounded-md px-3 py-2 text-sm font-medium transition ${status === s ? "border-saffron bg-saffron/10 text-navy" : "border-border hover:border-saffron/60"}`}>{s}</button>))}</div>
          </div>
          <div><Label>Description / reason (optional)</Label><textarea value={note} onChange={(e) => setNote(e.target.value)} className="mt-1 w-full min-h-[90px] rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="e.g. Moved back to Shortlist." /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button className="bg-saffron text-navy hover:bg-saffron/90" onClick={update}>Update</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function buildDetail(a: any) {
  const nameParts = a.name ? a.name.split(" ") : ["Candidate"];
  const first = nameParts[0].toLowerCase();
  const last = (nameParts[1] || "candidate").toLowerCase();
  const phoneSeed = a.id ? a.id.split("").reduce((s: number, c: string) => s + c.charCodeAt(0), 0) : 123;
  const phone = `+91 9${(80000000 + (phoneSeed % 20000000)).toString().slice(0, 9)}`;
  return {
    uniqueId: a.id, email: a.email, phone: a.phone || phone, dob: "1999-04-12", gender: "Prefer not to say", category: "General", state: "Karnataka", district: "Bengaluru", pincode: "560001",
    institution: `Institute of Technology`, yearOfPassing: "2024", percentage: `${70 + (phoneSeed % 25)}%`, specialization: a.qualification.includes("BE") ? "Computer Science" : "General", languages: ["English", "Hindi", "Kannada"],
    certifications: ["NSDC Skill Certificate", "NSQF Level 5"], preferredRoles: ["Software Engineer", "Data Analyst"], preferredLocations: ["Bengaluru", "Mysuru"], preferredJobType: "Full-time", expectedSalary: "₹4 – 6 LPA",
    currentRole: a.experience === "Fresher" ? "—" : "Junior Developer", currentCompany: a.experience === "Fresher" ? "—" : "Previous Employer", resumeFileName: a.resumeFileName,
    about: `${a.name} is a ${a.experience.toLowerCase()} candidate based with a ${a.qualification} qualification. Actively looking for opportunities.`,
  };
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return <div className="flex items-start gap-2 text-sm"><Icon className="h-4 w-4 text-saffron mt-0.5 shrink-0" /><div className="min-w-0"><p className="text-xs text-muted-foreground">{label}</p><p className="text-navy break-words">{value}</p></div></div>;
}
function Section({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return <div className="mt-3"><div className="flex items-center gap-2 mb-1.5"><Icon className="h-4 w-4 text-india-green" /><h4 className="font-display font-bold text-navy text-sm">{title}</h4></div>{children}</div>;
}