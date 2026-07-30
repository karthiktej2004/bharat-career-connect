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
import { setSession, NSQF_SKILLS, INDIAN_LANGUAGES, INDIAN_STATES, type CandidateProfile } from "@/lib/mockStore";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Upload, ShieldCheck, Sparkles, GraduationCap, Briefcase, FileText, Target, User as UserIcon, X, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({ meta: [{ title: "Register as Candidate — Bharat Career Connect" }] }),
  component: SignupPage,
});

type Data = Partial<CandidateProfile> & { 
  password?: string; otp?: string; otpVerified?: boolean; 
  mla?: string; mp?: string; gramPanchayat?: string; 
  institutionOther?: string; course?: string; courseOther?: string; 
  specializationOther?: string; schoolName?: string; stateBoardName?: string;
  countryCode?: string; socialCategory?: string;
  certifications?: Array<{ title: string; fileName: string }>;
  gender?: string;
};

const STEPS = [
  { key: "basic", label: "Basic Info", icon: UserIcon },
  { key: "verify", label: "Verify Phone", icon: ShieldCheck },
  { key: "password", label: "Password", icon: ShieldCheck },
  { key: "education", label: "Education", icon: GraduationCap },
  { key: "skills", label: "Skills", icon: Sparkles },
  { key: "experience", label: "Experience", icon: Briefcase },
  { key: "resume", label: "Resume & Certs", icon: FileText },
  { key: "preferences", label: "Preferences", icon: Target },
  { key: "review", label: "Review", icon: Check },
] as const;

const HIGHEST_QUALS = [
  "Below 10th / SSLC", 
  "10th Std / SSLC", 
  "ITI", 
  "12th Std / 2nd PUC / Intermediate", 
  "Diploma", 
  "UG - Undergraduate Degree", 
  "PG - Postgraduate Degree", 
  "BE / B-Tech", 
  "ME / M-Tech", 
  "PHD", 
  "Short Term Courses", 
  "Others"
];

const GENDER_OPTIONS = [
  "Male", 
  "Female", 
  "PWD (Person With Disabilities)", 
  "Widow", 
  "LGBTQ+", 
  "Senior Citizens", 
  "Veterans", 
  "Others"
];

const SOCIAL_CATEGORIES = [
  "SC - Scheduled Castes",
  "ST - Scheduled Tribes",
  "OBC - Other Backward Classes (Non-Creamy Layer)",
  "EWS - Economically Weaker Sections",
  "UR - Unreserved (General)",
  "ESM - Ex-Servicemen",
  "A&PH - Persons with Benchmark Disabilities",
  "FF - Freedom Fighters",
  "Sports - Sports Persons",
  "PM - Project Affected Persons",
  "DC - Disaster Affected Persons",
  "Others"
];

const COUNTRY_CODES = [
  { code: "+91", label: "India (+91)" },
  { code: "+1", label: "USA / Canada (+1)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+971", label: "UAE (+971)" },
  { code: "+65", label: "Singapore (+65)" },
  { code: "+61", label: "Australia (+61)" }
];

const COMMON_ROLES = [
  "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "Data Analyst", "Data Scientist", "UI/UX Designer", "Product Manager", "Quality Assurance (QA)",
  "DevOps Engineer", "HR Executive", "Business Development Manager", "Sales Executive",
  "Digital Marketing Specialist", "Customer Support Executive", "Accountant / Finance Executive",
  "Operations Manager", "Machine Learning Engineer", "System Administrator", "Content Writer"
];

const BOARDS = ["State Board", "CBSE", "ICSE / CISCE", "Other"];
const STATE_BOARDS_LIST = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"];
const ITI_TRADES = ["Carpenter", "Computer Operator & Programming Assistant (COPA)", "Electrician", "Fitter", "Machinist", "Mechanic (Motor Vehicle)", "Plumber", "Welder", "Wireman", "Other Trade"];
const DIPLOMA_STREAMS = ["Civil Engineering", "Computer Science Engineering", "Electrical Engineering", "Electronics & Communication", "Mechanical Engineering", "Commercial Practice", "Pharmacy", "Other"];

const UG_MAPPING: Record<string, string[]> = {
  "BA": ["Economics", "English Literature", "History", "Journalism", "Political Science", "Sociology", "Psychology"],
  "Bachelor of Science (BSc)": ["Computer Science", "Information Technology", "Mathematics", "Physics", "Chemistry", "Biotechnology", "Microbiology"],
  "Bachelor of Commerce (BCom)": ["Accounting", "Banking and Finance", "Taxation", "Computer Applications", "General"],
  "Bachelor of Computer Applications (BCA)": ["Software Development", "Database Management", "Networking", "Cyber Security", "Web Development", "AI / Machine Learning", "Data Science"],
  "BBA": ["Finance", "Marketing", "Human Resource Management (HR)", "Business Analytics", "International Business"],
  "Bachelor of Pharmacy (BPharm)": ["Pharmaceutical Technology", "Pharmacology", "Pharmaceutical Chemistry", "Quality Assurance"]
};
const UG_COURSES = Object.keys(UG_MAPPING);

const PG_MAPPING: Record<string, string[]> = {
  "MA": ["Political Science", "History", "English Literature", "Sociology", "Economics"],
  "MSc": ["Physics", "Chemistry", "Mathematics", "Computer Science", "Biotechnology", "Data Analytics"],
  "MBA": ["Finance", "Marketing", "Human Resources", "Operations", "Business Analytics", "International Business"],
  "MCA (Master in Computer Application)": ["Software Development", "Data Science", "Artificial Intelligence", "Cybersecurity", "Cloud Computing"]
};
const PG_COURSES = Object.keys(PG_MAPPING);

const BE_ME_COURSES = ["Computer Science", "Information Technology", "Electronics & Communication", "Electrical", "Mechanical", "Civil", "Aerospace", "Chemical", "Biotechnology", "Artificial Intelligence & ML", "Other"];
const UNIVERSITIES = ["IIT (Any)", "NIT (Any)", "IIIT (Any)", "IISc Bengaluru", "BITS Pilani", "Delhi University", "Anna University", "VTU", "Bangalore University", "Mysore University", "Osmania University", "Other"];
const GENERIC_SPECIALIZATIONS = ["Artificial Intelligence & Machine Learning", "Data Science", "Cyber Security", "Finance", "Marketing", "Human Resources", "Operations", "Business Analytics", "Accounting", "Economics", "Physics", "Chemistry", "Mathematics", "Biology", "English Literature"];

function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Data>({ 
    language: "English", 
    experienceType: "Fresher", 
    certifications: [], 
    skills: [], 
    languagesFluent: ["English"], 
    preferredRoles: [], 
    preferredLocations: [],
    countryCode: "+91",
    socialCategory: "UR - Unreserved (General)",
    gender: "" 
  });
  
  const [otherGenderDetails, setOtherGenderDetails] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [done, setDone] = useState<CandidateProfile | null>(null);
  const [pinLookup, setPinLookup] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [skillSearch, setSkillSearch] = useState("");
  const [scoreType, setScoreType] = useState<"percentage" | "cgpa">("percentage");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxDate = new Date(new Date().setFullYear(new Date().getFullYear() - 15)).toISOString().split('T')[0];

  const isNameValid = useMemo(() => {
    if (!data.fullName) return true;
    return /^[a-zA-Z\s'.]{2,60}$/.test(data.fullName.trim());
  }, [data.fullName]);

  const isEmailValid = useMemo(() => {
    if (!data.email) return true;
    const cleanEmail = data.email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|org|net|edu|gov|co|io)$/i;
    const fakeDomains = ["@pass.com", "@test.com", "@example.com", "@mailinator.com", "@temp.com"];
    return emailRegex.test(cleanEmail) && !fakeDomains.some(domain => cleanEmail.endsWith(domain));
  }, [data.email]);

  const isPhoneValid = useMemo(() => {
    if (!data.phone) return true;
    const cleanPhone = data.phone.replace(/\D/g, "");
    return cleanPhone.length === 10 && /^[6-9]\d{9}$/.test(cleanPhone);
  }, [data.phone]);

  const isYopValid = useMemo(() => {
    if (!data.yearOfPassing) return true;
    const yop = Number(data.yearOfPassing);
    const currentYear = new Date().getFullYear();
    return !isNaN(yop) && yop >= 1970 && yop <= currentYear + 6;
  }, [data.yearOfPassing]);

  // Robust live password validation
  const isPasswordValid = useMemo(() => {
    if (!password || password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/\d/.test(password)) return false;
    if (!/[@$!%*?&._-]/.test(password)) return false;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  const validatePassword = () => {
    if (!isPasswordValid) {
      toast.error("Please meet all password requirements and ensure they match.");
      return false;
    }
    return true;
  };

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
          let mappedMla = "Auto-mapped"; let mappedMp = "Auto-mapped"; let mappedGp = "Auto-mapped";
          if (pin === "560064") { mappedMla = "Yelahanka"; mappedMp = "Chikkaballapur"; mappedGp = "Rajanukunte"; }
          setData((d) => ({ ...d, state: INDIAN_STATES.includes(o.State) ? o.State : d.state || o.State, district: o.District, taluk: o.Block && o.Block !== "NA" ? o.Block : o.Name, mla: mappedMla, mp: mappedMp, gramPanchayat: mappedGp }));
          setPinLookup("ok");
        } else { setPinLookup("error"); }
      }).catch(() => { if (!cancelled) setPinLookup("error"); });
    return () => { cancelled = true; };
  }, [data.pincode]);

  const set = <K extends keyof Data>(k: K, v: Data[K]) => setData((d) => ({ ...d, [k]: v }));
  const toggleArr = (k: "skills" | "certifications" | "languagesFluent" | "preferredRoles" | "preferredLocations", v: string) => { setData((d) => { const arr = (d[k] as any[]) || []; return { ...d, [k]: arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v] }; }); };

  const canNext = useMemo(() => {
    switch (STEPS[step].key) {
      case "basic": 
        return !!(data.fullName && isNameValid && data.email && isEmailValid && data.phone && isPhoneValid && data.dob && data.pincode?.length === 6 && data.gender && (data.gender !== "Others" || (data.gender === "Others" && otherGenderDetails.trim() !== "")));
      case "verify": 
        return !!data.otpVerified;
      case "password":
        return isPasswordValid;
      case "education": 
        return !!(data.qualification && data.yearOfPassing && isYopValid);
      case "skills": 
        return (data.skills?.length || 0) >= 1;
      case "experience": 
        return !!data.experienceType;
      case "resume": 
        return !!data.resumeFileName;
      case "preferences": 
        return (data.preferredLocations?.length || 0) >= 1 && !!data.preferredJobType;
      case "review": 
        return true;
    }
  }, [step, data, isPasswordValid, isNameValid, isEmailValid, isPhoneValid, isYopValid, otherGenderDetails]);

  const completion = useMemo(() => {
    const fields = [
      Boolean(data.fullName?.trim()),
      Boolean(data.email?.trim()),
      Boolean(data.phone?.trim()),
      Boolean(data.qualification?.trim()),
      (data.skills?.length || 0) > 0,
      data.experienceType === "Experienced" ? Boolean(data.currentRole?.trim()) : false,
      Boolean(data.resumeFileName?.trim()),
      (data.preferredLocations?.length || 0) > 0,
      Boolean(data.category?.trim()),
      Boolean(data.pincode?.trim() && data.pincode.length === 6)
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }, [data]);

  function sendOtp() { 
    if (!isPhoneValid || !data.phone) return toast.error("Enter a valid 10-digit mobile number!");
    setOtpSent("any"); 
    toast.success(`OTP sent to ${data.countryCode || "+91"} ${data.phone}. Enter 1234 to verify.`); 
  }

  function verifyOtp() { 
    if (otpInput === "1234" || /^\d{6}$/.test(otpInput)) { 
      set("otpVerified", true); 
      toast.success("Phone verified successfully!"); 
      setStep((s) => s + 1); 
    } else { 
      toast.error("Invalid OTP. Enter 1234"); 
    } 
  }

  function validateAndAddSkill(skillName: string) {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    
    if (trimmed.length < 2 || trimmed.length > 40) {
      return toast.error("Skill name must be between 2 and 40 characters.");
    }
    if (/(.)\1{4,}/.test(trimmed)) {
      return toast.error("Please enter a valid skill name (avoid repeating characters).");
    }
    if (!/[aeiouAEIOU]/.test(trimmed) && trimmed.length > 5) {
      return toast.error("Please enter a valid skill name (missing standard word structure).");
    }

    const currentSkills = data.skills || [];
    if (!currentSkills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      set("skills", [...currentSkills, trimmed]);
      toast.success(`Added skill: ${trimmed}`);
    } else {
      toast.error("Skill already added.");
    }
    setSkillSearch("");
  }

  function validateAndAddRole(roleName: string) {
    const trimmed = roleName.trim();
    if (!trimmed) return;
    if (trimmed.length < 2 || trimmed.length > 50) {
      return toast.error("Role name must be between 2 and 50 characters.");
    }
    if (/(.)\1{4,}/.test(trimmed)) {
      return toast.error("Please enter a valid job role.");
    }

    const currentRoles = data.preferredRoles || [];
    if (!currentRoles.some(r => r.toLowerCase() === trimmed.toLowerCase())) {
      set("preferredRoles", [...currentRoles, trimmed]);
      toast.success(`Added role: ${trimmed}`);
    } else {
      toast.error("Role already added.");
    }
  }

  async function finish() {
    if (!isNameValid) return toast.error("Please enter a valid Full Name (letters only).");
    if (!isEmailValid) return toast.error("Please enter a valid professional email address.");
    if (!isPhoneValid) return toast.error("Please enter a valid 10-digit mobile number.");

    setIsSubmitting(true);
    const d: any = data;

    const finalInstitution = data.institution === "State Board" ? `${data.stateBoardName} State Board` : data.institution === "__other__" ? d.institutionOther : data.institution;
    const finalCourse = data.course === "__other__" ? d.courseOther : data.course;
    const finalSpecialization = data.specialization === "__other__" ? d.specializationOther : data.specialization;
    
    const finalGender = data.gender === "Others" ? otherGenderDetails : data.gender;

    const payload = {
      fullName: data.fullName?.trim() || "", 
      email: data.email?.trim() || "", 
      phone: `${data.countryCode || "+91"} ${data.phone?.replace(/\D/g, "")}` || "", 
      password: password, 
      dob: data.dob || null, 
      gender: finalGender || "Male", 
      language: data.language || "English", 
      category: data.category || "General Merit (GM)",
      socialCategory: data.socialCategory || "UR - Unreserved (General)",
      state: data.state || "", 
      district: data.district || "", 
      taluk: data.taluk || "", 
      pincode: data.pincode || "",
      mla: data.mla || "", 
      mp: data.mp || "", 
      gramPanchayat: data.gramPanchayat || "",
      qualification: data.qualification || "", 
      institution: finalInstitution || "", 
      schoolName: data.schoolName || "",
      course: finalCourse || "", 
      specialization: finalSpecialization || "", 
      yearOfPassing: data.yearOfPassing || "", 
      percentage: data.percentage || "", 
      languagesFluent: data.languagesFluent || [],
      skills: data.skills || [], 
      experienceType: data.experienceType || "Fresher", 
      yearsOfExperience: data.yearsOfExperience || "", 
      employmentStatus: data.employmentStatus || "",
      currentRole: data.currentRole || "", 
      currentCompany: data.currentCompany || "", 
      resumeFileName: data.resumeFileName || "",
      certifications: data.certifications || [],
      preferredRoles: data.preferredRoles || [], 
      preferredLocations: data.preferredLocations || [], 
      preferredJobType: data.preferredJobType || "Full-time", 
      expectedSalary: data.expectedSalary || "", 
      willingToRelocate: Boolean(data.willingToRelocate)
    };

    try {
      const res = await fetch("http://15.207.249.155:5000/api/auth/candidate/register", {
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(payload)
      });
      
      const json = await res.json();

      if (res.ok && json.success) {
        setSession({ id: json.uniqueId, name: payload.fullName, email: payload.email, role: "candidate" });
        setDone({ uniqueId: json.uniqueId } as CandidateProfile);
        toast.success("Account securely created in Database!");
      } else {
        toast.error(json.message || "Registration failed.");
      }
    } catch (err) {
      toast.error("Could not reach backend server. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleNextStep = () => {
     if (STEPS[step].key === 'password') {
         if(!validatePassword()) return;
     }
     setStep((s) => s + 1);
  };

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
            <div className="hidden md:flex mt-4 gap-2 overflow-x-auto pb-2">
              {STEPS.map((s, i) => {
                const Icon = s.icon; const active = i === step, isDone = i < step;
                return (
                  <button key={s.key} onClick={() => i < step && setStep(i)} className={`flex-1 min-w-fit px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 border transition ${active ? "bg-navy text-white border-navy" : isDone ? "bg-white text-navy border-border hover:bg-slate-50" : "bg-transparent text-muted-foreground border-transparent opacity-50"}`}><Icon className="h-3.5 w-3.5" /> {s.label}</button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 min-h-[350px]">
            {/* STEP 1: BASIC INFO */}
            {STEPS[step].key === "basic" && (
              <div className="grid md:grid-cols-2 gap-5 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="md:col-span-2">
                  <Label>Full Name <span className="text-red-500">*</span></Label>
                  <Input 
                    value={data.fullName || ""} 
                    onChange={(e) => set("fullName", e.target.value.replace(/[^a-zA-Z\s'.]/g, ""))} 
                    className="mt-1" 
                    placeholder="As per official photo ID (Letters only)" 
                  />
                  {!isNameValid && data.fullName && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> Please enter a valid name (minimum 2 letters, no numbers/special chars)</p>
                  )}
                </div>

                <div>
                  <Label>Email <span className="text-red-500">*</span></Label>
                  <Input type="email" value={data.email || ""} onChange={(e) => set("email", e.target.value.trim())} className="mt-1" placeholder="name@example.com" />
                  {!isEmailValid && data.email && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> Enter a valid email domain (e.g. user@gmail.com, test domains blocked)</p>
                  )}
                </div>

                <div>
                  <Label>Phone <span className="text-red-500">*</span></Label>
                  <div className="flex gap-2 mt-1">
                    <Select value={data.countryCode || "+91"} onValueChange={(v) => set("countryCode", v)}>
                      <SelectTrigger className="w-[110px] font-mono"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {COUNTRY_CODES.map((c) => (
                          <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input value={data.phone || ""} onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} className="flex-1" placeholder="10-digit mobile" maxLength={10} />
                  </div>
                  {!isPhoneValid && data.phone && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> Must be a valid 10-digit Indian phone (starts with 6-9)</p>
                  )}
                </div>

                <div>
                  <Label>Date of Birth (15+ Years) <span className="text-red-500">*</span></Label>
                  <Input 
                    type="date" 
                    max={maxDate} 
                    value={data.dob || ""} 
                    onChange={(e) => set("dob", e.target.value)} 
                    className="mt-1" 
                  />
                </div>

                <div>
                  <Label htmlFor="gender">Gender / Classification <span className="text-red-500">*</span></Label>
                  <Select value={data.gender || ""} onValueChange={(v) => set("gender", v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select classification" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDER_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                 {data.gender === "Others" && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <Label htmlFor="other-gender">Please Specify <span className="text-red-500">*</span></Label>
                    <Input 
                      id="other-gender"
                      placeholder="Enter your specific classification" 
                      value={otherGenderDetails}
                      onChange={(e) => setOtherGenderDetails(e.target.value)}
                      required 
                    />
                  </div>
                )}

                <div>
                  <Label>Social Category (As per Govt. of India) <span className="text-red-500">*</span></Label>
                  <Select value={data.socialCategory || "UR - Unreserved (General)"} onValueChange={(v) => set("socialCategory", v)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select Social Category" /></SelectTrigger>
                    <SelectContent>
                      {SOCIAL_CATEGORIES.map((sc) => (
                        <SelectItem key={sc} value={sc}>{sc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div><Label>Preferred Language</Label><Select value={data.language || "English"} onValueChange={(v) => set("language", v)}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{INDIAN_LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select></div>
                
                <div className="md:col-span-2 p-5 bg-slate-50 border border-border rounded-xl mt-2 space-y-4">
                  <div className="font-display font-bold text-navy flex items-center gap-2">Geographic Location {pinLookup === "loading" && <Loader2 className="h-4 w-4 animate-spin text-saffron" />}</div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-3">
                      <Label>PIN Code <span className="text-red-500">*</span></Label>
                      <Input value={data.pincode || ""} onChange={(e) => set("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))} className="mt-1 font-mono max-w-[200px]" placeholder="560064" maxLength={6} />
                      {pinLookup === "ok" && <p className="text-xs text-india-green mt-1 font-medium">Details auto-filled</p>}
                      {pinLookup === "error" && <p className="text-xs text-destructive mt-1">Invalid PIN code</p>}
                    </div>
                    <div><Label>State</Label><Input disabled value={data.state || ""} className="mt-1 bg-white" /></div>
                    <div><Label>District</Label><Input disabled value={data.district || ""} className="mt-1 bg-white" /></div>
                    <div><Label>Taluk</Label><Input disabled value={data.taluk || ""} className="mt-1 bg-white" /></div>
                    <div><Label>MP Constituency</Label><Input disabled value={data.mp || ""} className="mt-1 bg-white font-medium" /></div>
                    <div><Label>MLA Constituency</Label><Input disabled value={data.mla || ""} className="mt-1 bg-white font-medium" /></div>
                    <div><Label>Gram Panchayat</Label><Input disabled value={data.gramPanchayat || ""} className="mt-1 bg-white font-medium" /></div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: VERIFY */}
            {STEPS[step].key === "verify" && (
              <div className="max-w-md mx-auto text-center py-6 animate-in fade-in">
                <div className="mx-auto size-14 rounded-full bg-saffron/15 flex items-center justify-center mb-4"><ShieldCheck className="h-7 w-7 text-saffron" /></div>
                <h3 className="font-display text-lg font-bold text-navy">Verify your phone</h3>
                <p className="text-xs text-muted-foreground mt-1">OTP sent to: <b>{data.countryCode || "+91"} {data.phone}</b></p>
                {!otpSent ? (<Button className="mt-6 bg-navy text-white hover:bg-navy/90" onClick={sendOtp}>Send OTP</Button>) : data.otpVerified ? (<div className="mt-6 inline-flex items-center gap-2 text-india-green font-medium"><Check className="h-4 w-4" /> Phone verified</div>) : (<div className="mt-6 space-y-3">
                   <div className="flex justify-center">
                    <InputOTP maxLength={6} value={otpInput} onChange={setOtpInput}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                      </InputOTPGroup>
                    </InputOTP>
                   </div>
                   <div className="flex gap-2 justify-center">
                    <Button onClick={verifyOtp} className="bg-india-green text-white">Verify & Proceed</Button>
                    <Button variant="outline" onClick={sendOtp}>Resend</Button>
                   </div>
                   </div>)}
              </div>
            )}
            
            {/* STEP 3: PASSWORD */}
            {STEPS[step].key === "password" && data.otpVerified && (
              <div className="grid md:grid-cols-2 gap-5 animate-in fade-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto">
                <div className="md:col-span-2">
                  <h3 className="font-display text-lg font-bold text-navy mb-1">Set Your Password</h3>
                  <p className="text-xs text-muted-foreground">Create a strong password to secure your candidate account.</p>
                </div>
                
                <div className="md:col-span-2">
                  <Label>Create Password <span className="text-red-500">*</span></Label>
                  <div className="relative mt-1">
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="Min 8 characters (e.g. BccPass@123)" 
                      className="pr-10" 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-muted-foreground hover:text-navy">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  {/* Dynamic checklist validation */}
                  <div className="mt-3 space-y-1.5 text-xs">
                    <p className={`flex items-center gap-1.5 ${password.length >= 8 ? 'text-india-green font-medium' : 'text-muted-foreground'}`}>
                      {password.length >= 8 ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 text-red-500" />} 
                      At least 8 characters
                    </p>
                    <p className={`flex items-center gap-1.5 ${/[A-Z]/.test(password) ? 'text-india-green font-medium' : 'text-muted-foreground'}`}>
                      {/[A-Z]/.test(password) ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 text-red-500" />} 
                      At least 1 uppercase letter
                    </p>
                    <p className={`flex items-center gap-1.5 ${/[a-z]/.test(password) ? 'text-india-green font-medium' : 'text-muted-foreground'}`}>
                      {/[a-z]/.test(password) ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 text-red-500" />} 
                      At least 1 lowercase letter
                    </p>
                    <p className={`flex items-center gap-1.5 ${/\d/.test(password) ? 'text-india-green font-medium' : 'text-muted-foreground'}`}>
                      {/\d/.test(password) ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 text-red-500" />} 
                      At least 1 number
                    </p>
                    <p className={`flex items-center gap-1.5 ${/[@$!%*?&._-]/.test(password) ? 'text-india-green font-medium' : 'text-muted-foreground'}`}>
                      {/[@$!%*?&._-]/.test(password) ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 text-red-500" />} 
                      At least 1 special character (@$!%*?&._-)
                    </p>
                  </div>
                </div>
                
                <div className="md:col-span-2 mt-2">
                  <Label>Confirm Password <span className="text-red-500">*</span></Label>
                  <div className="relative mt-1">
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      placeholder="Re-enter password" 
                      className="pr-10" 
                    />
                  </div>
                  {confirmPassword.length > 0 && password !== confirmPassword && (
                    <p className="text-xs text-red-500 mt-2 flex items-center gap-1.5"><AlertCircle className="h-3.5 w-3.5" /> Passwords do not match</p>
                  )}
                  {confirmPassword.length > 0 && password === confirmPassword && isPasswordValid && (
                    <p className="text-xs text-india-green mt-2 font-medium flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Passwords match and meet all security rules</p>
                  )}
                </div>
              </div>
            )}

            {/* STEP 4: EDUCATION */}
            {STEPS[step].key === "education" && (() => {
              const q = data.qualification || "";
              const isSchool = ["Below 10th / SSLC", "10th Std / SSLC"].includes(q);
              const is12th = q === "12th Std / 2nd PUC / Intermediate";
              const isIti = q === "ITI"; 
              const isDiploma = q === "Diploma";
              const isUg = q === "UG - Undergraduate Degree"; 
              const isPg = q === "PG - Postgraduate Degree";
              const isEngineering = q === "BE / B-Tech" || q === "ME / M-Tech";
              const isPhd = q === "PHD";
              const isShortTerm = q === "Short Term Courses";
              
              const instIsOther = data.institution === "__other__"; const courseIsOther = data.course === "__other__"; const specIsOther = data.specialization === "__other__";
              
              const dynamicUgSpecializations = isUg && data.course && UG_MAPPING[data.course] ? UG_MAPPING[data.course] : GENERIC_SPECIALIZATIONS;
              const dynamicPgSpecializations = isPg && data.course && PG_MAPPING[data.course] ? PG_MAPPING[data.course] : GENERIC_SPECIALIZATIONS;
              const currentSpecializations = isUg ? dynamicUgSpecializations : isPg ? dynamicPgSpecializations : GENERIC_SPECIALIZATIONS;

              return (
                <div className="grid md:grid-cols-2 gap-5 animate-in fade-in">
                  <div>
                    <Label>Highest Qualification (Category) <span className="text-red-500">*</span></Label>
                    <Select value={data.qualification || ""} onValueChange={(v) => { set("qualification", v); set("institution", ""); set("specialization", ""); set("course", ""); set("stateBoardName", ""); }}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select Qualification" /></SelectTrigger>
                      <SelectContent>{HIGHEST_QUALS.map((qq) => <SelectItem key={qq} value={qq}>{qq}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Year of Passing <span className="text-red-500">*</span></Label>
                    <Input 
                      value={data.yearOfPassing || ""} 
                      onChange={(e) => set("yearOfPassing", e.target.value.replace(/\D/g, "").slice(0, 4))} 
                      className="mt-1 font-mono" 
                      placeholder="e.g. 2024" 
                      maxLength={4} 
                    />
                    {!isYopValid && data.yearOfPassing && (
                      <p className="text-xs text-red-500 mt-1">Enter a valid 4-digit passing year (1970 - {new Date().getFullYear() + 6})</p>
                    )}
                  </div>

                  {isSchool && (
                    <>
                      <div><Label>Board <span className="text-red-500">*</span></Label><Select value={data.institution || ""} onValueChange={(v) => set("institution", v)}><SelectTrigger className="mt-1"><SelectValue placeholder="Select board" /></SelectTrigger><SelectContent>{BOARDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select></div>
                      {data.institution === "State Board" && (<div><Label>Select State <span className="text-red-500">*</span></Label><Select value={data.stateBoardName || ""} onValueChange={(v) => set("stateBoardName", v)}><SelectTrigger className="mt-1"><SelectValue placeholder="Select state" /></SelectTrigger><SelectContent>{STATE_BOARDS_LIST.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select></div>)}
                      <div className={data.institution === "State Board" ? "md:col-span-2" : ""}><Label>School Name <span className="text-red-500">*</span></Label><Input className="mt-1" value={data.schoolName || ""} onChange={(e) => set("schoolName", e.target.value)} placeholder="e.g. Govt High School" /></div>
                    </>
                  )}

                  {is12th && (
                    <>
                      <div><Label>Intermediate Stream <span className="text-red-500">*</span></Label><Select value={data.specialization || ""} onValueChange={(v) => set("specialization", v)}><SelectTrigger className="mt-1"><SelectValue placeholder="Select Stream" /></SelectTrigger><SelectContent>{["Science (PCMB / PCMC)", "Commerce (EBACS / ABMS)", "Arts / Humanities", "Vocational"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
                      <div><Label>College / Institution Name <span className="text-red-500">*</span></Label><Input className="mt-1" value={data.institution || ""} onChange={(e) => set("institution", e.target.value)} placeholder="e.g. MES PU College" /></div>
                    </>
                  )}

                  {(isIti || isDiploma) && (
                    <>
                      <div className="md:col-span-2"><Label>{isIti ? "ITI Trade *" : "Diploma Stream *"}</Label><Select value={data.specialization || ""} onValueChange={(v) => set("specialization", v)}><SelectTrigger className="mt-1"><SelectValue placeholder="Select stream/trade" /></SelectTrigger><SelectContent>{(isIti ? ITI_TRADES : DIPLOMA_STREAMS).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}<SelectItem value="__other__">Other</SelectItem></SelectContent></Select>{specIsOther && <Input className="mt-2" value={data.specializationOther || ""} onChange={(e) => set("specializationOther", e.target.value)} />}</div>
                      <div className="md:col-span-2"><Label>Institute Name <span className="text-red-500">*</span></Label><Input className="mt-1" value={data.institution || ""} onChange={(e) => set("institution", e.target.value)} placeholder="e.g. Govt Polytechnic" /></div>
                    </>
                  )}

                  {(isUg || isPg || isEngineering) && (
                    <>
                      <div className="md:col-span-2"><Label>College / University <span className="text-red-500">*</span></Label><Select value={data.institution || ""} onValueChange={(v) => set("institution", v)}><SelectTrigger className="mt-1"><SelectValue placeholder="Select college" /></SelectTrigger><SelectContent>{UNIVERSITIES.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select></div>
                      <div><Label>Course <span className="text-red-500">*</span></Label><Select value={data.course || ""} onValueChange={(v) => { set("course", v); set("specialization", ""); }}><SelectTrigger className="mt-1"><SelectValue placeholder="Select course" /></SelectTrigger><SelectContent>{(isUg ? UG_COURSES : isPg ? PG_COURSES : BE_ME_COURSES).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}<SelectItem value="__other__">Other</SelectItem></SelectContent></Select>{courseIsOther && <Input className="mt-2" value={data.courseOther || ""} onChange={(e) => set("courseOther", e.target.value)} />}</div>
                      <div><Label>Specialization / Domain <span className="text-red-500">*</span></Label><Select value={data.specialization || ""} onValueChange={(v) => set("specialization", v)}><SelectTrigger className="mt-1"><SelectValue placeholder="Select specialization" /></SelectTrigger><SelectContent>{currentSpecializations.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}<SelectItem value="__other__">Other</SelectItem></SelectContent></Select>{specIsOther && <Input className="mt-2" value={data.specializationOther || ""} onChange={(e) => set("specializationOther", e.target.value)} />}</div>
                    </>
                  )}

                  {isPhd && (
                    <>
                      <div><Label>Research Field / Subject <span className="text-red-500">*</span></Label><Input className="mt-1" value={data.specialization || ""} onChange={(e) => set("specialization", e.target.value)} placeholder="e.g. Artificial Intelligence" /></div>
                      <div><Label>University / Institute <span className="text-red-500">*</span></Label><Input className="mt-1" value={data.institution || ""} onChange={(e) => set("institution", e.target.value)} placeholder="e.g. IISc Bengaluru" /></div>
                    </>
                  )}

                  {isShortTerm && (
                    <>
                      <div><Label>Training Course Name <span className="text-red-500">*</span></Label><Input className="mt-1" value={data.course || ""} onChange={(e) => set("course", e.target.value)} placeholder="e.g. Full Stack Web Dev (NSQF Level 5)" /></div>
                      <div><Label>Training Institute <span className="text-red-500">*</span></Label><Input className="mt-1" value={data.institution || ""} onChange={(e) => set("institution", e.target.value)} placeholder="e.g. NSDC Partner" /></div>
                    </>
                  )}

                  <div>
                    <Label>Mark Scoring Mode</Label>
                    <Select value={scoreType} onValueChange={(v: any) => setScoreType(v)}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="cgpa">CGPA (Max 10.0)</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input 
                      className="mt-2 font-mono"
                      placeholder={scoreType === "percentage" ? "e.g. 85%" : "e.g. 8.5"}
                      value={data.percentage || ""}
                      onChange={(e) => {
                        let val = e.target.value.replace(/[^0-9.]/g, "");
                        const parts = val.split('.');
                        if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
                        
                        if (scoreType === "percentage" && Number(val) > 100) {
                          toast.error("Percentage cannot exceed 100%");
                          return;
                        }
                        if (scoreType === "cgpa" && Number(val) > 10) {
                          toast.error("CGPA cannot exceed 10.0");
                          return;
                        }
                        set("percentage", val);
                      }}
                    />
                  </div>

                  <div className="md:col-span-2 pt-2"><Label className="block mb-2">Languages you speak</Label><div className="flex flex-wrap gap-2">{INDIAN_LANGUAGES.map((l) => { const on = data.languagesFluent?.includes(l); return <Badge key={l} onClick={() => toggleArr("languagesFluent", l)} className={`cursor-pointer px-3 py-1 ${on ? "bg-india-green text-white" : "bg-slate-100 text-slate-700"}`}>{l}</Badge>; })}</div></div>
                </div>
              );
            })()}

            {/* STEP 5: SKILLS */}
            {STEPS[step].key === "skills" && (() => {
              const query = skillSearch.trim().toLowerCase();
              const filtered = query ? NSQF_SKILLS.filter((s) => s.toLowerCase().includes(query)) : NSQF_SKILLS;
              return (
                <div className="animate-in fade-in">
                  <Label className="mb-2 block">Skills <span className="text-red-500">*</span> (Select or type valid professional skills)</Label>
                  <div className="flex gap-2 mb-4">
                    <Input 
                      value={skillSearch} 
                      onChange={(e) => setSkillSearch(e.target.value)} 
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); validateAndAddSkill(skillSearch); } }} 
                      placeholder="e.g. Python, React, Accounting, Welding" 
                    />
                    <Button onClick={() => validateAndAddSkill(skillSearch)} disabled={!skillSearch.trim()} className="bg-navy text-white">Add</Button>
                  </div>
                  {(data.skills?.length || 0) > 0 && (<div className="mb-4"><div className="text-xs font-medium text-navy mb-2">Your selected skills</div><div className="flex flex-wrap gap-2">{data.skills!.map((s) => <Badge key={s} className="bg-saffron text-navy px-3 py-1"><Check className="h-3 w-3 mr-1" /> {s} <X className="h-3 w-3 ml-2 cursor-pointer" onClick={() => toggleArr("skills", s)}/></Badge>)}</div></div>)}
                  <div><div className="text-xs font-medium text-muted-foreground mb-2">Suggested professional skills</div><div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto">{filtered.map((s) => { const on = data.skills?.includes(s); return <Badge key={s} onClick={() => on ? toggleArr("skills", s) : validateAndAddSkill(s)} className={`cursor-pointer ${on ? "bg-india-green text-white" : "bg-muted text-navy"}`}>{s}</Badge>; })}</div></div>
                </div>
              );
            })()}

            {/* STEP 6: EXPERIENCE */}
            {STEPS[step].key === "experience" && (
              <div className="grid md:grid-cols-2 gap-4 animate-in fade-in">
                <div className="md:col-span-2"><Label>Experience Type <span className="text-red-500">*</span></Label><div className="mt-2 flex gap-3">{(["Fresher","Experienced"] as const).map((t) => (<button key={t} onClick={() => set("experienceType", t)} className={`flex-1 p-4 rounded-lg border text-left ${data.experienceType === t ? "border-navy bg-navy/5" : "border-border"}`}><div className="font-medium text-navy">{t}</div></button>))}</div></div>
                {data.experienceType === "Experienced" && (
                  <>
                    <div className="md:col-span-2 -mb-1 mt-2"><h4 className="font-display font-semibold text-navy text-sm">Current Employment Details</h4></div>
                    <div>
                      <Label>Total Years Experience *</Label>
                      <Input 
                        value={data.yearsOfExperience || ""} 
                        onChange={(e) => set("yearsOfExperience", e.target.value.replace(/[^0-9.]/g, "").slice(0, 4))} 
                        className="mt-1 font-mono" 
                        placeholder="e.g. 2.5" 
                      />
                    </div>
                    <div><Label>Employment Status</Label><Select value={data.employmentStatus || ""} onValueChange={(v) => set("employmentStatus", v)}><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{["Currently employed","Serving notice period","Not employed"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
                    <div><Label>Current Job Title *</Label><Input value={data.currentRole || ""} onChange={(e) => set("currentRole", e.target.value)} className="mt-1" placeholder="e.g. Software Engineer" /></div>
                    <div><Label>Current Company *</Label><Input value={data.currentCompany || ""} onChange={(e) => set("currentCompany", e.target.value)} className="mt-1" placeholder="e.g. Infosys" /></div>
                  </>
                )}
              </div>
            )}

            {/* STEP 7: RESUME & CERTIFICATIONS */}
            {STEPS[step].key === "resume" && (
              <div className="py-4 animate-in fade-in space-y-6">
                <div>
                  <Label className="block mb-2">Resume Upload (.pdf, .doc, .docx only) <span className="text-red-500">*</span></Label>
                  <label className="block border-2 border-dashed border-navy/30 rounded-xl p-8 text-center hover:bg-navy/5 cursor-pointer">
                    <Upload className="h-10 w-10 mx-auto text-navy" />
                    <div className="mt-3 font-medium text-navy">{data.resumeFileName || "Upload your Resume"}</div>
                    <input 
                      type="file" 
                      accept=".pdf,.doc,.docx" 
                      className="hidden" 
                      onChange={(e) => { 
                        const f = e.target.files?.[0]; 
                        if (f) { 
                          const ext = f.name.split('.').pop()?.toLowerCase();
                          if (!['pdf', 'doc', 'docx'].includes(ext || '')) {
                            return toast.error("Only PDF and Word documents (.pdf, .doc, .docx) are allowed!");
                          }
                          if (f.size > 5 * 1024 * 1024) {
                            return toast.error("File size cannot exceed 5MB!");
                          }
                          set("resumeFileName", f.name); 
                          toast.success("Resume attached successfully"); 
                        } 
                      }} 
                    />
                  </label>
                </div>

                <div className="mt-6 border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-navy text-sm">Additional Certifications</h4>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const list = data.certifications || [];
                        set("certifications", [...list, { title: "", fileName: "" }]);
                      }}
                    >
                      + Add Certification
                    </Button>
                  </div>

                  {(data.certifications || []).map((cert: any, index: number) => (
                    <div key={index} className="p-3 bg-slate-50 border rounded-lg mt-3 space-y-2">
                      <Input 
                        placeholder="Certification Title (e.g. AWS Certified Developer)" 
                        value={cert.title} 
                        onChange={(e) => {
                          const updated = [...(data.certifications || [])];
                          updated[index].title = e.target.value;
                          set("certifications", updated);
                        }}
                      />
                      <input 
                        type="file" 
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const ext = file.name.split('.').pop()?.toLowerCase();
                            if (!['pdf', 'doc', 'docx'].includes(ext || '')) {
                              return toast.error("Only PDF and Word documents are allowed!");
                            }
                            const updated = [...(data.certifications || [])];
                            updated[index].fileName = file.name;
                            set("certifications", updated);
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 8: PREFERENCES */}
            {STEPS[step].key === "preferences" && (
              <div className="grid md:grid-cols-2 gap-4 animate-in fade-in">
                <div className="md:col-span-2">
                  <Label>Preferred Roles <span className="text-red-500">*</span></Label>
                  <div className="flex gap-2 mt-1">
                    <Input 
                      placeholder="Type a role (e.g. Software Engineer) and press Add" 
                      id="role-input"
                      onKeyDown={(e) => { 
                        if (e.key === "Enter") { 
                          e.preventDefault(); 
                          validateAndAddRole(e.currentTarget.value);
                          e.currentTarget.value = ""; 
                        } 
                      }} 
                    />
                    <Button 
                      type="button" 
                      className="bg-navy text-white"
                      onClick={() => {
                        const inputEl = document.getElementById("role-input") as HTMLInputElement;
                        if (inputEl && inputEl.value) {
                          validateAndAddRole(inputEl.value);
                          inputEl.value = "";
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  
                  <div className="mt-2">
                    <span className="text-xs text-muted-foreground block mb-1.5">Common professional roles (click to add):</span>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-50 border rounded-lg">
                      {COMMON_ROLES.map((role) => {
                        const isSelected = (data.preferredRoles || []).includes(role);
                        return (
                          <Badge 
                            key={role} 
                            onClick={() => !isSelected && validateAndAddRole(role)}
                            className={`cursor-pointer text-xs py-1 px-2.5 ${isSelected ? "bg-india-green text-white" : "bg-white border text-navy hover:bg-slate-100"}`}
                          >
                            {isSelected ? <Check className="h-3 w-3 mr-1" /> : "+ "} {role}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  {(data.preferredRoles?.length || 0) > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {data.preferredRoles!.map((r) => (
                        <Badge key={r} className="bg-navy text-white px-3 py-1">
                          {r} <X className="h-3 w-3 ml-2 cursor-pointer" onClick={() => set("preferredRoles", data.preferredRoles!.filter((x) => x !== r))}/>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 mt-2"><Label>Preferred Work Locations <span className="text-red-500">*</span></Label><div className="flex flex-wrap gap-2 mt-2">{["Bengaluru","Mysuru","Hubballi","Mangaluru","Remote"].map((l) => { const on = data.preferredLocations?.includes(l); return <Badge key={l} onClick={() => toggleArr("preferredLocations", l)} className={`cursor-pointer ${on ? "bg-navy text-white" : "bg-slate-100 text-slate-700"}`}>{l}</Badge>; })}</div></div>
                <label className="md:col-span-2 flex items-center gap-2 mt-1 bg-saffron/10 border p-3 rounded-lg"><Checkbox checked={!!data.willingToRelocate} onCheckedChange={(v) => set("willingToRelocate", !!v)} /> <span className="font-medium text-navy">Willing to relocate anywhere in India</span></label>
                <div><Label>Job Type <span className="text-red-500">*</span></Label><Select value={data.preferredJobType || ""} onValueChange={(v) => set("preferredJobType", v)}><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{["Full-time","Internship","Contract"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                <div>
                  <Label>Expected Salary (LPA)</Label>
                  <Input 
                    value={data.expectedSalary || ""} 
                    onChange={(e) => set("expectedSalary", e.target.value.replace(/[^0-9.]/g, "").slice(0, 5))} 
                    className="mt-1 font-mono" 
                    placeholder="e.g. 4.5" 
                  />
                </div>
              </div>
            )}

            {/* STEP 9: REVIEW */}
            {STEPS[step].key === "review" && (
              <div className="space-y-6 animate-in fade-in">
                <ReviewSection title="Basic Information"><ReviewRow label="Full Name" value={data.fullName} /><ReviewRow label="Email" value={data.email} /><ReviewRow label="Phone" value={`${data.countryCode || "+91"} ${data.phone}`} /><ReviewRow label="Gender" value={data.gender === "Others" ? otherGenderDetails : data.gender} /><ReviewRow label="Social Category" value={data.socialCategory} /><ReviewRow label="PIN Code" value={data.pincode} /></ReviewSection>
                <ReviewSection title="Education"><ReviewRow label="Qualification" value={data.qualification} /><ReviewRow label="Institution" value={data.institution === "State Board" ? `${data.stateBoardName} State Board` : data.institution} /><ReviewRow label="Course/Stream" value={data.course || data.specialization} /><ReviewRow label="Year of Passing" value={data.yearOfPassing} /></ReviewSection>
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between gap-3 pt-6 border-t border-border">
            <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
            {step < STEPS.length - 1 ? (<Button disabled={!canNext} onClick={handleNextStep} className="bg-navy hover:bg-navy/90 text-white px-8">Next <ArrowRight className="h-4 w-4 ml-1" /></Button>) : (<Button onClick={finish} disabled={isSubmitting} className="bg-saffron text-navy px-8 font-semibold">{isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-1" />} {isSubmitting ? "Creating..." : "Create Account"}</Button>)}
          </div>

        </Card>
      </div>

      <Dialog open={!!done} onOpenChange={(o) => { if (!o && done) navigate({ to: "/auth/login" }); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto size-16 rounded-full bg-india-green/15 flex items-center justify-center mb-4"><Check className="h-8 w-8 text-india-green" /></div>
            <DialogTitle className="text-center text-2xl font-display text-navy">Welcome to Bharat Career Connect!</DialogTitle>
            <DialogDescription className="text-center pt-2">Your candidate account is ready.<br />Unique Candidate ID: <b className="text-navy font-mono bg-navy/5 px-2 py-1 rounded ml-1">{done?.uniqueId}</b></DialogDescription>
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
