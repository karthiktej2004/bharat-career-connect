import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, GraduationCap, IndianRupee, CheckCircle2, Upload, User, FileText, ClipboardList, Sparkles } from "lucide-react";
import { addApplication, getCandidateProfile, logActivity, type Job } from "@/lib/mockStore";
import { toast } from "sonner";

interface Props {
  job: Job | null;
  onClose: () => void;
  context?: "board" | "event";
}

type Step = 1 | 2 | 3 | 4;

export function ApplyJobDialog({ job, onClose, context = "board" }: Props) {
  const profile = useMemo(() => (typeof window !== "undefined" ? getCandidateProfile() : null), [job]);
  const [step, setStep] = useState<Step>(1);
  const [submitted, setSubmitted] = useState(false);

  // Step 1 — Contact
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  // Step 2 — Resume
  const [resume, setResume] = useState("Primary_Resume.pdf");
  const [newFile, setNewFile] = useState<string>("");

  // Step 3 — Screening
  const [experience, setExperience] = useState("");
  const [currentCTC, setCurrentCTC] = useState("");
  const [expectedCTC, setExpectedCTC] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("");
  const [willingRelocate, setWillingRelocate] = useState(false);
  const [authorized, setAuthorized] = useState(true);
  const [availability, setAvailability] = useState("");

  // Step 4 — Cover & consent
  const [coverLetter, setCoverLetter] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    if (!job) return;
    setStep(1);
    setSubmitted(false);
    setFullName(profile?.fullName || "");
    setEmail(profile?.email || "");
    setPhone(profile?.phone || "");
    setLocation([profile?.district, profile?.state].filter(Boolean).join(", "));
    setResume(profile?.resumeFileName || "Primary_Resume.pdf");
    setNewFile("");
    setExperience(profile?.yearsOfExperience || (profile?.experienceType === "Fresher" ? "0" : ""));
    setCurrentCTC(profile?.currentSalary || "");
    setExpectedCTC(profile?.expectedSalary || "");
    setNoticePeriod(profile?.noticePeriod || "");
    setWillingRelocate(!!profile?.willingToRelocate);
    setAuthorized(true);
    setAvailability("");
    setCoverLetter("");
    setLinkedin("");
    setPortfolio("");
    setConsent(false);
  }, [job, profile]);

  if (!job) return null;

  const canNext =
    step === 1 ? !!(fullName && email && phone) :
    step === 2 ? !!(resume || newFile) :
    step === 3 ? !!(experience && expectedCTC && noticePeriod && availability) :
    consent;

  function submit() {
    addApplication({
      id: "app-" + Date.now(),
      jobId: job!.id,
      candidateId: "me",
      status: "Applied",
      appliedAt: new Date().toISOString().slice(0, 10),
    });
    logActivity({
      type: "job_applied",
      title: `Applied to ${job!.title}`,
      description: `${job!.company} · ${job!.location}${context === "event" ? " · Event exclusive" : ""}`,
      meta: { jobId: job!.id, company: job!.company },
    });
    setSubmitted(true);
    toast.success(`Application submitted to ${job!.company}`);
  }


  function next() {
    if (step < 4) setStep((step + 1) as Step);
    else submit();
  }

  return (
    <Dialog open={!!job} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {submitted ? (
          <SuccessView job={job} onClose={onClose} />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-display">
                <Briefcase className="h-5 w-5 text-saffron" /> Apply for {job.title}
              </DialogTitle>
              <DialogDescription className="flex flex-wrap gap-x-3 gap-y-1 items-center">
                <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{job.company}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
                <Badge variant="outline" className="text-[10px]">{job.type}</Badge>
                {context === "event" && <Badge className="bg-saffron/15 text-saffron text-[10px]">Event exclusive</Badge>}
              </DialogDescription>
            </DialogHeader>

            <Stepper step={step} />

            <div className="mt-4 space-y-4">
              {step === 1 && (
                <section className="space-y-3">
                  <SectionTitle icon={<User className="h-4 w-4" />} title="Contact information" hint="Verify how the employer will reach you." />
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Full name"><Input value={fullName} onChange={(e) => setFullName(e.target.value)} /></Field>
                    <Field label="Email address"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
                    <Field label="Phone number"><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
                    <Field label="Current location"><Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, State" /></Field>
                  </div>
                </section>
              )}

              {step === 2 && (
                <section className="space-y-3">
                  <SectionTitle icon={<FileText className="h-4 w-4" />} title="Resume" hint="Choose an existing resume or upload a new one." />
                  <Field label="Select resume">
                    <Select value={resume} onValueChange={setResume}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {profile?.resumeFileName && <SelectItem value={profile.resumeFileName}>{profile.resumeFileName}</SelectItem>}
                        <SelectItem value="Primary_Resume.pdf">Primary_Resume.pdf</SelectItem>
                        <SelectItem value="Fresher_CV.pdf">Fresher_CV.pdf</SelectItem>
                        {newFile && <SelectItem value={newFile}>{newFile}</SelectItem>}
                      </SelectContent>
                    </Select>
                  </Field>
                  <div className="rounded-md border border-dashed border-border p-4 flex items-center gap-3">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-navy">Upload a new resume (PDF, DOC)</p>
                      <p className="text-xs text-muted-foreground">Max 5MB · optional</p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      id="apply-resume-upload"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) { setNewFile(f.name); setResume(f.name); toast.success("Resume attached"); }
                      }}
                    />
                    <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById("apply-resume-upload")?.click()}>Browse</Button>
                  </div>
                </section>
              )}

              {step === 3 && (
                <section className="space-y-3">
                  <SectionTitle icon={<ClipboardList className="h-4 w-4" />} title="Screening questions" hint="A few quick answers help the employer shortlist you." />
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Total years of experience">
                      <Select value={experience} onValueChange={setExperience}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {["0","1","2","3","4","5","6-8","9-12","13+"].map((v) => <SelectItem key={v} value={v}>{v} {v === "0" ? "(Fresher)" : "years"}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Notice period">
                      <Select value={noticePeriod} onValueChange={setNoticePeriod}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {["Immediate","15 days","30 days","60 days","90 days"].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Current CTC (₹ LPA)"><Input value={currentCTC} onChange={(e) => setCurrentCTC(e.target.value)} placeholder="e.g., 4.5" /></Field>
                    <Field label="Expected CTC (₹ LPA)"><Input value={expectedCTC} onChange={(e) => setExpectedCTC(e.target.value)} placeholder="e.g., 6.0" /></Field>
                    <Field label={`Can you work from ${job.location}?`}>
                      <Select value={availability} onValueChange={setAvailability}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes, on-site</SelectItem>
                          <SelectItem value="Hybrid">Hybrid preferred</SelectItem>
                          <SelectItem value="Remote">Remote only</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                  <div className="space-y-2 pt-1">
                    <label className="flex items-start gap-2 text-sm">
                      <Checkbox checked={willingRelocate} onCheckedChange={(v) => setWillingRelocate(!!v)} />
                      <span>I am willing to relocate for this role if required.</span>
                    </label>
                    <label className="flex items-start gap-2 text-sm">
                      <Checkbox checked={authorized} onCheckedChange={(v) => setAuthorized(!!v)} />
                      <span>I am authorized to work in India.</span>
                    </label>
                  </div>
                </section>
              )}

              {step === 4 && (
                <section className="space-y-3">
                  <SectionTitle icon={<Sparkles className="h-4 w-4" />} title="Cover letter & review" hint="Add a short note and review your application." />
                  <Field label="Why are you a great fit? (optional)">
                    <Textarea rows={4} value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder={`Share why you're excited to join ${job.company}…`} />
                  </Field>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="LinkedIn URL (optional)"><Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/…" /></Field>
                    <Field label="Portfolio / GitHub (optional)"><Input value={portfolio} onChange={(e) => setPortfolio(e.target.value)} placeholder="https://…" /></Field>
                  </div>

                  <div className="rounded-md bg-muted/50 p-3 text-xs space-y-1">
                    <p className="font-semibold text-navy">Review</p>
                    <Row k="Applicant" v={`${fullName} · ${email} · ${phone}`} />
                    <Row k="Location" v={location || "—"} />
                    <Row k="Resume" v={resume} />
                    <Row k="Experience" v={`${experience || "—"} yrs · Notice: ${noticePeriod || "—"}`} />
                    <Row k="Compensation" v={`Current ₹${currentCTC || "—"} LPA · Expected ₹${expectedCTC || "—"} LPA`} />
                    <Row k="Availability" v={availability || "—"} />
                  </div>

                  <label className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Checkbox checked={consent} onCheckedChange={(v) => setConsent(!!v)} />
                    <span>I confirm the information is accurate and consent to share my profile with {job.company} for this opportunity.</span>
                  </label>
                </section>
              )}
            </div>

            <DialogFooter className="mt-4 flex-row justify-between sm:justify-between gap-2">
              <Button type="button" variant="outline" onClick={() => (step === 1 ? onClose() : setStep((step - 1) as Step))}>
                {step === 1 ? "Cancel" : "Back"}
              </Button>
              <Button type="button" disabled={!canNext} onClick={next} className="bg-saffron text-navy hover:bg-saffron/90">
                {step === 4 ? "Submit application" : "Continue"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Stepper({ step }: { step: Step }) {
  const labels = ["Contact", "Resume", "Screening", "Review"];
  return (
    <div className="flex items-center gap-2 mt-2">
      {labels.map((l, i) => {
        const n = (i + 1) as Step;
        const active = n === step;
        const done = n < step;
        return (
          <div key={l} className="flex items-center gap-2 flex-1">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${done ? "bg-india-green text-white" : active ? "bg-saffron text-navy" : "bg-muted text-muted-foreground"}`}>
              {done ? <CheckCircle2 className="h-4 w-4" /> : n}
            </div>
            <span className={`text-xs truncate ${active ? "text-navy font-semibold" : "text-muted-foreground"}`}>{l}</span>
            {i < labels.length - 1 && <div className={`h-px flex-1 ${done ? "bg-india-green" : "bg-border"}`} />}
          </div>
        );
      })}
    </div>
  );
}

function SuccessView({ job, onClose }: { job: Job; onClose: () => void }) {
  return (
    <div className="py-6 text-center space-y-3">
      <div className="mx-auto h-14 w-14 rounded-full bg-india-green/15 flex items-center justify-center">
        <CheckCircle2 className="h-8 w-8 text-india-green" />
      </div>
      <DialogTitle className="font-display text-navy">Application submitted</DialogTitle>
      <p className="text-sm text-muted-foreground">Your application for <b>{job.title}</b> at <b>{job.company}</b> has been sent. You can track its status in <b>My Applications</b>.</p>
      <div className="grid grid-cols-3 gap-2 text-xs pt-2">
        <InfoChip icon={<Briefcase className="h-3.5 w-3.5" />} label={job.type} />
        <InfoChip icon={<GraduationCap className="h-3.5 w-3.5" />} label={job.qualification} />
        <InfoChip icon={<IndianRupee className="h-3.5 w-3.5" />} label={job.salary} />
      </div>
      <DialogFooter className="pt-4 justify-center sm:justify-center">
        <Button onClick={onClose} className="bg-navy text-white hover:bg-navy/90">Done</Button>
      </DialogFooter>
    </div>
  );
}

function SectionTitle({ icon, title, hint }: { icon: React.ReactNode; title: string; hint?: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-navy flex items-center gap-2">{icon}{title}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label className="text-xs">{label}</Label>{children}</div>;
}
function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-4"><span className="text-muted-foreground">{k}</span><span className="text-navy text-right truncate">{v}</span></div>;
}
function InfoChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return <div className="flex items-center gap-1.5 rounded-md bg-muted px-2 py-1.5 text-navy"><span className="text-saffron">{icon}</span><span className="truncate">{label}</span></div>;
}
