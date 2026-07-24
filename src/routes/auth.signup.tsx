import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Logo, TricolorBar } from "@/components/Brand";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { setSession, INDIAN_STATES, type CandidateProfile } from "@/lib/mockStore";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Upload, ShieldCheck, Sparkles, GraduationCap, Briefcase, FileText, Target, User as UserIcon, X, Eye, EyeOff, Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({ meta: [{ title: "Register as Candidate — Bharat Career Connect" }] }),
  component: SignupPage,
});

type Data = Partial<CandidateProfile> & { 
  password?: string; otp?: string; otpVerified?: boolean; 
  mla?: string; mp?: string; gramPanchayat?: string; 
  institutionOther?: string; course?: string; courseOther?: string; 
  specializationOther?: string; schoolName?: string; stateBoardName?: string;
};

const STEPS = [
  { key: "basic", label: "Basic Info", icon: UserIcon },
  { key: "verify", label: "Verify Phone", icon: ShieldCheck },
  { key: "education", label: "Education", icon: GraduationCap },
  { key: "skills", label: "Skills", icon: Sparkles },
  { key: "experience", label: "Experience", icon: Briefcase },
  { key: "resume", label: "Resume", icon: FileText },
  { key: "preferences", label: "Preferences", icon: Target },
  { key: "review", label: "Review", icon: Check },
] as const;

const HIGHEST_QUALS = ["Below 10th / SSLC", "10th std / SSLC", "ITI", "12th std / 2nd PUC", "Diploma", "UG Degree", "PG Degree", "BE/B-Tech", "ME/M-Tech", "PHD", "Others"];
const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];
const CATEGORIES = ["General Merit (GM)", "OBC", "SC", "ST", "Other"];

function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Data>({ language: "English", experienceType: "Fresher", certifications: [], skills: [], languagesFluent: ["English"], preferredRoles: [], preferredLocations: [] });
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [done, setDone] = useState<CandidateProfile | null>(null);
  const [pinLookup, setPinLookup] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [skillSearch, setSkillSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const pin = (data.pincode || "").trim();
    if (!/^\d{6}$/.test(pin)) { setPinLookup("idle"); return; }
    let cancelled = false;
    setPinLookup("loading");
    
    fetch(`https://api.postalpincode.in/pincode/${pin}`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        const rec = Array.isArray(json) ? json[0] : null;
        const offices = rec?.PostOffice as Array<{ State: string; District: string; Block: string; Name: string }> | null;
        if (rec?.Status === "Success" && offices && offices.length) {
          const o = offices[0];
          setData((d) => ({ ...d, state: INDIAN_STATES.includes(o.State) ? o.State : d.state || o.State, district: o.District, taluk: o.Block && o.Block !== "NA" ? o.Block : o.Name }));
          setPinLookup("ok");
        } else { setPinLookup("error"); }
      }).catch(() => { if (!cancelled) setPinLookup("error"); });
    return () => { cancelled = true; };
  }, [data.pincode]);

  const set = <K extends keyof Data>(k: K, v: Data[K]) => setData((d) => ({ ...d, [k]: v }));
  const toggleArr = (k: "skills" | "certifications" | "languagesFluent" | "preferredRoles" | "preferredLocations", v: string) => { setData((d) => { const arr = (d[k] as string[]) || []; return { ...d, [k]: arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v] }; }); };

  const canNext = useMemo(() => {
    switch (STEPS[step].key) {
      case "basic": return !!(data.fullName && data.email && data.phone && password.length >= 6);
      case "verify": return !!data.otpVerified;
      case "education": return !!(data.qualification && data.yearOfPassing);
      case "skills": return (data.skills?.length || 0) >= 1;
      case "experience": return !!data.experienceType;
      case "resume": return true;
      case "preferences": return (data.preferredLocations?.length || 0) >= 1 && !!data.preferredJobType;
      case "review": return true;
    }
  }, [step, data, password]);

  const completion = useMemo(() => {
    const fields = [data.fullName, data.email, data.phone, data.qualification, data.skills?.length, data.experienceType, data.resumeFileName, data.preferredLocations?.length, data.category, data.state];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }, [data]);

  function sendOtp() { setOtpSent("any"); toast.success(`OTP sent to ${data.phone}. Enter 1234 to verify.`); }
  function verifyOtp() { if (otpInput === "1234" || /^\d{6}$/.test(otpInput)) { set("otpVerified", true); toast.success("Phone verified"); } else { toast.error("Enter 1234"); } }

  async function finish() {
    setIsSubmitting(true);
    const d: any = data;

    const finalInstitution = data.institution === "State Board" ? `${data.stateBoardName} State Board` : data.institution === "__other__" ? d.institutionOther : data.institution;
    const finalCourse = data.course === "__other__" ? d.courseOther : data.course;
    const finalSpecialization = data.specialization === "__other__" ? d.specializationOther : data.specialization;

    const payload = {
      fullName: data.fullName || "", email: data.email || "", phone: data.phone || "", password: password, 
      dob: data.dob || null, gender: data.gender, language: data.language, category: data.category,
      state: data.state, district: data.district, taluk: data.taluk, pincode: data.pincode,
      mla: data.mla, mp: data.mp, gramPanchayat: data.gramPanchayat,
      qualification: data.qualification, institution: finalInstitution, schoolName: data.schoolName,
      course: finalCourse, specialization: finalSpecialization, yearOfPassing: data.yearOfPassing, percentage: data.percentage, languagesFluent: data.languagesFluent,
      skills: data.skills, experienceType: data.experienceType, yearsOfExperience: data.yearsOfExperience, employmentStatus: data.employmentStatus,
      currentRole: data.currentRole, currentCompany: data.currentCompany, resumeFileName: data.resumeFileName,
      preferredRoles: data.preferredRoles, preferredLocations: data.preferredLocations, preferredJobType: data.preferredJobType, expectedSalary: data.expectedSalary, willingToRelocate: data.willingToRelocate
    };

    try {
      const res = await fetch("https://bcc-backend-0cny.onrender.com/api/auth/candidate/register", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
      });
      
      const json = await res.json();
      if (json.success) {
        setSession({ id: json.uniqueId, name: payload.fullName, email: payload.email, role: "candidate" });
        setDone({ uniqueId: json.uniqueId } as CandidateProfile);
        toast.success("Account securely created!");
      } else {
        toast.error(json.message || "Registration failed");
      }
    } catch (err) {
      toast.error("Fetch failed. Please check server status.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col hero-gradient">
      <TricolorBar />
      <div className="p-4"><Button asChild variant="ghost" size="sm" className="text-navy hover:bg-navy/5"><Link to="/"><ArrowLeft className="h-4 w-4 mr-1" /> Back to home</Link></Button></div>
      <div className="flex-1 flex items-center justify-center p-4 py-6">
        <Card className="w-full max-w-3xl p-6 md:p-8 shadow-elegant border-border/60 bg-white">
          <div className="mb-4 rounded-lg bg-orange-50 border border-orange-200 px-4 py-3 text-sm text-orange-900 text-center">This is for new users. If you already have an account, <Link to="/auth/login" className="font-bold hover:underline">go to Sign In</Link>.</div>
          <div className="flex justify-center mb-4"><Logo /></div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-navy text-center">Candidate Registration</h1>
          <p className="text-sm text-muted-foreground text-center mt-1">Complete all steps — your account is created at the end.</p>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-2"><span className="text-xs font-bold text-navy">Step {step + 1} of {STEPS.length} — {STEPS[step].label}</span><span className="text-xs font-bold text-india-green">{completion}% profile</span></div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-india-green transition-all duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} /></div>
          </div>

          <div className="mt-6 min-h-[350px]">
            {/* STEP 1: BASIC INFO */}
            {STEPS[step].key === "basic" && (
              <div className="grid md:grid-cols-2 gap-5 animate-in fade-in">
                <div className="md:col-span-2"><Label>Full Name *</Label><Input value={data.fullName || ""} onChange={(e) => set("fullName", e.target.value)} className="mt-1" placeholder="As per official documents" /></div>
                <div><Label>Email *</Label><Input type="email" value={data.email || ""} onChange={(e) => set("email", e.target.value)} className="mt-1" /></div>
                <div><Label>Phone *</Label><Input value={data.phone || ""} onChange={(e) => set("phone", e.target.value)} className="mt-1" placeholder="+91 98xxxxxxxx" /></div>
                
                <div>
                  <Label>Password *</Label>
                  <div className="relative mt-1">
                    <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" className="pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-muted-foreground hover:text-navy">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                  </div>
                </div>
                
                <div><Label>Date of Birth</Label><Input type="date" value={data.dob || ""} onChange={(e) => set("dob", e.target.value)} className="mt-1" /></div>
                
                <div>
                  <Label>Gender</Label>
                  <Select value={data.gender || ""} onValueChange={(v) => set("gender", v)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{GENDERS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Category</Label>
                  <Select value={data.category || ""} onValueChange={(v) => set("category", v)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                <div><Label>PIN Code</Label><Input value={data.pincode || ""} onChange={(e) => set("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))} className="mt-1 font-mono" placeholder="560064" maxLength={6} /></div>
                <div><Label>District</Label><Input disabled value={data.district || ""} className="mt-1 bg-white" placeholder="Auto-filled by PIN" /></div>
              </div>
            )}

            {/* STEP 2: VERIFY */}
            {STEPS[step].key === "verify" && (
              <div className="max-w-md mx-auto text-center py-6 animate-in fade-in">
                <div className="mx-auto size-14 rounded-full bg-saffron/15 flex items-center justify-center mb-4"><ShieldCheck className="h-7 w-7 text-saffron" /></div>
                <h3 className="font-display text-lg font-bold text-navy">Verify your phone</h3>
                {!otpSent ? (<Button className="mt-6 bg-navy text-white hover:bg-navy/90" onClick={sendOtp}>Send OTP</Button>) : data.otpVerified ? (<div className="mt-6 inline-flex items-center gap-2 text-india-green font-medium"><Check className="h-4 w-4" /> Phone verified</div>) : (<div className="mt-6 space-y-3"><Input value={otpInput} onChange={(e) => setOtpInput(e.target.value)} placeholder="Enter 6-digit OTP" className="text-center tracking-widest" maxLength={6} /><div className="flex gap-2 justify-center"><Button onClick={verifyOtp} className="bg-india-green text-white">Verify</Button></div></div>)}
              </div>
            )}

            {/* STEP 3: EDUCATION */}
            {STEPS[step].key === "education" && (
              <div className="grid md:grid-cols-2 gap-5 animate-in fade-in">
                <div>
                  <Label>Highest Qualification *</Label>
                  <Select value={data.qualification || ""} onValueChange={(v) => set("qualification", v)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{HIGHEST_QUALS.map((qq) => <SelectItem key={qq} value={qq}>{qq}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Year of Passing *</Label>
                  <Input type="number" value={data.yearOfPassing || ""} onChange={(e) => set("yearOfPassing", e.target.value)} className="mt-1" placeholder="e.g. 2024" />
                </div>
                <div>
                  <Label>Institution / College Name</Label>
                  <Input value={data.institution || ""} onChange={(e) => set("institution", e.target.value)} className="mt-1" placeholder="University / College" />
                </div>
                <div>
                  <Label>Percentage / CGPA</Label>
                  <Input type="number" step="0.1" value={data.percentage || ""} onChange={(e) => set("percentage", e.target.value)} className="mt-1" placeholder="e.g. 85.5 or 8.5" />
                </div>
                <div className="md:col-span-2 grid md:grid-cols-2 gap-5">
                  <div>
                    <Label>Course</Label>
                    <Input value={data.course || ""} onChange={(e) => set("course", e.target.value)} className="mt-1" placeholder="e.g. B.Tech, B.Com, Science" />
                  </div>
                  <div>
                    <Label>Specialization</Label>
                    <Input value={data.specialization || ""} onChange={(e) => set("specialization", e.target.value)} className="mt-1" placeholder="e.g. Computer Science, Accounting" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: SKILLS */}
            {STEPS[step].key === "skills" && (
              <div className="animate-in fade-in">
                <div className="flex gap-2 mb-4"><Input value={skillSearch} onChange={(e) => setSkillSearch(e.target.value)} placeholder="Search a skill (e.g. React, Tally, Welding)" /><Button onClick={() => { if(skillSearch) toggleArr("skills", skillSearch); setSkillSearch(""); }} className="bg-navy text-white">Add</Button></div>
                <div className="flex flex-wrap gap-2">{data.skills?.map((s) => <Badge key={s} className="bg-saffron text-navy px-3 py-1">{s} <X className="h-3 w-3 ml-2 cursor-pointer" onClick={() => toggleArr("skills", s)}/></Badge>)}</div>
                
                <div className="mt-8">
                  <Label>Languages Known</Label>
                  <div className="flex flex-wrap gap-2 mt-2">{["English", "Hindi", "Kannada", "Telugu", "Tamil", "Marathi"].map((l) => <Badge key={l} onClick={() => toggleArr("languagesFluent", l)} className={`cursor-pointer ${data.languagesFluent?.includes(l) ? "bg-navy text-white" : "bg-slate-100 text-slate-700"}`}>{l}</Badge>)}</div>
                </div>
              </div>
            )}

            {/* STEP 5: EXPERIENCE */}
            {STEPS[step].key === "experience" && (
              <div className="grid md:grid-cols-2 gap-4 animate-in fade-in">
                <div className="md:col-span-2"><Label>Experience Type</Label><div className="mt-2 flex gap-3">{(["Fresher","Experienced"] as const).map((t) => (<button key={t} onClick={() => set("experienceType", t)} className={`flex-1 p-4 rounded-lg border text-left ${data.experienceType === t ? "border-navy bg-navy/5" : "border-border"}`}><div className="font-medium text-navy">{t}</div></button>))}</div></div>
                
                {data.experienceType === "Experienced" && (
                  <>
                    <div><Label>Years of Experience</Label><Input type="number" step="0.5" value={data.yearsOfExperience || ""} onChange={(e) => set("yearsOfExperience", e.target.value)} className="mt-1" placeholder="e.g. 2.5" /></div>
                    <div><Label>Current/Last Company</Label><Input value={data.currentCompany || ""} onChange={(e) => set("currentCompany", e.target.value)} className="mt-1" placeholder="Company Name" /></div>
                    <div className="md:col-span-2"><Label>Current Job Role</Label><Input value={data.currentRole || ""} onChange={(e) => set("currentRole", e.target.value)} className="mt-1" placeholder="e.g. Software Engineer" /></div>
                  </>
                )}
              </div>
            )}

            {/* STEP 6: RESUME */}
            {STEPS[step].key === "resume" && (
              <div className="text-center py-6 animate-in fade-in">
                <label className="block border-2 border-dashed border-navy/30 rounded-xl p-8 hover:bg-navy/5 cursor-pointer"><Upload className="h-10 w-10 mx-auto text-navy" /><div className="mt-3 font-medium text-navy">{data.resumeFileName || "Upload your Resume (PDF/Word)"}</div><input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => { if(e.target.files?.[0]) set("resumeFileName", e.target.files[0].name); }} /></label>
              </div>
            )}

            {/* STEP 7: PREFERENCES */}
            {STEPS[step].key === "preferences" && (
              <div className="grid md:grid-cols-2 gap-4 animate-in fade-in">
                <div className="md:col-span-2"><Label>Preferred Work Locations *</Label><div className="flex flex-wrap gap-2 mt-2">{["Bengaluru","Mysuru","Hubballi","Mangaluru","Remote"].map((l) => <Badge key={l} onClick={() => toggleArr("preferredLocations", l)} className={`cursor-pointer px-3 py-1 ${data.preferredLocations?.includes(l) ? "bg-navy text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>{l}</Badge>)}</div></div>
                <div>
                  <Label>Job Type *</Label>
                  <Select value={data.preferredJobType || ""} onValueChange={(v) => set("preferredJobType", v)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{["Full-time","Part-time","Internship","Contract"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Expected Salary (LPA)</Label>
                  <Input type="number" step="0.1" value={data.expectedSalary || ""} onChange={(e) => set("expectedSalary", e.target.value)} className="mt-1" placeholder="e.g. 4.5" />
                </div>
                <div className="md:col-span-2 flex items-center gap-2 mt-2">
                  <Checkbox id="relocate" checked={data.willingToRelocate || false} onCheckedChange={(c) => set("willingToRelocate", c === true)} />
                  <label htmlFor="relocate" className="text-sm font-medium text-navy cursor-pointer">I am willing to relocate for the right opportunity.</label>
                </div>
              </div>
            )}

            {/* STEP 8: REVIEW */}
            {STEPS[step].key === "review" && (
              <div className="space-y-6 animate-in fade-in">
                <ReviewSection title="Basic Information">
                  <ReviewRow label="Full Name" value={data.fullName} />
                  <ReviewRow label="Email" value={data.email} />
                  <ReviewRow label="Phone" value={data.phone} />
                  <ReviewRow label="Location" value={`${data.district || 'N/A'}, ${data.state || 'N/A'}`} />
                </ReviewSection>

                <ReviewSection title="Professional Details">
                  <ReviewRow label="Highest Qualification" value={data.qualification} />
                  <ReviewRow label="Course & Specialization" value={`${data.course || 'N/A'} - ${data.specialization || 'N/A'}`} />
                  <ReviewRow label="Skills" value={data.skills?.join(", ")} />
                  <ReviewRow label="Experience" value={data.experienceType} />
                </ReviewSection>
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between gap-3 pt-6 border-t border-border">
            <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
            {step < STEPS.length - 1 ? (<Button disabled={!canNext} onClick={() => setStep((s) => s + 1)} className="bg-navy hover:bg-navy/90 text-white px-8">Next <ArrowRight className="h-4 w-4 ml-1" /></Button>) : (<Button onClick={finish} disabled={isSubmitting} className="bg-saffron text-navy px-8 font-semibold">{isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-1" />} {isSubmitting ? "Creating..." : "Create Account"}</Button>)}
          </div>

        </Card>
      </div>

      <Dialog open={!!done} onOpenChange={(o) => { if (!o && done) navigate({ to: "/auth/login" }); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-display text-navy">Welcome to Bharat Career Connect!</DialogTitle>
            <DialogDescription className="text-center pt-2">Your candidate account is ready.<br />Candidate ID: <b className="text-navy font-mono bg-navy/5 px-2 py-1 rounded ml-1">{done?.uniqueId}</b></DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4"><Button onClick={() => navigate({ to: "/auth/login" })} className="w-full bg-navy text-white">Go to Login</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value?: string }) {
  return (<div className="p-3 bg-slate-50 border border-border/50 rounded-lg"><div className="text-xs text-muted-foreground">{label}</div><div className="font-medium text-navy mt-0.5">{value || <span className="text-muted-foreground italic">—</span>}</div></div>);
}

function ReviewSection({ title, children }: { title: string; children: ReactNode }) {
  return (<div><h3 className="font-display font-semibold text-navy text-sm mb-3">{title}</h3><div className="grid md:grid-cols-2 gap-3 text-sm">{children}</div></div>);
}
