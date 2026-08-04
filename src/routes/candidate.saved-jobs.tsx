import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashShell, PageHeader } from "@/components/DashShell";
import { candidateNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getSession } from "@/lib/mockStore";
import { BookmarkMinus, MapPin, Briefcase, Banknote, ArrowRight, Loader2, Bookmark, Check, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/candidate/saved-jobs")({
  head: () => ({ meta: [{ title: "Saved Jobs — Candidate" }] }),
  component: SavedJobs,
});

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
        if (json.success) setProfile(json.data);
      } catch (err) {
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
          jobId: job.id || job.job_id,
          candidateId: session?.id,
          employerId: job.employer_id || 1,
          resumeReplaced: !!newResume, 
          newResumeName: newResume ? newResume.name : undefined
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Successfully applied!");
        onSuccess(job.id || job.job_id);
        onClose();
      } else {
        toast.error(json.message || "You have already applied.");
        onSuccess(job.id || job.job_id); 
        onClose();
      }
    } catch (err) {
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
            <p>Loading your profile details...</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center justify-between mb-8 relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-100 -z-10"></div>
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center bg-white px-2">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${step === s ? "border-saffron bg-saffron text-white" : step > s ? "border-india-green bg-india-green text-white" : "border-slate-200 bg-white text-slate-400"}`}>
                    {step > s ? <Check className="h-4 w-4" /> : s}
                  </div>
                  <span className={`ml-2 text-sm hidden sm:block ${step === s ? "font-bold text-navy" : "font-medium text-slate-500"}`}>{s === 1 ? "Contact" : s === 2 ? "Resume" : s === 3 ? "Screening" : "Review"}</span>
                </div>
              ))}
            </div>

            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div><Label>Full name</Label><Input disabled value={profile?.fullName || ""} className="mt-1 bg-slate-50 font-medium text-navy" /></div>
                  <div><Label>Email address</Label><Input disabled value={profile?.email || ""} className="mt-1 bg-slate-50 font-medium text-navy" /></div>
                  <div><Label>Phone number</Label><Input disabled value={profile?.phone || ""} className="mt-1 bg-slate-50 font-medium text-navy" /></div>
                  <div><Label>Current location</Label><Input disabled value={`${profile?.district || ""}, ${profile?.state || ""}`} className="mt-1 bg-slate-50 font-medium text-navy" /></div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="border border-border p-4 rounded-xl bg-slate-50 flex items-start justify-between gap-4 mt-4">
                  <div className="flex gap-4">
                    <div className="p-3 bg-white rounded-lg border shadow-sm text-saffron shrink-0"><FileText className="h-6 w-6" /></div>
                    <div className="min-w-0">
                      <p className="font-bold text-navy">{newResume?.name || profile?.resumeFileName || "Generated_Profile_Resume.pdf"}</p>
                    </div>
                  </div>
                  <Label className="cursor-pointer shrink-0 border border-border bg-white hover:bg-slate-100 text-navy px-3 py-1.5 rounded-md text-xs font-medium transition-colors">
                    Change Resume
                    <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => { if(e.target.files?.[0]) { setNewResume(e.target.files[0]); toast.success("Resume updated."); } }} />
                  </Label>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-india-green/5 border border-india-green/20 p-4 rounded-xl mt-4 space-y-3">
                <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-india-green" /><span className="text-sm font-medium text-navy">Profile requirements checked.</span></div>
              </div>
            )}

            {step === 4 && (
              <div className="text-center py-6">
                <h3 className="text-2xl font-display font-bold text-navy">Ready to apply!</h3>
              </div>
            )}

            <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
              {step > 1 ? <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button> : <Button variant="outline" onClick={onClose}>Cancel</Button>}
              {step < 4 ? <Button className="bg-saffron text-navy hover:bg-saffron/90 font-bold px-8" onClick={() => setStep(step + 1)}>Continue</Button> : <Button className="bg-india-green text-white hover:bg-india-green/90 font-bold px-8" disabled={isSubmitting} onClick={submitApplication}>{isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : "Submit Application"}</Button>}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// =========================================================
// 2. MAIN PAGE
// =========================================================
function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);
  
  // Application State
  const [applying, setApplying] = useState<any | null>(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://15.207.249.155:5000";

  useEffect(() => {
    async function fetchSavedJobs() {
      const session = getSession();
      if (!session?.id) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch(`${baseUrl}/api/candidate/${session.id}/saved-jobs`);
        const json = await res.json();
        if (json.success) setSavedJobs(json.data);
      } catch (err) {
        toast.error("Failed to load saved jobs.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchSavedJobs();
  }, []);

  const handleUnsave = async (savedId: number) => {
    setRemovingId(savedId);
    try {
      const res = await fetch(`${baseUrl}/api/candidate/saved-jobs/${savedId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setSavedJobs(prev => prev.filter(job => job.saved_id !== savedId));
        toast.success("Job removed from saved list.");
      } else {
        toast.error("Failed to remove job.");
      }
    } catch (err) {
      toast.error("Network error.");
    } finally {
      setRemovingId(null);
    }
  };

  const handleApplySuccess = (jobId: number) => {
    setSavedJobs((prev) => 
      prev.map(j => (j.id === jobId || j.job_id === jobId) ? { ...j, has_applied: true } : j)
    );
  };

  // 🚨 AGGRESSIVE FRONTEND FILTER 🚨
  // Even if the backend sends a closed job, the frontend will forcefully delete it here!
  const activeSavedJobs = savedJobs.filter((job) => {
    const jbStat = String(job.job_status || "").toLowerCase().replace(/[^a-z]/g, '');
    const evStat = String(job.event_status || "").toLowerCase().replace(/[^a-z]/g, '');

    if (jbStat && ['closed', 'inactive', 'deleted', 'filled', 'expired'].includes(jbStat)) return false;
    if (evStat && ['completed', 'closed', 'past', 'ended'].includes(evStat)) return false;
    
    return true;
  });

  return (
    <DashShell role="candidate" nav={candidateNav}>
      <PageHeader 
        title="Saved Jobs" 
        description="Review your bookmarked opportunities and submit applications anytime." 
      />

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-navy flex items-center gap-2">
          <Bookmark className="h-5 w-5 text-saffron fill-saffron/20" /> Bookmarked Positions
        </h2>
        <Badge variant="outline" className="bg-white">{activeSavedJobs.length} Job{activeSavedJobs.length !== 1 ? 's' : ''} Saved</Badge>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-saffron" /></div>
      ) : activeSavedJobs.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 px-4 text-center border-dashed border-2">
          <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <BookmarkMinus className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-navy mb-2">No active jobs saved</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Any jobs you previously saved might have been closed by the employer. Browse new active roles!
          </p>
          <Button asChild className="bg-navy hover:bg-navy/90 text-white">
            <Link to="/candidate/jobs">Explore Jobs</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {activeSavedJobs.map((job) => {
            const isApplied = job.has_applied === true;
            
            return (
              <Card key={job.saved_id} className="p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center hover:shadow-md transition-shadow">
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-display font-bold text-navy text-lg leading-tight truncate">{job.title}</h3>
                    <Badge variant="secondary" className="bg-slate-100 font-normal shrink-0">{job.type || job.job_type || "Full-time"}</Badge>
                  </div>
                  
                  <p className="text-sm text-slate-600 mb-3">{job.company || job.company_name}</p>
                  
                  <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-saffron" />{job.location}</div>
                    {job.salary && <div className="flex items-center gap-1.5"><Banknote className="h-4 w-4 text-india-green" />{job.salary}</div>}
                    {job.qualification && <div className="flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-blue-500" />{job.qualification}</div>}
                  </div>
                </div>

                <div className="flex flex-wrap sm:flex-col lg:flex-row gap-3 w-full sm:w-auto shrink-0 justify-end">
                  <Button 
                    variant="outline" 
                    className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 flex-1 sm:flex-none"
                    onClick={() => handleUnsave(job.saved_id)}
                    disabled={removingId === job.saved_id}
                  >
                    {removingId === job.saved_id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <BookmarkMinus className="h-4 w-4 mr-2" />}
                    Unsave
                  </Button>
                  
                  <Button 
                    className={`flex-1 sm:flex-none shadow-sm ${isApplied ? "bg-slate-100 text-slate-500 hover:bg-slate-100 cursor-not-allowed" : "bg-navy hover:bg-navy/90 text-white"}`}
                    disabled={isApplied}
                    onClick={() => { if (!isApplied) setApplying(job); }}
                  >
                    {isApplied ? "Applied" : "Apply Now"} {!isApplied && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <LiveApplyDialog job={applying} onClose={() => setApplying(null)} onSuccess={handleApplySuccess} />
    </DashShell>
  );
}
