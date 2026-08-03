import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useCallback } from "react";
import { DashShell, PageHeader } from "@/components/DashShell";
import { employerNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sparkles, Users, Check, Calendar as CalIcon, Download, Mail, Phone, MapPin, GraduationCap, Briefcase, Award, Eye, Pencil, Loader2, Send, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import { getSession } from "@/lib/mockStore";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import * as XLSX from "xlsx";

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

  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [applicants, setApplicants] = useState<any[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isLoadingApps, setIsLoadingApps] = useState(false);

  const fetchJobs = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/employer/${userId}/job-options`);
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
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/employer/jobs/${selectedId}/applications`);
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
            matchScore: a.matchScore !== undefined ? a.matchScore : 0,
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

  const handleExportExcel = () => {
    if (!applicants || applicants.length === 0) {
      toast.error("No applicants available to export.");
      return;
    }

    const worksheetData = applicants.map((item) => ({
      "Application ID": item.applicationId,
      "Candidate Name": item.name,
      "Email": item.email,
      "Phone": item.phone,
      "Qualification": item.qualification,
      "Experience": item.experience,
      "Match Score (%)": item.matchScore,
      "Status": item.status,
      "Applied Date": new Date(item.appliedAt).toLocaleDateString("en-IN")
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applicants");
    
    XLSX.writeFile(workbook, `Applicants_${selectedJob?.title || "Job"}.xlsx`);
    toast.success("Applicants exported to Excel successfully!");
  };

  async function changeStatus(a: any, status: string, note?: string) {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/employer/applications/${a.applicationId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      if (note) {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/applications/${a.applicationId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ senderType: "employer", senderId: userId?.toString(), message: `Status updated to ${status}. Note: ${note}` })
        });
      }

      if (status === "Interview") {
        toast.success(`${a.name} has been added to the Live Queue!`);
      } else {
        toast.success(`${a.name} status updated to ${status}`);
      }
      
      fetchApplicants(); 
    } catch (error) {
      toast.error("Failed to update status.");
    }
  }

  return (
    <>
      <PageHeader
        title="Event Applications"
        description="Manage event walk-ins, shortlist candidates, and send them to your Live Interview Queue."
      />

      <Card className="p-4 mb-4 border-border/60 flex flex-col sm:flex-row gap-3 sm:items-center justify-between shadow-sm bg-white">
        <div className="flex-1 min-w-0">
          <label className="text-xs font-semibold text-navy mb-1 block">Select an Event Job</label>
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="mt-1"><SelectValue placeholder={isLoadingJobs ? "Loading jobs..." : "Choose a job"} /></SelectTrigger>
            <SelectContent>
              {jobs.map((j) => (
                <SelectItem key={j.id} value={j.id.toString()}>{j.title} — {j.location}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-3 pt-4 sm:pt-0">
          {selectedJob && (
            <div className="text-sm text-muted-foreground sm:text-right hidden sm:block">
              <div className="flex items-center gap-1 sm:justify-end font-medium"><Users className="h-4 w-4" />{applicants.length} applicants</div>
            </div>
          )}
          <Button variant="outline" className="gap-2 border-india-green/30 text-india-green hover:bg-india-green/10 bg-india-green/5" onClick={handleExportExcel}>
            <Download className="h-4 w-4" /> Export Excel
          </Button>
        </div>
      </Card>

      <Tabs defaultValue="all">
        <TabsList className="mb-2">
          <TabsTrigger value="all" className="gap-1 font-semibold"><Users className="h-3.5 w-3.5" />All Applications ({applicants.length})</TabsTrigger>
          <TabsTrigger value="smart" className="gap-1 font-semibold"><Sparkles className="h-3.5 w-3.5" />Smart Matching</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          {isLoadingApps ? (
            <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-saffron" /></div>
          ) : (
            <ApplicantList list={allSorted} onStatus={changeStatus} />
          )}
        </TabsContent>
        <TabsContent value="smart">
           {isLoadingApps ? (
            <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-saffron" /></div>
          ) : (
            <ApplicantList list={smartSorted} onStatus={changeStatus} />
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}

export function ApplicantDetailDialog({ a, open, onOpenChange, onStatus }: { a: any; open: boolean; onOpenChange: (o: boolean) => void; onStatus: (a: any, s: string) => void }) {
  const d = useMemo(() => buildDetail(a), [a]);

  function downloadResume() {
    const lines = [`RESUME — ${a.name}`, `Candidate ID: ${d.uniqueId}`, ``, `CONTACT`, `Email: ${d.email}`, `Phone: ${d.phone}`, `Location: ${d.district}, ${d.state} — ${d.pincode}`, ``, `PROFILE`, d.about, ``, `EDUCATION`, `${a.qualification} — ${d.specialization}`, `${d.institution}`, `Year of Passing: ${d.yearOfPassing} · Score: ${d.percentage}`, ``, `EXPERIENCE`, `${d.currentRole} @ ${d.currentCompany} (${a.experience})`, ``, `SKILLS`, a.skills.join(", "), ``, `CERTIFICATIONS`, d.certifications.join(", "), ``, `LANGUAGES`, d.languages.join(" · "), ``, `PREFERENCES`, `Roles: ${d.preferredRoles.join(", ")}`, `Locations: ${d.preferredLocations.join(", ")}`, `Job Type: ${d.preferredJobType} · Expected: ${d.expectedSalary}`].join("\n");
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
            <div className="size-16 rounded-full bg-gradient-to-br from-saffron to-india-green flex items-center justify-center text-white font-bold text-2xl shrink-0 border border-slate-100 shadow-sm">{a.name ? a.name.charAt(0) : "U"}</div>
            <div className="min-w-0">
              <DialogTitle className="text-xl font-display text-navy">{a.name}</DialogTitle>
              <DialogDescription className="flex flex-wrap items-center gap-2 mt-2">
                <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200">ID: {d.uniqueId}</span>
                <Badge className="bg-india-green/15 text-india-green gap-1 border-0"><Sparkles className="h-3 w-3" />{a.matchScore}% match</Badge>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="grid sm:grid-cols-2 gap-3 mt-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
          <InfoRow icon={Mail} label="Email" value={d.email} />
          <InfoRow icon={Phone} label="Phone" value={d.phone} />
          <InfoRow icon={MapPin} label="Location" value={`${d.district}, ${d.state} — ${d.pincode}`} />
          <InfoRow icon={CalIcon} label="Applied on" value={new Date(a.appliedAt).toLocaleDateString("en-IN")} />
        </div>
        
        <div className="space-y-6 mt-6">
          <Section icon={Users} title="About Candidate"><p className="text-sm text-muted-foreground leading-relaxed">{d.about}</p></Section>
          <Separator className="bg-slate-100" />
          <Section icon={GraduationCap} title="Education"><div className="text-sm"><p className="font-medium text-navy">{a.qualification} — {d.specialization}</p><p className="text-muted-foreground mt-0.5">{d.institution}</p><p className="text-muted-foreground text-xs mt-1">Year of Passing: {d.yearOfPassing} · Score: {d.percentage}</p></div></Section>
          <Separator className="bg-slate-100" />
          <Section icon={Briefcase} title="Experience"><p className="text-sm"><span className="font-medium text-navy">{d.currentRole}</span>{d.currentCompany !== "—" && <> @ <span className="text-muted-foreground">{d.currentCompany}</span></>}<span className="text-muted-foreground"> · {a.experience}</span></p></Section>
          <Separator className="bg-slate-100" />
          <Section icon={Sparkles} title="Skills"><div className="flex flex-wrap gap-2">{a.skills && a.skills.map((s: string) => <Badge key={s} variant="secondary" className="font-medium text-slate-700 bg-slate-100 hover:bg-slate-200">{s}</Badge>)}</div></Section>
        </div>

        <DialogFooter className="mt-8 flex-wrap gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <Button variant="outline" onClick={downloadResume} className="bg-white"><Download className="h-4 w-4 mr-1.5" />Download CV</Button>
          <div className="flex-1" />
          <Button variant="outline" onClick={() => { onStatus(a, "Rejected"); onOpenChange(false); }} className="text-red-600 border-red-200 hover:bg-red-50 bg-white"><XCircle className="h-4 w-4 mr-1.5"/> Reject</Button>
          <Button className="bg-saffron text-navy hover:bg-saffron/90 font-semibold" onClick={() => { onStatus(a, "Interview"); onOpenChange(false); }}><Send className="h-4 w-4 mr-1.5" />Send to Live Queue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ApplicantList({ list, onStatus }: { list: any[]; onStatus: (a: any, s: string) => void }) {
  return (
    <div className="grid gap-3 mt-4">
      {list.map((a) => <ApplicantCard key={a.applicationId} a={a} onStatus={onStatus} />)}
      {list.length === 0 && <Card className="p-12 text-center text-muted-foreground border-dashed border-border/60 bg-slate-50">No applications found for this event job.</Card>}
    </div>
  );
}

function ApplicantCard({ a, onStatus }: { a: any; onStatus: (a: any, s: string) => void }) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  
  // Custom Status Badges for Job Fair
  const statusColor: Record<string, string> = { 
    Applied: "bg-slate-100 text-slate-700 border-slate-200", 
    Shortlisted: "bg-amber-100 text-amber-800 border-amber-200", 
    Interview: "bg-blue-100 text-blue-700 border-blue-200", 
    Interviewed: "bg-purple-100 text-purple-700 border-purple-200", 
    Offer: "bg-teal-100 text-teal-800 border-teal-200", 
    Hired: "bg-india-green/15 text-india-green border-india-green/20", 
    Rejected: "bg-red-100 text-red-700 border-red-200" 
  };
  
  return (
    <>
      <Card className="p-5 border-border/60 flex flex-col md:flex-row md:items-center gap-4 hover:border-saffron/60 transition-colors bg-white shadow-sm cursor-pointer group" onClick={() => setOpen(true)}>
        <div className="size-14 rounded-full bg-gradient-to-br from-saffron to-india-green flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-sm border border-slate-100">
          {a.name ? a.name.charAt(0) : "U"}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <p className="font-display font-bold text-lg text-navy group-hover:text-saffron transition-colors">{a.name}</p>
            <Badge className={`border ${statusColor[a.status] || "bg-slate-100 text-slate-700"}`}>
              {a.status === 'Interview' ? 'Waiting in Queue' : a.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground font-medium">{a.qualification} · {a.experience} · {a.location}</p>
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {a.skills && a.skills.slice(0, 4).map((s: string) => <Badge key={s} variant="secondary" className="font-medium text-slate-600 bg-slate-100">{s}</Badge>)}
            {a.skills && a.skills.length > 4 && <Badge variant="secondary" className="bg-slate-100 text-slate-500">+{a.skills.length - 4}</Badge>}
          </div>
        </div>
        
        <div className="text-center shrink-0 hidden lg:block px-6 border-l border-slate-100">
          <div className="flex items-center gap-1.5 text-india-green font-bold text-lg justify-center"><Sparkles className="h-4 w-4" />{a.matchScore}%</div>
          <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">Match</p>
        </div>
        
        {/* DYNAMIC PIPELINE BUTTONS */}
        <div className="flex md:flex-col gap-2 shrink-0 flex-wrap border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4" onClick={(e) => e.stopPropagation()}>
          
          {a.status === "Applied" && (
            <Button size="sm" variant="outline" className="font-semibold text-amber-700 hover:text-amber-800 hover:bg-amber-50 border-amber-200" onClick={() => onStatus(a, "Shortlisted")}>Shortlist</Button>
          )}
          
          {(a.status === "Applied" || a.status === "Shortlisted") && (
            <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700 font-semibold" onClick={() => onStatus(a, "Interview")}><Send className="h-3.5 w-3.5 mr-1.5" /> Send to Queue</Button>
          )}
          
          {a.status === "Interview" && (
            <Button size="sm" variant="outline" disabled className="bg-slate-50 text-slate-500 border-slate-200 cursor-not-allowed font-medium">In Live Queue...</Button>
          )}
          
          {a.status === "Interviewed" && (
            <Button size="sm" className="bg-teal-600 text-white hover:bg-teal-700 font-semibold" onClick={() => onStatus(a, "Offer")}>Make Offer</Button>
          )}
          
          {(a.status === "Offer" || a.status === "Interviewed") && (
             <Button size="sm" className="bg-india-green text-white hover:bg-india-green/90 font-semibold" onClick={() => onStatus(a, "Hired")}><Check className="h-3.5 w-3.5 mr-1.5" />Hire</Button>
          )}

          <Button size="sm" variant="ghost" className="text-slate-500 hover:bg-slate-100" onClick={() => setEditOpen(true)}><Pencil className="h-3.5 w-3.5" /></Button>
        </div>
      </Card>

      <EditStatusDialog a={a} open={editOpen} onOpenChange={setEditOpen} onStatus={onStatus} />
    </>
  );
}

function EditStatusDialog({ a, open, onOpenChange, onStatus }: { a: any; open: boolean; onOpenChange: (o: boolean) => void; onStatus: (a: any, s: string, note: string) => void }) {
  const [status, setStatus] = useState<string>(a.status);
  const [note, setNote] = useState("");
  useEffect(() => { if (open) { setStatus(a.status); setNote(""); } }, [open, a.status]);
  
  // Updated statuses for physical job fair flow
  const options = ["Applied", "Shortlisted", "Interview", "Interviewed", "Offer", "Hired", "Rejected"];

  function update() {
    onStatus(a, status, note);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-navy">Edit Status — {a.name}</DialogTitle>
          <DialogDescription>Manually update this candidate's stage in the hiring process.</DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-2">
          <div>
            <Label className="mb-2 block font-semibold text-navy">New Status Stage</Label>
            <div className="grid grid-cols-2 gap-2">
              {options.map((s) => (
                <button 
                  key={s} 
                  type="button" 
                  onClick={() => setStatus(s)} 
                  className={`border rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
                    status === s 
                      ? "border-saffron bg-saffron text-navy shadow-sm" 
                      : "border-slate-200 bg-white text-slate-600 hover:border-saffron/40 hover:bg-slate-50"
                  }`}
                >
                  {s === 'Interview' ? 'In Queue' : s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="font-semibold text-navy">Private Note (optional)</Label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} className="mt-1.5 w-full min-h-[90px] rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:border-saffron/60 focus:bg-white transition-colors" placeholder="e.g. Candidate answered technical questions well, moving to offer stage." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="font-semibold">Cancel</Button>
          <Button className="bg-saffron text-navy hover:bg-saffron/90 font-bold" onClick={update}>Update Status</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function buildDetail(a: any) {
  const phoneSeed = a.id ? a.id.split("").reduce((s: number, c: string) => s + c.charCodeAt(0), 0) : 123;
  const phone = `+91 9${(80000000 + (phoneSeed % 20000000)).toString().slice(0, 9)}`;
  return {
    uniqueId: a.id, email: a.email, phone: a.phone || phone, district: "Bengaluru", state: "Karnataka", pincode: "560001",
    institution: `Institute of Technology`, yearOfPassing: "2024", percentage: `${70 + (phoneSeed % 25)}%`, specialization: a.qualification.includes("BE") ? "Computer Science" : "General", languages: ["English", "Hindi", "Kannada"],
    certifications: ["NSDC Skill Certificate", "NSQF Level 5"], preferredRoles: ["Software Engineer", "Data Analyst"], preferredLocations: ["Bengaluru", "Mysuru"], preferredJobType: "Full-time", expectedSalary: "₹4 – 6 LPA",
    currentRole: a.experience === "Fresher" ? "—" : "Junior Developer", currentCompany: a.experience === "Fresher" ? "—" : "Previous Employer", resumeFileName: a.resumeFileName,
    about: `${a.name} is a ${a.experience.toLowerCase()} candidate based with a ${a.qualification} qualification. Actively looking for opportunities at Job Fairs.`,
  };
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return <div className="flex items-center gap-2 text-sm"><Icon className="h-4 w-4 text-saffron shrink-0" /><span className="text-slate-500 font-medium">{label}:</span> <span className="font-bold text-navy">{value}</span></div>;
}

function Section({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-navy font-bold text-base">
        <Icon className="h-5 w-5 text-saffron" />
        {title}
      </div>
      <div className="pl-7">{children}</div>
    </div>
  );
}
