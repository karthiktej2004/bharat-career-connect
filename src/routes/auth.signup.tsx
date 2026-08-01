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
import { setSession, NSQF_SKILLS, INDIAN_LANGUAGES, type CandidateProfile } from "@/lib/mockStore";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Upload, ShieldCheck, Sparkles, GraduationCap, Briefcase, FileText, Target, User as UserIcon, X, Eye, EyeOff, Loader2, AlertCircle, MapPin } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({ meta: [{ title: "Register as Candidate — Bharat Career Connect" }] }),
  component: SignupPage,
});

// Helper for Name Capitalization
const formatName = (val: string) => {
  return val.replace(/[^a-zA-Z\s]/g, "").replace(/\b\w/g, (char) => char.toUpperCase());
};

const DISABILITIES_LIST = [
  "Blindness", "Low-vision", "Leprosy Cured persons", "Hearing Impairment", "Locomotor Disability",
  "Dwarfism", "Intellectual Disability", "Mental Illness", "Autism Spectrum Disorder", "Cerebral Palsy",
  "Muscular Dystrophy", "Chronic Neurological conditions", "Specific Learning Disabilities", "Multiple Sclerosis",
  "Speech and Language disability", "Thalassemia", "Hemophilia", "Sickle cell disease",
  "Multiple Disabilities including deaf-blindness", "Acid Attack victims", "Parkinson’s disease", "All the above", "Others"
];

const OPPORTUNITIES_LIST = [
  "Skill Training Opportunities", "Internship Opportunities", "Apprenticeship Opportunities", "Job Opportunities", "No Preference - Open for all"
];

const HEAR_ABOUT_US_LIST = [
  "Search Engine", "Social Media", "E-mail_campaign", "Newsletter", "SMS", "Website Direct", "Blog Article",
  "Online ad", "Video ad", "University College", "Newspaper Print", "Television", "FM Radio", "Flyer Poster",
  "Bus Announcement", "Railway Announcement", "Job Fair Event", "Referral Friend", "Employer Outreach",
  "Field Partner", "Walk-in", "Community Group", "Alumni Network", "Other"
];

const SOCIAL_MEDIA_LIST = ["WhatsApp", "Instagram", "Facebook", "Telegram", "YouTube", "LinkedIn", "X"];

const INDIAN_STATES_LIST = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep", "Delhi", "Puducherry", "Ladakh", "Jammu and Kashmir"
];

type AddressData = {
  country: string; pincode: string; state: string; district: string; taluk: string;
  mla: string; mp: string; residentType: string; ulb: string; ward: string;
  grampanchayat: string; village: string; locality: string; fullAddress: string;
};

const initialAddress: AddressData = {
  country: "India", pincode: "", state: "", district: "", taluk: "", mla: "", mp: "",
  residentType: "", ulb: "", ward: "", grampanchayat: "", village: "", locality: "", fullAddress: ""
};

type Data = Partial<CandidateProfile> & { 
  password?: string; otp?: string; otpVerified?: boolean; 
  aadhaar?: string; hasDisability?: string; disabilities?: string[];
  currentAddress?: AddressData; permanentAddress?: AddressData; sameAsCurrent?: boolean;
  educationStatus?: string;
  institutionOther?: string; course?: string; courseOther?: string; 
  specializationOther?: string; schoolName?: string; stateBoardName?: string;
  countryCode?: string; socialCategory?: string;
  certifications?: Array<{ title: string; fileName: string }>;
  gender?: string;
  expYears?: string; expMonths?: string;
  opportunities?: string[]; hearAboutUs?: string; socialMediaPlatform?: string; hearAboutOther?: string;
  referralCode?: string;
  tncAccepted?: boolean; declarationAccepted?: boolean;
};

const STEPS = [
  { key: "basic", label: "Basic Info", icon: UserIcon },
  { key: "address", label: "Address", icon: MapPin },
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
  "Below 10th / SSLC", "10th / SSLC", "ITI", "12th STD / 2nd PUC / Intermidate", 
  "Diploma", "UG Degree", "PG Degree", "B.E / B.Tech", "M.E / M. Tech", "PhD", 
  "Short Term Training (STT)", "Others"
];

function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Data>({ 
    language: "English", experienceType: "Fresher", 
    certifications: [], skills: [], languagesFluent: ["English"], 
    preferredRoles: [], preferredLocations: [], opportunities: [], disabilities: [],
    countryCode: "+91", socialCategory: "UR - Unreserved (General)", gender: "",
    currentAddress: { ...initialAddress }, permanentAddress: { ...initialAddress }, sameAsCurrent: false,
    expYears: "0", expMonths: "0"
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
  const [aadhaarFocused, setAadhaarFocused] = useState(false);

  // Auto-calculate age from DOB
  const calculatedAge = useMemo(() => {
    if (!data.dob) return null;
    const diff = new Date().getTime() - new Date(data.dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }, [data.dob]);

  const maxDate = new Date(new Date().setFullYear(new Date().getFullYear() - 15)).toISOString().split('T')[0];

  const isNameValid = useMemo(() => {
    if (!data.fullName) return true;
    return /^[a-zA-Z\s]{2,60}$/.test(data.fullName.trim());
  }, [data.fullName]);

  const isEmailValid = useMemo(() => {
    if (!data.email) return true;
    const cleanEmail = data.email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|org|net|edu|gov|co|io)$/i;
    return emailRegex.test(cleanEmail);
  }, [data.email]);

  const isPhoneValid = useMemo(() => {
    if (!data.phone) return true;
    const cleanPhone = data.phone.replace(/\D/g, "");
    return cleanPhone.length === 10 && /^[6-9]\d{9}$/.test(cleanPhone);
  }, [data.phone]);

  const isYopValid = useMemo(() => {
    if (!data.yearOfPassing) return true;
    const yop = Number(data.yearOfPassing);
    return !isNaN(yop) && yop >= 1970 && yop <= new Date().getFullYear() + 6;
  }, [data.yearOfPassing]);

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

  const set = <K extends keyof Data>(k: K, v: Data[K]) => setData((d) => ({ ...d, [k]: v }));
  const toggleArr = (k: "skills" | "languagesFluent" | "preferredRoles" | "preferredLocations" | "opportunities" | "disabilities", v: string) => { 
    setData((d) => { const arr = (d[k] as any[]) || []; return { ...d, [k]: arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v] }; }); 
  };

  const updateAddress = (type: "currentAddress" | "permanentAddress", field: keyof AddressData, val: string) => {
    setData((d) => {
      const addr = { ...d[type] as AddressData, [field]: val };
      if (field === 'pincode' && val.length === 6) {
        if (val === "560064") {
          addr.state = "Karnataka"; addr.district = "Bengaluru Urban"; addr.taluk = "Yelahanka"; 
          addr.mla = "Yelahanka"; addr.mp = "Chikkaballapur";
        }
      }
      return { ...d, [type]: addr };
    });
  };

  const canNext = useMemo(() => {
    switch (STEPS[step].key) {
      case "basic": 
        const basicOk = !!(data.fullName && isNameValid && data.email && isEmailValid && data.phone && isPhoneValid && data.dob && data.gender && data.hasDisability);
        if(data.gender === "Others" && !otherGenderDetails.trim()) return false;
        if(data.hasDisability === "Yes" && (!data.disabilities || data.disabilities.length === 0)) return false;
        if(data.aadhaar && data.aadhaar.length > 0 && data.aadhaar.length !== 12) return false;
        return basicOk;
      case "address":
        const curr = data.currentAddress;
        if(!curr?.pincode || curr.pincode.length !== 6 || !curr.state || !curr.district || !curr.fullAddress) return false;
        if(curr.residentType === "Urban Resident" && (!curr.ulb || !curr.ward)) return false;
        if(curr.residentType === "Rural Resident" && (!curr.grampanchayat || !curr.village)) return false;
        if(!data.sameAsCurrent) {
          const perm = data.permanentAddress;
          if(!perm?.pincode || perm.pincode.length !== 6 || !perm.state || !perm.district || !perm.fullAddress) return false;
        }
        return true;
      case "verify": return !!data.otpVerified;
      case "password": return isPasswordValid;
      case "education": return !!(data.educationStatus && data.qualification && data.yearOfPassing && isYopValid);
      case "skills": return (data.skills?.length || 0) >= 1 && (data.languagesFluent?.length || 0) >= 1;
      case "experience": return !!data.experienceType;
      case "resume": return true; 
      case "preferences": 
        return (data.opportunities?.length || 0) >= 1 && (data.preferredLocations?.length || 0) >= 1 && !!data.hearAboutUs;
      case "review": 
        return true; // We validate the checkboxes actively during the finish() click now
    }
  }, [step, data, isPasswordValid, isNameValid, isEmailValid, isPhoneValid, isYopValid, otherGenderDetails]);

  const completion = useMemo(() => {
    const fields = [
      Boolean(data.fullName?.trim()), Boolean(data.email?.trim()), Boolean(data.phone?.trim()),
      Boolean(data.currentAddress?.pincode), Boolean(data.qualification?.trim()),
      (data.skills?.length || 0) > 0, data.experienceType === "Experienced" ? Boolean(data.currentRole?.trim()) : true,
      (data.preferredLocations?.length || 0) > 0, Boolean(data.tncAccepted && data.declarationAccepted)
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
    if (trimmed.length < 2 || trimmed.length > 40) return toast.error("Skill name must be between 2 and 40 characters.");
    const currentSkills = data.skills || [];
    if (!currentSkills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      set("skills", [...currentSkills, trimmed]);
      toast.success(`Added skill: ${trimmed}`);
    } else {
      toast.error("Skill already added.");
    }
    setSkillSearch("");
  }

  async function finish() {
    // Explicit Validation Check
    if (!data.tncAccepted || !data.declarationAccepted) {
      toast.error("Please accept the Terms & Conditions and Declaration to proceed.");
      return;
    }

    setIsSubmitting(true);
    
    const finalExp = data.experienceType === "Experienced" ? `${data.expYears || "0"}.${data.expMonths || "0"}` : "0.0";
    const finalGender = data.gender === "Others" ? otherGenderDetails : data.gender;

    const payload = {
      ...data,
      password,
      gender: finalGender,
      experience: finalExp,
      fullName: data.fullName?.trim() || "",
    };

    try {
      // Secure processing constraint handler
      if (payload.aadhaar) {
        payload.aadhaar = "[Aadhaar Redacted]"; 
      }

      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://15.207.249.155:5000";

      const res = await fetch(`${baseUrl}/api/auth/candidate/register`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(payload)
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setSession({ id: json.uniqueId, name: payload.fullName, email: payload.email, role: "candidate" });
        setDone({ uniqueId: json.uniqueId } as CandidateProfile);
        toast.success("Account securely created!");
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
     if (STEPS[step].key === 'password') { if(!validatePassword()) return; }
     if (STEPS[step].key === 'preferences' && data.referralCode) {
         if (!/^[a-zA-Z0-9-]{6,20}$/.test(data.referralCode)) {
             return toast.error("Invalid Referral Code. Please check and try again.");
         }
     }
     setStep((s) => s + 1);
  };

  const renderAddressSection = (type: "currentAddress" | "permanentAddress", title: string) => {
    const addr = data[type] as AddressData;
    return (
      <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-border">
        <h4 className="font-display font-bold text-navy">{title}</h4>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div><Label>Country</Label><Input disabled value={addr.country} className="mt-1 bg-white" /></div>
          <div>
            <Label>PIN Code <span className="text-red-500">*</span></Label>
            <Input value={addr.pincode} onChange={(e) => updateAddress(type, "pincode", e.target.value.replace(/\D/g, "").slice(0, 6))} className="mt-1 font-mono" placeholder="6 digits" maxLength={6} />
          </div>
          <div>
            <Label>State / UT <span className="text-red-500">*</span></Label>
            <Select value={addr.state} onValueChange={(v) => updateAddress(type, "state", v)}>
              <SelectTrigger className="mt-1 bg-white"><SelectValue placeholder="Select State" /></SelectTrigger>
              <SelectContent>{INDIAN_STATES_LIST.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>District <span className="text-red-500">*</span></Label><Input value={addr.district} onChange={(e) => updateAddress(type, "district", e.target.value)} className="mt-1 bg-white" /></div>
          <div><Label>Taluk <span className="text-red-500">*</span></Label><Input value={addr.taluk} onChange={(e) => updateAddress(type, "taluk", e.target.value)} className="mt-1 bg-white" /></div>
          
          <div><Label>MLA Constituency</Label><Input value={addr.mla} onChange={(e) => updateAddress(type, "mla", e.target.value)} className="mt-1 bg-white" placeholder="Autocomplete/Manual" /></div>
          <div><Label>MP Constituency</Label><Input value={addr.mp} onChange={(e) => updateAddress(type, "mp", e.target.value)} className="mt-1 bg-white" placeholder="Autocomplete/Manual" /></div>
          
          <div className="sm:col-span-2 md:col-span-3 border-t pt-3 mt-1">
            <Label>Resident Type <span className="text-red-500">*</span></Label>
            <Select value={addr.residentType} onValueChange={(v) => updateAddress(type, "residentType", v)}>
              <SelectTrigger className="mt-1 bg-white w-full sm:w-64"><SelectValue placeholder="Urban or Rural" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Urban Resident">Urban Resident</SelectItem>
                <SelectItem value="Rural Resident">Rural Resident</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {addr.residentType === "Urban Resident" && (
            <>
              <div><Label>ULB List <span className="text-red-500">*</span></Label><Input value={addr.ulb} onChange={(e) => updateAddress(type, "ulb", e.target.value)} className="mt-1 bg-white" placeholder="Enter ULB" /></div>
              <div><Label>Wards List <span className="text-red-500">*</span></Label><Input value={addr.ward} onChange={(e) => updateAddress(type, "ward", e.target.value)} className="mt-1 bg-white" placeholder="Enter Ward" /></div>
            </>
          )}

          {addr.residentType === "Rural Resident" && (
            <>
              <div><Label>Grampanchayat <span className="text-red-500">*</span></Label><Input value={addr.grampanchayat} onChange={(e) => updateAddress(type, "grampanchayat", e.target.value)} className="mt-1 bg-white" placeholder="Enter Grampanchayat" /></div>
              <div><Label>Village <span className="text-red-500">*</span></Label><Input value={addr.village} onChange={(e) => updateAddress(type, "village", e.target.value)} className="mt-1 bg-white" placeholder="Enter Village" /></div>
            </>
          )}

          <div className="sm:col-span-2 md:col-span-3">
            <Label>Locality / Area Name</Label>
            <Input value={addr.locality} onChange={(e) => updateAddress(type, "locality", e.target.value)} className="mt-1 bg-white" placeholder="Detailed Locality" />
          </div>
          <div className="sm:col-span-2 md:col-span-3">
            <Label>Full Address <span className="text-red-500">*</span></Label>
            <Input value={addr.fullAddress} onChange={(e) => updateAddress(type, "fullAddress", e.target.value)} maxLength={250} className="mt-1 bg-white" placeholder="Max 250 chars" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col hero-gradient">
      <TricolorBar />
      <div className="p-4"><Button asChild variant="ghost" size="sm" className="text-navy hover:bg-navy/5"><Link to="/"><ArrowLeft className="h-4 w-4 mr-1" /> Back to home</Link></Button></div>
      <div className="flex-1 flex items-center justify-center p-4 py-6">
        <Card className="w-full max-w-4xl p-6 md:p-8 shadow-elegant border-border/60 bg-white">
          <div className="flex justify-center mb-4"><Logo /></div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-navy text-center">Candidate Registration</h1>
          <p className="text-sm text-muted-foreground text-center mt-1">Complete all steps — your account is created at the end.</p>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-2"><span className="text-xs font-bold text-navy">Step {step + 1} of {STEPS.length} — {STEPS[step].label}</span><span className="text-xs font-bold text-india-green">{completion}% profile</span></div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-india-green transition-all duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} /></div>
            <div className="hidden md:flex mt-4 gap-2 overflow-x-auto pb-2 scrollbar-hide">
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
                  <Label>Name (First / Middle / Last) <span className="text-red-500">*</span></Label>
                  <Input 
                    value={data.fullName || ""} 
                    onChange={(e) => set("fullName", formatName(e.target.value))} 
                    className="mt-1" placeholder="Letters only (e.g. Rahul Kumar Sharma)" 
                  />
                  {!isNameValid && data.fullName && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> Min 2 letters, no numbers/special chars</p>}
                </div>

                <div>
                  <Label>Date of Birth <span className="text-red-500">*</span></Label>
                  <div className="flex gap-2 mt-1">
                    <Input type="date" max={maxDate} value={data.dob || ""} onChange={(e) => set("dob", e.target.value)} className="flex-1" />
                    {calculatedAge !== null && <div className="px-3 py-2 bg-slate-100 border rounded-md text-sm text-navy whitespace-nowrap">{calculatedAge} yrs</div>}
                  </div>
                </div>

                <div>
                  <Label>Gender <span className="text-red-500">*</span></Label>
                  <Select value={data.gender || ""} onValueChange={(v) => set("gender", v)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {data.gender === "Others" && (
                  <div className="md:col-span-2 animate-in fade-in slide-in-from-top-2">
                    <Label>Please Specify Gender <span className="text-red-500">*</span></Label>
                    <Input placeholder="Enter your specific classification" value={otherGenderDetails} onChange={(e) => setOtherGenderDetails(e.target.value)} className="mt-1" />
                  </div>
                )}

                <div>
                  <Label>Email <span className="text-red-500">*</span></Label>
                  <Input type="email" value={data.email || ""} onChange={(e) => set("email", e.target.value.trim())} className="mt-1" placeholder="name@example.com" />
                </div>

                <div>
                  <Label>Mobile Number (WhatsApp) <span className="text-red-500">*</span></Label>
                  <div className="flex gap-2 mt-1">
                    <Input disabled value={data.countryCode || "+91"} className="w-[60px] font-mono text-center px-1" />
                    <Input value={data.phone || ""} onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} className="flex-1" placeholder="10-digit mobile" maxLength={10} />
                  </div>
                </div>

                <div>
                  <Label>Aadhaar Number (Optional)</Label>
                  <Input 
                    type={aadhaarFocused ? "text" : "password"}
                    value={data.aadhaar || ""}
                    onFocus={() => setAadhaarFocused(true)}
                    onBlur={() => setAadhaarFocused(false)}
                    onChange={(e) => set("aadhaar", e.target.value.replace(/\D/g, "").slice(0, 12))}
                    placeholder="XXXX XXXX 1234" 
                    className="mt-1 font-mono tracking-widest" 
                    maxLength={12}
                  />
                  <p className="text-xs text-muted-foreground mt-1">12 digits. Stored securely.</p>
                </div>

                <div>
                  <Label>Disability? <span className="text-red-500">*</span></Label>
                  <Select value={data.hasDisability || ""} onValueChange={(v) => { set("hasDisability", v); if(v==="No") set("disabilities", []); }}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select Yes/No" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="Yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {data.hasDisability === "Yes" && (
                  <div className="md:col-span-2 border p-4 rounded-xl bg-slate-50 animate-in fade-in">
                    <Label className="mb-3 block">Select Disability Types <span className="text-red-500">*</span></Label>
                    <div className="flex flex-wrap gap-2">
                      {DISABILITIES_LIST.map((d) => {
                        const on = data.disabilities?.includes(d);
                        return <Badge key={d} onClick={() => toggleArr("disabilities", d)} className={`cursor-pointer px-3 py-1 ${on ? "bg-navy text-white" : "bg-white text-slate-700 border"}`}>{d}</Badge>;
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: ADDRESS */}
            {STEPS[step].key === "address" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                {renderAddressSection("currentAddress", "Current Address")}
                
                <div className="flex items-center gap-2 px-1">
                  <Checkbox 
                    id="sameAddress" 
                    checked={!!data.sameAsCurrent} 
                    onCheckedChange={(c) => {
                      set("sameAsCurrent", !!c);
                      if (c) set("permanentAddress", { ...data.currentAddress as AddressData });
                      else set("permanentAddress", { ...initialAddress });
                    }} 
                  />
                  <Label htmlFor="sameAddress" className="font-medium text-navy cursor-pointer">Permanent Address is same as Current Address</Label>
                </div>

                {!data.sameAsCurrent && renderAddressSection("permanentAddress", "Permanent Address")}
              </div>
            )}

            {/* STEP 3: VERIFY */}
            {STEPS[step].key === "verify" && (
              <div className="max-w-md mx-auto text-center py-6 animate-in fade-in">
                <div className="mx-auto size-14 rounded-full bg-saffron/15 flex items-center justify-center mb-4"><ShieldCheck className="h-7 w-7 text-saffron" /></div>
                <h3 className="font-display text-lg font-bold text-navy">Verify your phone</h3>
                <p className="text-xs text-muted-foreground mt-1">OTP sent to: <b>{data.countryCode || "+91"} {data.phone}</b></p>
                {!otpSent ? (<Button className="mt-6 bg-navy text-white hover:bg-navy/90" onClick={sendOtp}>Send OTP</Button>) : data.otpVerified ? (<div className="mt-6 inline-flex items-center gap-2 text-india-green font-medium"><Check className="h-4 w-4" /> Phone verified</div>) : (<div className="mt-6 space-y-3">
                   <div className="flex justify-center"><InputOTP maxLength={6} value={otpInput} onChange={setOtpInput}><InputOTPGroup><InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} /><InputOTPSlot index={3} /></InputOTPGroup></InputOTP></div>
                   <div className="flex gap-2 justify-center"><Button onClick={verifyOtp} className="bg-india-green text-white">Verify & Proceed</Button><Button variant="outline" onClick={sendOtp}>Resend</Button></div>
                   </div>)}
              </div>
            )}
            
            {/* STEP 4: PASSWORD */}
            {STEPS[step].key === "password" && data.otpVerified && (
              <div className="grid md:grid-cols-2 gap-5 animate-in fade-in max-w-2xl mx-auto">
                <div className="md:col-span-2"><h3 className="font-display text-lg font-bold text-navy mb-1">Set Your Password</h3></div>
                <div className="md:col-span-2">
                  <Label>Create Password <span className="text-red-500">*</span></Label>
                  <div className="relative mt-1">
                    <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" className="pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-muted-foreground"><Eye className="h-4 w-4" /></button>
                  </div>
                  <div className="mt-3 space-y-1.5 text-xs">
                    <p className={`flex items-center gap-1.5 ${password.length >= 8 ? 'text-india-green' : 'text-muted-foreground'}`}>{password.length >= 8 ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 text-red-500" />} At least 8 characters</p>
                    <p className={`flex items-center gap-1.5 ${/[A-Z]/.test(password) ? 'text-india-green' : 'text-muted-foreground'}`}>{/[A-Z]/.test(password) ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 text-red-500" />} 1 uppercase letter</p>
                    <p className={`flex items-center gap-1.5 ${/[a-z]/.test(password) ? 'text-india-green' : 'text-muted-foreground'}`}>{/[a-z]/.test(password) ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 text-red-500" />} 1 lowercase letter</p>
                    <p className={`flex items-center gap-1.5 ${/\d/.test(password) ? 'text-india-green' : 'text-muted-foreground'}`}>{/\d/.test(password) ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 text-red-500" />} 1 number</p>
                    <p className={`flex items-center gap-1.5 ${/[@$!%*?&._-]/.test(password) ? 'text-india-green' : 'text-muted-foreground'}`}>{/[@$!%*?&._-]/.test(password) ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 text-red-500" />} 1 special character</p>
                  </div>
                </div>
                <div className="md:col-span-2 mt-2">
                  <Label>Confirm Password <span className="text-red-500">*</span></Label>
                  <Input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1" />
                  {confirmPassword && password === confirmPassword && isPasswordValid && <p className="text-xs text-india-green mt-2 flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Passwords match</p>}
                </div>
              </div>
            )}

            {/* STEP 5: EDUCATION */}
            {STEPS[step].key === "education" && (
              <div className="grid md:grid-cols-2 gap-5 animate-in fade-in">
                <div className="md:col-span-2 flex gap-3">
                  {["Pursuing Education", "Completed Education"].map((s) => (
                    <button key={s} onClick={() => set("educationStatus", s)} className={`flex-1 p-3 rounded-lg border text-sm font-medium transition-colors ${data.educationStatus === s ? "border-navy bg-navy text-white" : "border-border text-navy bg-white hover:bg-slate-50"}`}>{s}</button>
                  ))}
                </div>

                <div>
                  <Label>Highest Educational Qualification <span className="text-red-500">*</span></Label>
                  <Select value={data.qualification || ""} onValueChange={(v) => { set("qualification", v); set("specialization", ""); }}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{HIGHEST_QUALS.map((qq) => <SelectItem key={qq} value={qq}>{qq}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Year of Passing / Expected Passing <span className="text-red-500">*</span></Label>
                  <Input type="month" value={data.yearOfPassing || ""} onChange={(e) => set("yearOfPassing", e.target.value.split('-')[0])} className="mt-1" />
                </div>
                <div className="md:col-span-2">
                  <Label>Specialization <span className="text-red-500">*</span></Label>
                  <Input value={data.specialization || ""} onChange={(e) => set("specialization", e.target.value)} className="mt-1" placeholder="e.g. Computer Science, Mechanical, History..." />
                </div>
              </div>
            )}

            {/* STEP 6: SKILLS & LANGUAGES */}
            {STEPS[step].key === "skills" && (
              <div className="animate-in fade-in space-y-6">
                <div>
                  <Label className="mb-2 block">Languages Known (Read/Write/Speak) <span className="text-red-500">*</span></Label>
                  <div className="flex flex-wrap gap-2">
                    {INDIAN_LANGUAGES.map((l) => {
                      const on = data.languagesFluent?.includes(l);
                      return <Badge key={l} onClick={() => toggleArr("languagesFluent", l)} className={`cursor-pointer px-3 py-1 ${on ? "bg-navy text-white" : "bg-slate-100 text-slate-700"}`}>{l}</Badge>;
                    })}
                  </div>
                </div>
                <div className="border-t pt-4">
                  <Label className="mb-2 block">Professional Skills <span className="text-red-500">*</span></Label>
                  <div className="flex gap-2 mb-4">
                    <Input value={skillSearch} onChange={(e) => setSkillSearch(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); validateAndAddSkill(skillSearch); } }} placeholder="e.g. React, Accounting, Welding" />
                    <Button onClick={() => validateAndAddSkill(skillSearch)} className="bg-navy text-white">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.skills?.map((s) => <Badge key={s} className="bg-saffron text-navy px-3 py-1">{s} <X className="h-3 w-3 ml-2 cursor-pointer" onClick={() => toggleArr("skills", s)}/></Badge>)}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 7: EXPERIENCE */}
            {STEPS[step].key === "experience" && (
              <div className="grid md:grid-cols-2 gap-5 animate-in fade-in">
                <div className="md:col-span-2 flex gap-3">
                  {["Fresher", "Experienced"].map((t) => (
                    <button key={t} onClick={() => set("experienceType", t)} className={`flex-1 p-4 rounded-lg border font-medium ${data.experienceType === t ? "border-navy bg-navy/5 text-navy" : "border-border text-slate-600"}`}>{t}</button>
                  ))}
                </div>
                
                {data.experienceType === "Experienced" && (
                  <div className="md:col-span-2 bg-slate-50 p-5 rounded-xl border grid grid-cols-2 gap-4">
                    <div>
                      <Label>Years</Label>
                      <Select value={data.expYears} onValueChange={(v) => set("expYears", v)}>
                        <SelectTrigger className="mt-1 bg-white"><SelectValue/></SelectTrigger>
                        <SelectContent>{Array.from({length: 51}).map((_, i) => <SelectItem key={i} value={i.toString()}>{i}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Months</Label>
                      <Select value={data.expMonths} onValueChange={(v) => set("expMonths", v)}>
                        <SelectTrigger className="mt-1 bg-white"><SelectValue/></SelectTrigger>
                        <SelectContent>{Array.from({length: 12}).map((_, i) => <SelectItem key={i} value={i.toString()}>{i}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 bg-white px-3 py-2 rounded-md border text-sm text-navy font-medium text-center">
                      Formatted Experience: <span className="text-saffron font-bold ml-1">{data.expYears}.{data.expMonths} yrs</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 8: RESUME */}
            {STEPS[step].key === "resume" && (
              <div className="py-4 animate-in fade-in space-y-6">
                <div>
                  <Label className="block mb-2">Resume Upload (.pdf, .doc, .docx only) - Max 2MB</Label>
                  <label className="block border-2 border-dashed border-navy/30 rounded-xl p-8 text-center hover:bg-navy/5 cursor-pointer">
                    <Upload className="h-10 w-10 mx-auto text-navy" />
                    <div className="mt-3 font-medium text-navy">{data.resumeFileName || "Upload your Resume"}</div>
                    <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => { 
                        const f = e.target.files?.[0]; 
                        if (f) { 
                          if (f.size > 2 * 1024 * 1024) return toast.error("File size cannot exceed 2MB!");
                          set("resumeFileName", f.name); toast.success("Resume attached."); 
                        } 
                      }} />
                  </label>
                </div>
              </div>
            )}

            {/* STEP 9: PREFERENCES */}
            {STEPS[step].key === "preferences" && (
              <div className="grid md:grid-cols-2 gap-6 animate-in fade-in">
                <div className="md:col-span-2">
                  <Label>What kind of Opportunities are you looking for? <span className="text-red-500">*</span></Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {OPPORTUNITIES_LIST.map((opt) => (
                      <Badge key={opt} onClick={() => toggleArr("opportunities", opt)} className={`cursor-pointer px-3 py-1 text-xs ${data.opportunities?.includes(opt) ? "bg-navy text-white" : "bg-slate-100 text-slate-700 border border-slate-200"}`}>{opt}</Badge>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Label>Location Preference to work (Select up to 3) <span className="text-red-500">*</span></Label>
                  <div className="flex gap-2 mt-2">
                    <Select onValueChange={(v) => { if((data.preferredLocations?.length || 0) < 3) toggleArr("preferredLocations", v); }}>
                      <SelectTrigger><SelectValue placeholder="Add State/District" /></SelectTrigger>
                      <SelectContent>{INDIAN_STATES_LIST.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {data.preferredLocations?.map((loc) => (
                      <Badge key={loc} className="bg-saffron text-navy">{loc} <X className="h-3 w-3 ml-2 cursor-pointer" onClick={() => toggleArr("preferredLocations", loc)}/></Badge>
                    ))}
                  </div>
                </div>

                <label className="md:col-span-2 flex items-center gap-2 bg-slate-50 p-3 rounded-lg border">
                  <Checkbox checked={!!data.willingToRelocate} onCheckedChange={(v) => set("willingToRelocate", !!v)} />
                  <span className="font-medium text-navy">Are you Willing to Relocate for the opted opportunity?</span>
                </label>

                <div>
                  <Label>How did you hear about us? <span className="text-red-500">*</span></Label>
                  <Select value={data.hearAboutUs} onValueChange={(v) => { set("hearAboutUs", v); set("socialMediaPlatform", ""); }}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select Option" /></SelectTrigger>
                    <SelectContent>
                      {HEAR_ABOUT_US_LIST.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {data.hearAboutUs === "Social Media" && (
                  <div>
                    <Label>Which Platform? <span className="text-red-500">*</span></Label>
                    <Select value={data.socialMediaPlatform} onValueChange={(v) => set("socialMediaPlatform", v)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select Platform" /></SelectTrigger>
                      <SelectContent>
                        {SOCIAL_MEDIA_LIST.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {data.hearAboutUs === "Other" && (
                  <div><Label>Please Specify</Label><Input onChange={(e)=>set("hearAboutOther", e.target.value)} className="mt-1" /></div>
                )}

                <div className="md:col-span-2 border-t pt-4">
                  <Label>Referral Code (Optional)</Label>
                  <Input 
                    value={data.referralCode || ""} 
                    onChange={(e) => set("referralCode", e.target.value.replace(/[^a-zA-Z0-9-]/g, "").toUpperCase())} 
                    className="mt-1 font-mono max-w-sm uppercase" placeholder="e.g. BCC-EMP-001" maxLength={20} 
                  />
                  <p className="text-xs text-muted-foreground mt-1">If you have a referral code from an employee or partner, enter it here.</p>
                </div>
              </div>
            )}

            {/* STEP 10: REVIEW */}
            {STEPS[step].key === "review" && (
              <div className="space-y-6 animate-in fade-in">
                <ReviewSection title="Basic Information">
                  <ReviewRow label="Full Name" value={data.fullName} />
                  <ReviewRow label="Phone" value={`${data.countryCode || "+91"} ${data.phone}`} />
                  <ReviewRow label="Gender" value={data.gender === "Others" ? otherGenderDetails : data.gender} />
                  <ReviewRow label="Current Pincode" value={data.currentAddress?.pincode} />
                </ReviewSection>
                <ReviewSection title="Education & Experience">
                  <ReviewRow label="Qualification" value={data.qualification} />
                  <ReviewRow label="Specialization" value={data.specialization} />
                  <ReviewRow label="Experience" value={data.experienceType === "Experienced" ? `${data.expYears}.${data.expMonths} Yrs` : "Fresher"} />
                </ReviewSection>
                
                <div className="space-y-3 bg-saffron/10 border border-saffron/30 p-4 rounded-xl mt-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox className="mt-1" checked={data.tncAccepted} onCheckedChange={(v) => set("tncAccepted", !!v)} />
                    <span className="text-sm font-medium text-navy">I accept the Terms & Conditions and Privacy Policy. I consent to receive important updates & promotions via SMS, email, and WhatsApp. <span className="text-red-500">*</span></span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox className="mt-1" checked={data.declarationAccepted} onCheckedChange={(v) => set("declarationAccepted", !!v)} />
                    <span className="text-sm font-medium text-navy">Candidate Willingness Declaration (I agree to provide accurate information and understand the terms of the platform). <span className="text-red-500">*</span></span>
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between gap-3 pt-6 border-t border-border">
            <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
            {step < STEPS.length - 1 ? (
              <Button disabled={!canNext} onClick={handleNextStep} className="bg-navy hover:bg-navy/90 text-white px-8">Next <ArrowRight className="h-4 w-4 ml-1" /></Button>
            ) : (
              <Button 
                onClick={finish} 
                disabled={isSubmitting} 
                className="bg-india-green hover:bg-india-green/90 text-white px-8 font-semibold"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-1" />} 
                {isSubmitting ? "Creating Profile..." : "Submit & Register"}
              </Button>
            )}
          </div>

        </Card>
      </div>

      <Dialog open={!!done} onOpenChange={(o) => { if (!o && done) navigate({ to: "/auth/login" }); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto size-16 rounded-full bg-india-green/15 flex items-center justify-center mb-4"><Check className="h-8 w-8 text-india-green" /></div>
            <DialogTitle className="text-center text-2xl font-display text-navy">Registration Successful!</DialogTitle>
            <DialogDescription className="text-center pt-2">Your candidate profile has been securely created.<br />Unique Candidate ID: <b className="text-navy font-mono bg-navy/5 px-2 py-1 rounded ml-1">{done?.uniqueId}</b></DialogDescription>
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
