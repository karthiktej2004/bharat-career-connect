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
import { Briefcase, MapPin, Search, Sparkles, Loader2, CheckCircle2, FileText, Check } from "lucide-react";
import { getCompanyLogo, getJobImage, getSession } from "@/lib/mockStore";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/candidate/jobs")({
  head: () => ({ meta: [{ title: "Browse Jobs — Candidate" }] }),
  component: Jobs,
});

// =========================================================
// 1. INLINED APPLY JOB DIALOG
// =========================================================
function LiveApplyDialog({ job, onClose }: { job: any; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        const res = await fetch(`https://bcc-backend-0cny.onrender.com/api/candidate/profile/${session.id}`);
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
  }, [job]);

  const submitApplication = async () => {
    setIsSubmitting(true);
    const session = getSession();

    try {
      const res = await fetch("https://bcc-backend-0cny.onrender.com/api/applications/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          candidateId: session?.id,
          employerId: job.employer_id || 1,
        }),
      });

      const json = await res.json();

      if (json.success) {
        toast.success(json.message || "Application submitted successfully!");
        onClose();
      } else {
        toast.error(json.message || "Failed to apply.");
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
            <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {job.company}</span>
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>
            <span className="bg-white border px-2 py-0.5 rounded-full text-xs text-navy font-medium">{job.type}</span>
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
                <div className="border border-border p-4 rounded-xl bg-slate-50 flex items-start gap-4 mt-4">
                  <div className="p-3 bg-white rounded-lg border shadow-sm text-saffron"><FileText className="h-6 w-6" /></div>
                  <div>
                    <p className="font-bold text-navy">{profile?.resumeFileName || "Generated_Profile_Resume.pdf"}</p>
                    <p className="text-xs text-muted-foreground mt-1">Uses your registered profile details and documents.</p>
                  </div>
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
                    <span className="text-sm font-medium text-navy">AI matched your skills to this role.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-india-green" />
                    <span className="text-sm font-medium text-navy">Your location matches the job requirements.</span>
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
// 2. THE BROWSE JOBS PAGE
// =========================================================
function Jobs() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [applying, setApplying] = useState<any | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // FETCH JOBS SAFELY FROM POSTGRESQL BACKEND
  useEffect(() => {
    async function fetchMatchedJobs() {
      setIsLoading(true);
      const session = getSession();
      const activeId = session?.id || "guest";

      try {
        const res = await fetch(`https://bcc-backend-0cny.onrender.com/api/candidate/${activeId}/jobs`);
        const json = await res.json();

        if (json.success && Array.isArray(json.data)) {
          setJobs(json.data);
        } else {
          toast.error("Failed to load jobs.");
        }
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
        toast.error("Network error fetching jobs.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchMatchedJobs();
  }, []);

  const filtered = useMemo(() => jobs.filter((j) => {
    if (type !== "all" && j.type !== type) return false;
    const searchString = `${j.title || ""} ${j.company || ""} ${(j.skills || []).join(" ")}`.toLowerCase();
    if (q && !searchString.includes(q.toLowerCase())) return false;
    return true;
  }), [q, type, jobs]);

  return (
    <DashShell role="candidate" nav={candidateNav}>
      <PageHeader title="Browse Jobs" description="AI-matched roles based on your profile, skills and location." />

      <Card className="p-4 mb-6 flex flex-col md:flex-row gap-3 border-border/60 bg-white">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by title, company or skill…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="md:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Full-time">Full-time</SelectItem>
            <SelectItem value="Internship">Internship</SelectItem>
            <SelectItem value="Apprenticeship">Apprenticeship</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-navy">
          <Loader2 className="h-10 w-10 animate-spin text-saffron mb-4" />
          <p className="font-medium text-lg">Fetching live job postings...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="text-lg font-medium text-navy">No matching jobs found</p>
          <p className="text-sm">Try adjusting your search filters.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((j) => (
            <Card key={j.id} className="overflow-hidden card-hover border-border/60 bg-white">
              <div className="flex gap-4 flex-wrap md:flex-nowrap">
                <div className="relative h-32 w-full md:h-auto md:w-40 shrink-0 bg-slate-100">
                  <img src={getJobImage(j) || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=300&h=300"} alt={j.title} className="h-full w-full object-cover" loading="lazy" />
                  <div className="absolute bottom-2 left-2 h-9 w-9 rounded-md bg-white border border-white/70 flex items-center justify-center overflow-hidden shadow">
                    {getCompanyLogo(j.company) ? (
                      <img src={getCompanyLogo(j.company)} alt={`${j.company} logo`} className="h-full w-full object-contain p-0.5" loading="lazy" onError={(e) => { (e.currentTarget.style.display = "none"); }} />
                    ) : (
                      <Briefcase className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0 p-5 md:pl-0 flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display font-bold text-navy text-lg">{j.title}</h3>
                      <Badge variant="outline" className="bg-slate-50">{j.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-3">
                      <Briefcase className="h-4 w-4" />{j.company} 
                      <MapPin className="h-4 w-4 ml-2" />{j.location}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {(j.skills || []).map((s: string) => <span key={s} className="text-xs bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded">{s}</span>)}
                    </div>

                    <p className="text-xs text-muted-foreground mt-3 font-medium">
                      {j.qualification || "Any Degree"} · {j.experience || "Fresher"} · {j.salary || "Not specified"}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="size-16 rounded-full bg-gradient-to-br from-india-green/10 to-saffron/10 border border-india-green/20 flex flex-col items-center justify-center mx-auto md:ml-auto">
                      <Sparkles className="h-3 w-3 text-india-green mb-0.5" />
                      <p className="font-display font-bold text-navy text-sm">{j.matchScore}%</p>
                    </div>
                    <Button size="sm" className="mt-3 bg-navy text-white hover:bg-navy/90 w-full" onClick={() => setApplying(j)}>Apply</Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <LiveApplyDialog job={applying} onClose={() => setApplying(null)} />
    </DashShell>
  );
}
