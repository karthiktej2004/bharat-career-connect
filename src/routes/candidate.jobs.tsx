import { createFileRoute } from "@tanstack/react-router";
import { DashShell, PageHeader } from "@/components/DashShell";
import { candidateNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Briefcase, MapPin, Search, Sparkles, Loader2, CheckCircle2, FileText, Check, Bookmark, Building2, Clock, Banknote, ListChecks, XCircle, CalendarDays } from "lucide-react";
import { getCompanyLogo, getJobImage, getSession } from "@/lib/mockStore";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/candidate/jobs")({
  head: () => ({ meta: [{ title: "Browse Jobs — Candidate" }] }),
  component: Jobs,
});

const LOCATIONS = ["Bengaluru", "Hyderabad", "Chennai", "Mumbai", "Delhi", "Kolkata", "Vizag", "Kochi", "Pune"];
const JOB_TYPES = ["Trainee", "Intern", "Apprentice", "Full-Time", "Part-Time", "Contractor", "Freelancer", "Volunteer", "Consultant", "Vendor"];
const SHIFTS = ["Day Shift", "Night shift", "Remote", "Hybrid", "On-Site", "Rotational"];

// =========================================================
// 1. INLINED APPLY JOB DIALOG
// =========================================================
function LiveApplyDialog({ job, onClose, onSuccess }: { job: any; onClose: () => void; onSuccess: (id: number) => void }) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newResume, setNewResume] = useState<File | null>(null);

  useEffect(() => {
    if (!job) return;

    async function fetchRealProfile() {
      setIsLoading(true);
      const session = getSession();

      if (!session || !session.id) {
        toast.error("Please log in to apply.");
        onClose();
        return;
      }

      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://15.207.249.155:5000"}/api/candidate/profile/${session.id}`);
        const json = await res.json();

        if (json.success) {
          setProfile(json.data);
        } else {
          toast.error("Failed to load profile details.");
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        toast.error("Database connection failed.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchRealProfile();
    setStep(1);
    setNewResume(null);
  }, [job]);

  const submitApplication = async () => {
    setIsSubmitting(true);
    const session = getSession();

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://15.207.249.155:5000"}/api/applications/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          candidateId: session?.id,
          employerId: job.employer_id || 1,
          resumeReplaced: !!newResume, 
          newResumeName: newResume ? newResume.name : undefined
        }),
      });

      const json = await res.json();

      if (json.success) {
        alert("🎉 Application submitted successfully!");
        toast.success("Successfully applied!");
        onSuccess(job.id);
        onClose();
      } else {
        toast.error(json.message || "You have already applied for this job.");
        onSuccess(job.id); 
        onClose();
      }
    } catch (err) {
      console.error("Apply error:", err);
      toast.error("Server connection failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!job) return null;

  return (
    <Dialog open={!!job} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-white p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-slate-50/50">
          <DialogTitle className="text-xl font-display font-bold text-navy flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-saffron" /> Apply for {job.title}
          </DialogTitle>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
            <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {job.company || job.company_name}</span>
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>
            <span className="bg-white border px-2 py-0.5 rounded-full text-xs text-navy font-medium">{job.type || job.job_type || "Full-Time"}</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-navy">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-saffron" />
            <p>Loading your profile details securely from database...</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center justify-between mb-8 relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-100 -z-10"></div>
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center bg-white px-2">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                    step === s ? "border-saffron bg-saffron text-white" :
                    step > s ? "border-india-green bg-india-green text-white" :
                    "border-slate-200 bg-white text-slate-400"
                  }`}>
                    {step > s ? <Check className="h-4 w-4" /> : s}
                  </div>
                  <span className={`ml-2 text-sm hidden sm:block ${step === s ? "font-bold text-navy" : "font-medium text-slate-500"}`}>
                    {s === 1 ? "Contact" : s === 2 ? "Resume" : s === 3 ? "Screening" : "Review"}
                  </span>
                </div>
              ))}
            </div>

            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h3 className="text-lg font-bold text-navy flex items-center gap-2">Contact information</h3>
                  <p className="text-sm text-muted-foreground">Verify how the employer will reach you.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label>Full name</Label>
                    <Input disabled value={profile?.fullName || ""} className="mt-1 bg-slate-50 font-medium text-navy" />
                  </div>
                  <div>
                    <Label>Email address</Label>
                    <Input disabled value={profile?.email || ""} className="mt-1 bg-slate-50 font-medium text-navy" />
                  </div>
                  <div>
                    <Label>Phone number</Label>
                    <Input disabled value={profile?.phone || ""} className="mt-1 bg-slate-50 font-medium text-navy" />
                  </div>
                  <div>
                    <Label>Current location</Label>
                    <Input disabled value={`${profile?.district || ""}, ${profile?.state || ""}`} className="mt-1 bg-slate-50 font-medium text-navy" />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-bold text-navy">Resume / CV</h3>
                <p className="text-sm text-muted-foreground">Your resume will be securely attached to this application.</p>
                
                <div className="border border-border p-4 rounded-xl bg-slate-50 flex items-start justify-between gap-4 mt-4">
                  <div className="flex gap-4">
                    <div className="p-3 bg-white rounded-lg border shadow-sm text-saffron shrink-0">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-navy truncate max-w-[200px] sm:max-w-[300px]">
                        {newResume?.name || profile?.resumeFileName || "Generated_Profile_Resume.pdf"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {newResume ? "Custom resume attached for this job." : "Uses your registered profile details and documents."}
                      </p>
                    </div>
                  </div>
                  <Label className="cursor-pointer shrink-0 border border-border bg-white hover:bg-slate-100 text-navy px-3 py-1.5 rounded-md text-xs font-medium transition-colors">
                    Change Resume
                    <input 
                      type="file" 
                      accept=".pdf,.doc,.docx" 
                      className="hidden" 
                      onChange={(e) => {
                        if(e.target.files?.[0]) {
                          setNewResume(e.target.files[0]);
                          toast.success("Resume updated for this application.");
                        }
                      }} 
                    />
                  </Label>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-bold text-navy">Employer Screening</h3>
                <p className="text-sm text-muted-foreground">Quick check before submission.</p>
                <div className="bg-india-green/5 border border-india-green/20 p-4 rounded-xl mt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-india-green" />
                    <span className="text-sm font-medium text-navy">System evaluated matching criteria mathematically.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-india-green" />
                    <span className="text-sm font-medium text-navy">Profile requirements checked.</span>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 text-center py-6">
                <h3 className="text-2xl font-display font-bold text-navy">Ready to apply!</h3>
                <p className="text-muted-foreground">Submit your application directly to the employer.</p>
              </div>
            )}

            <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
              {step > 1 ? (
                <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>
              ) : (
                <Button variant="outline" onClick={onClose}>Cancel</Button>
              )}

              {step < 4 ? (
                <Button className="bg-saffron text-navy hover:bg-saffron/90 font-bold px-8" onClick={() => setStep(step + 1)}>
                  Continue
                </Button>
              ) : (
                <Button className="bg-india-green text-white hover:bg-india-green/90 font-bold px-8" disabled={isSubmitting} onClick={submitApplication}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// =========================================================
// 2. JOB DETAILS DIALOG
// =========================================================
function JobDetailsDialog({ job, onClose, onApply, onWithdraw }: { job: any; onClose: () => void; onApply: () => void; onWithdraw: (id: number) => void }) {
  if (!job) return null;

  const isApplied = job.hasApplied || job.has_applied || job.application_status?.toLowerCase() === "applied";

  return (
    <Dialog open={!!job} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col bg-white p-0 overflow-hidden">
        <DialogTitle className="sr-only">Job Details for {job.title}</DialogTitle>
        
        {/* Header Action Bar */}
        <div className="px-6 py-3 border-b flex justify-between items-center bg-slate-50 sticky top-0 z-10 shadow-sm">
          <Badge className="bg-saffron text-navy hover:bg-saffron">{job.type || job.job_type || "Full-Time"}</Badge>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
            
            {isApplied ? (
              <>
                <Button variant="destructive" size="sm" onClick={() => onWithdraw(job.id)}>Withdraw Application</Button>
                <Button size="sm" disabled className="bg-slate-100 text-slate-500 cursor-not-allowed">Applied</Button>
              </>
            ) : (
              <Button 
                size="sm"
                className="bg-navy text-white hover:bg-navy/90"
                onClick={(e) => { e.stopPropagation(); onApply(); }}
              >
                Apply Now
              </Button>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 relative">
          <div className="flex gap-6 items-start flex-col md:flex-row">
            <div className="h-24 w-24 shrink-0 border rounded-lg overflow-hidden bg-white shadow-sm flex items-center justify-center">
              {getCompanyLogo(job.company || job.company_name) ? (
                <img src={getCompanyLogo(job.company || job.company_name)} alt={job.company || job.company_name} className="h-full w-full object-contain p-2" />
              ) : (
                <Building2 className="h-10 w-10 text-slate-300" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-navy">{job.title}</h1>
              <p className="text-lg text-muted-foreground font-medium mt-1">{job.company || job.company_name} {job.recruiter ? `· Recruiter: ${job.recruiter}` : ""}</p>
              
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-600">
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-saffron" /> {job.location}</span>
                <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-saffron" /> {job.experience || "Fresher"}</span>
                <span className="flex items-center gap-1.5"><Banknote className="h-4 w-4 text-saffron" /> {job.salary || "Not specified"}</span>
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-saffron" /> {job.preferredShift || job.preferred_shift || job.shift || "Day Shift"}</span>
              </div>
            </div>
          </div>

          {/* 🚨 STRICT EVENT BANNER 🚨 */}
          {job.event_name && (
            <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-start gap-3 shadow-sm">
              <CalendarDays className="h-6 w-6 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-base font-bold text-indigo-900">Udyoga Mela Event: {job.event_name}</p>
                <p className="text-sm text-indigo-700 mt-1">
                  This job is exclusively available through this specific event. Applications will be processed by the employer at the venue and will close automatically when the event concludes.
                </p>
              </div>
            </div>
          )}

          <div className="mt-8 grid gap-8">
            <section>
              <h2 className="text-xl font-bold text-navy mb-4 border-b pb-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-saffron" /> Requirements & Skills
              </h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {(job.skills || []).map((s: string) => (
                  <Badge key={s} variant="outline" className="bg-slate-50 px-3 py-1 text-sm border-slate-200 text-slate-700">{s}</Badge>
                ))}
                {(!job.skills || job.skills.length === 0) && <span className="text-muted-foreground text-sm">Not specifically listed</span>}
              </div>
              {job.qualification && (
                <p className="text-slate-700 text-sm"><strong className="text-navy">Education:</strong> {job.qualification}</p>
              )}
            </section>

            <section>
              <h2 className="text-xl font-bold text-navy mb-4 border-b pb-2 flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-saffron" /> Job Description, Responsibilities & Benefits
              </h2>
              <div className="prose prose-sm max-w-none text-slate-700">
                {job.description && (
                  <div className="mb-6">
                    <h3 className="font-bold text-navy text-base mb-2">About the Role</h3>
                    <div className="whitespace-pre-wrap">{job.description}</div>
                  </div>
                )}
                
                {job.responsibilities && (
                  <div className="mb-6">
                    <h3 className="font-bold text-navy text-base mb-2">Key Responsibilities</h3>
                    <div className="whitespace-pre-wrap">{job.responsibilities}</div>
                  </div>
                )}

                {job.benefits && (
                  <div className="mb-6">
                    <h3 className="font-bold text-navy text-base mb-2">Benefits & Perks</h3>
                    <div className="whitespace-pre-wrap">{job.benefits}</div>
                  </div>
                )}

                {!job.description && !job.responsibilities && !job.benefits && (
                  <p className="italic text-muted-foreground">Detailed job description, responsibilities, and benefits have not been provided by the employer for this role yet. Please apply or contact the employer for more information.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// =========================================================
// 3. THE BROWSE JOBS PAGE
// =========================================================
function Jobs() {
  const [q, setQ] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [shiftFilter, setShiftFilter] = useState("all");
  
  const [applying, setApplying] = useState<any | null>(null);
  const [viewingJob, setViewingJob] = useState<any | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://15.207.249.155:5000";

  useEffect(() => {
    async function fetchMatchedJobs() {
      setIsLoading(true);
      const session = getSession();
      const activeId = session?.id || "guest";

      try {
        const res = await fetch(`${baseUrl}/api/candidate/${activeId}/jobs`);
        
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            toast.error("Server connection error.");
            setIsLoading(false);
            return;
        }

        const json = await res.json();

        if (json.success && Array.isArray(json.data)) {
          setJobs(json.data);
        } else {
          toast.error("Failed to load jobs.");
        }
      } catch (err) {
        toast.error("Network error fetching jobs.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchMatchedJobs();
  }, []);

  const handleToggleSave = async (jobId: number) => {
    const session = getSession();
    if (!session?.id) return toast.error("Please log in to save jobs.");

    setSavingId(jobId);
    try {
      const res = await fetch(`${baseUrl}/api/candidate/saved-jobs/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: session.id, jobId }),
      });
      const json = await res.json();

      if (json.success) {
        toast.success(json.message);
        setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, isSaved: json.saved } : j)));
      }
    } catch (err) {
      toast.error("Network error updating saved job.");
    } finally {
      setSavingId(null);
    }
  };

  const handleWithdraw = async (jobId: number) => {
    const session = getSession();
    if (!session?.id) return;
    
    try {
      const res = await fetch(`${baseUrl}/api/candidate/${session.id}/jobs/${jobId}/withdraw`, {
        method: "POST"
      });
      const json = await res.json();

      if (json.success) {
        toast.success("Application successfully withdrawn.");
        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, hasApplied: false, has_applied: false, status: 'Open', application_status: null } : j));
        if (viewingJob && viewingJob.id === jobId) {
          setViewingJob((prev: any) => ({ ...prev, hasApplied: false, has_applied: false, status: 'Open', application_status: null }));
        }
      }
    } catch (err) {
      toast.error("Network error withdrawing application.");
    }
  };

  const handleApplySuccess = (jobId: number) => {
    setJobs((prev) => 
      prev.map(j => j.id === jobId ? { ...j, hasApplied: true, has_applied: true, status: 'Applied', application_status: 'Applied' } : j)
    );
    if (viewingJob && viewingJob.id === jobId) {
      setViewingJob((prev: any) => ({ ...prev, hasApplied: true, has_applied: true, status: 'Applied', application_status: 'Applied' }));
    }
  };

  const resetFilters = () => {
    setQ(""); setLocationFilter("all"); setTypeFilter("all"); setShiftFilter("all");
  };

  const filterCounts = useMemo(() => {
    const locs: Record<string, number> = {};
    LOCATIONS.forEach(l => locs[l.toLowerCase()] = 0);
    jobs.forEach(j => {
      if (j.location) {
        const jLocs = j.location.split(",").map((l: string) => l.trim().toLowerCase());
        jLocs.forEach((l: string) => {
          let key = l;
          if (["bangalore", "bengalore", "bengaluru"].includes(l)) key = "bengaluru";
          if (["hyderabd", "hyderabad"].includes(l)) key = "hyderabad";
          locs[key] = (locs[key] || 0) + 1;
        });
      }
    });
    return { locs };
  }, [jobs]);

  // =========================================================
  // STRICT FILTERING LOGIC
  // =========================================================
  const filtered = useMemo(() => jobs.filter((j) => {
    
    // 🚨 1. STRICT EVENT REQUIREMENT: Job MUST be tied to an event
    if (!j.event_id && !j.event_name) {
      return false;
    }

    const evStatus = (j.event_status || "").toLowerCase().trim();
    const jbStatus = (j.job_status || j.status || "").toLowerCase().trim();

    // 🚨 2. EVENT LIFECYCLE ENFORCEMENT: Event MUST be explicitly Live or Upcoming
    if (!["live", "upcoming"].includes(evStatus)) {
      return false;
    }

    // 🚨 3. JOB STATUS ENFORCEMENT: Job MUST be approved and open
    if (["closed", "inactive", "filled", "expired", "disabled", "deleted", "pending", "rejected"].includes(jbStatus)) {
      return false;
    }

    // --- User Selected Filters ---
    if (locationFilter !== "all") {
      const rawLoc = (j.location || "").toLowerCase();
      let matches = false;
      const target = locationFilter.toLowerCase();
      
      if (target === "bengaluru" && (rawLoc.includes("bangalore") || rawLoc.includes("bengaluru") || rawLoc.includes("bengalore"))) matches = true;
      else if (target === "hyderabad" && (rawLoc.includes("hyderabd") || rawLoc.includes("hyderabad"))) matches = true;
      else if (rawLoc.includes(target)) matches = true;
      
      if (!matches) return false;
    }
    
    if (typeFilter !== "all") {
      const jt = (j.type || j.job_type || j.employmentType || "Full-Time").toLowerCase().replace(/[- ]/g, "");
      if (!jt.includes(typeFilter)) return false;
    }
    
    if (shiftFilter !== "all") {
      const shift = (j.preferredShift || j.preferred_shift || j.shift || "Day Shift").toLowerCase().replace(/[- ]/g, "");
      if (!shift.includes(shiftFilter)) return false;
    }
    
    if (q) {
      const searchString = `${j.title || ""} ${j.company || ""} ${j.company_name || ""} ${j.event_name || ""} ${(j.skills || []).join(" ")}`.toLowerCase();
      if (!searchString.includes(q.toLowerCase())) return false;
    }
    
    return true;
  }), [q, locationFilter, typeFilter, shiftFilter, jobs]);

  return (
    <DashShell role="candidate" nav={candidateNav}>
      <PageHeader title="Browse Event Jobs" description="Explore jobs from active and upcoming Udyoga Mela events." />

      <Card className="p-4 mb-6 border-border/60 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
          <div className="relative md:col-span-4 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search by title, company, event..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger><SelectValue placeholder="Location" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {LOCATIONS.map(loc => {
                const count = filterCounts.locs[loc.toLowerCase()] || 0;
                return <SelectItem key={loc} value={loc.toLowerCase()}>{loc} {count >= 0 ? `(${count})` : ""}</SelectItem>;
              })}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger><SelectValue placeholder="Job Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {JOB_TYPES.map(type => <SelectItem key={type} value={type.toLowerCase().replace(/[- ]/g, "")}>{type}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={shiftFilter} onValueChange={setShiftFilter}>
            <SelectTrigger><SelectValue placeholder="Preferred Shift" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Shifts</SelectItem>
              {SHIFTS.map(shift => <SelectItem key={shift} value={shift.toLowerCase().replace(/[- ]/g, "")}>{shift}</SelectItem>)}
            </SelectContent>
          </Select>

          {(q !== "" || locationFilter !== "all" || typeFilter !== "all" || shiftFilter !== "all") && (
            <div className="md:col-span-4 flex justify-end">
              <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground hover:text-navy h-8 px-2 flex items-center gap-1.5">
                <XCircle className="h-4 w-4" /> Clear Filters
              </Button>
            </div>
          )}
        </div>
      </Card>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-navy">
          <Loader2 className="h-10 w-10 animate-spin text-saffron mb-4" />
          <p className="font-medium text-lg">Fetching live job postings...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="text-lg font-medium text-navy">No active event jobs found</p>
          <p className="text-sm mt-1">Jobs will appear here when an event is marked Live or Upcoming.</p>
          {(q !== "" || locationFilter !== "all" || typeFilter !== "all" || shiftFilter !== "all") && (
            <Button variant="link" onClick={resetFilters} className="text-saffron mt-2">Clear search filters</Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((j) => {
            const isApplied = j.hasApplied || j.has_applied || j.application_status?.toLowerCase() === "applied";

            return (
              <Card 
                key={j.id} 
                className="overflow-hidden card-hover border-border/60 bg-white cursor-pointer transition-shadow hover:shadow-md relative"
                onClick={() => setViewingJob(j)}
              >
                <div className="flex gap-4 flex-wrap md:flex-nowrap">
                  <div className="relative h-32 w-full md:h-auto md:w-40 shrink-0 bg-slate-100">
                    <img src={getJobImage(j) || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=300&h=300"} alt={j.title} className="h-full w-full object-cover" loading="lazy" />
                    <div className="absolute bottom-2 left-2 h-9 w-9 rounded-md bg-white border border-white/70 flex items-center justify-center overflow-hidden shadow">
                      {getCompanyLogo(j.company || j.company_name) ? (
                        <img src={getCompanyLogo(j.company || j.company_name)} alt={`${j.company || j.company_name} logo`} className="h-full w-full object-contain p-0.5" loading="lazy" onError={(e) => { (e.currentTarget.style.display = "none"); }} />
                      ) : (
                        <Briefcase className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 p-5 md:pl-0 flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-display font-bold text-navy text-lg group-hover:text-saffron transition-colors">{j.title}</h3>
                        <Badge variant="outline" className="bg-slate-50">{j.type || j.job_type || "Full-Time"}</Badge>
                        {j.event_name && (
                           <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 gap-1.5 rounded-sm"><CalendarDays className="h-3 w-3"/> Event: {j.event_name}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-3">
                        <span className="flex items-center"><Briefcase className="h-4 w-4 mr-1" />{j.company || j.company_name}</span>
                        <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" />{j.location}</span>
                      </p>

                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {(j.skills || []).map((s: string) => <span key={s} className="text-xs bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded">{s}</span>)}
                      </div>

                      <p className="text-xs text-muted-foreground mt-3 font-medium">
                        {j.qualification || "Any Degree"} · {j.experience || "Fresher"} · {j.salary || "Not specified"}
                      </p>
                    </div>

                    <div className="text-right shrink-0 flex flex-col items-end">
                      <div className="flex items-center gap-2 mb-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`size-9 rounded-full border border-border/60 hover:bg-saffron/10 ${j.isSaved ? "text-saffron bg-saffron/5" : "text-muted-foreground"}`}
                          title={j.isSaved ? "Saved Job" : "Save Job"}
                          disabled={savingId === j.id}
                          onClick={(e) => { e.stopPropagation(); handleToggleSave(j.id); }}
                        >
                          {savingId === j.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Bookmark className={`h-4 w-4 ${j.isSaved ? "fill-saffron text-saffron" : ""}`} />
                          )}
                        </Button>
                        
                        <div className="size-14 rounded-full bg-gradient-to-br from-india-green/10 to-saffron/10 border border-india-green/20 flex flex-col items-center justify-center" title="Match Score based on Skills, Location, Job Type, & Education">
                          <ListChecks className="h-2.5 w-2.5 text-india-green mb-0.5" />
                          <p className="font-display font-bold text-navy text-xs">{j.matchScore || 50}%</p>
                        </div>
                      </div>

                      <Button 
                        size="sm" 
                        className={`mt-1 w-full ${isApplied ? "bg-slate-100 text-slate-500 hover:bg-slate-100 cursor-not-allowed" : "bg-navy text-white hover:bg-navy/90"}`} 
                        disabled={isApplied}
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          if (!isApplied) setApplying(j); 
                        }}
                      >
                        {isApplied ? "Applied" : "Apply"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <LiveApplyDialog job={applying} onClose={() => setApplying(null)} onSuccess={handleApplySuccess} />
      
      <JobDetailsDialog 
        job={viewingJob} 
        onClose={() => setViewingJob(null)} 
        onApply={() => { setApplying(viewingJob); }} 
        onWithdraw={handleWithdraw}
      />
    </DashShell>
  );
}
