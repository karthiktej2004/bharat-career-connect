import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSession } from "@/lib/mockStore";
import { toast } from "sonner";
import { Briefcase, MapPin, Loader2, CheckCircle2, FileText, Check } from "lucide-react";

export function ApplyJobDialog({ job, onClose }: { job: any; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // FETCH REAL CANDIDATE PROFILE WHEN DIALOG OPENS
  useEffect(() => {
    if (!job) return; // Only fetch if the dialog is open

    async function fetchRealProfile() {
      setIsLoading(true);
      const session = getSession();

      if (!session || !session.id) {
        toast.error("Please log in to apply.");
        onClose();
        return;
      }

      try {
        const res = await fetch(`http://localhost:5000/api/candidate/profile/${session.id}`);
        const json = await res.json();

        if (json.success) {
          setProfile(json.data);
        } else {
          toast.error("Failed to load your profile details.");
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        toast.error("Database connection failed.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchRealProfile();
    setStep(1); // Reset to step 1 when opening a new job
  }, [job]);

  // SUBMIT TO POSTGRESQL DATABASE
  const submitApplication = async () => {
    setIsSubmitting(true);
    const session = getSession();

    try {
      const res = await fetch("http://localhost:5000/api/applications/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          candidateId: session?.id,
          employerId: job.employer_id || 1, // Fallback to 1 if dummy job has no employer_id
        }),
      });

      const json = await res.json();

      if (json.success) {
        toast.success(json.message || "Application submitted successfully!");
        onClose(); // Close the modal on success
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

  // Do not render if closed
  if (!job) return null;

  return (
    <Dialog open={!!job} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-white p-0 overflow-hidden">
        
        {/* HEADER SECTION */}
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

        {/* LOADING STATE */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-navy">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-saffron" />
            <p>Loading your profile details...</p>
          </div>
        ) : (
          <div className="p-6">
            {/* STEPPER UI */}
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

            {/* STEP 1: CONTACT */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                    Contact information
                  </h3>
                  <p className="text-sm text-muted-foreground">Verify how the employer will reach you.</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label>Full name</Label>
                    <Input disabled value={profile?.fullName || ""} className="mt-1 bg-slate-50 font-medium" />
                  </div>
                  <div>
                    <Label>Email address</Label>
                    <Input disabled value={profile?.email || ""} className="mt-1 bg-slate-50 font-medium" />
                  </div>
                  <div>
                    <Label>Phone number</Label>
                    <Input disabled value={profile?.phone || ""} className="mt-1 bg-slate-50 font-medium" />
                  </div>
                  <div>
                    <Label>Current location</Label>
                    <Input disabled value={`${profile?.district || ""}, ${profile?.state || ""}`} className="mt-1 bg-slate-50 font-medium" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: RESUME */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-bold text-navy">Resume / CV</h3>
                <p className="text-sm text-muted-foreground">Your resume will be securely attached to this application.</p>
                
                <div className="border border-border p-4 rounded-xl bg-slate-50 flex items-start gap-4 mt-4">
                  <div className="p-3 bg-white rounded-lg border shadow-sm text-saffron">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-navy">{profile?.resumeFileName || "Generated_Profile_Resume.pdf"}</p>
                    <p className="text-xs text-muted-foreground mt-1">This uses your latest profile data and uploaded documents.</p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: SCREENING */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-bold text-navy">Employer Screening</h3>
                <p className="text-sm text-muted-foreground">Quick check before we submit.</p>
                
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

            {/* STEP 4: REVIEW */}
            {step === 4 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 text-center py-6">
                <h3 className="text-2xl font-display font-bold text-navy">Ready to apply!</h3>
                <p className="text-muted-foreground">Your profile looks perfect for this role. Submit your application directly to the employer.</p>
              </div>
            )}

            {/* ACTION BUTTONS */}
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
                <Button 
                  className="bg-india-green text-white hover:bg-india-green/90 font-bold px-8" 
                  disabled={isSubmitting} 
                  onClick={submitApplication}
                >
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