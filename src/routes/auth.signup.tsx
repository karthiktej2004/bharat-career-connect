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

// =========================================================================
// MASSIVE EXCEL DATA MAPPINGS 
// =========================================================================

const HIGHEST_QUALS = ["Below 10th / SSLC", "10th std / SSLC", "ITI", "TATA Udyog", "12th std / 2nd PUC", "Diploma", "UG Degree", "PG Degree", "BE/B-Tech", "ME/M-Tech", "PHD", "Short Term Training (STT)", "Others"];
const BOARDS = ["State Board", "CBSE", "ICSE / CISCE", "Other"];
const STATE_BOARDS_LIST = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"];
const ITI_TRADES = ["Carpenter", "Computer Operator", "Computer Operator & Programming Assistant (COPA)", "Consumer Electronics Servicing", "Draughtsman", "Draughtsman Civil", "Draughtsman Mechanical", "Dress Making", "Electrician", "Electronics Mechanic", "Fitter", "Foundryman", "Information Technology & System Maintenance", "Instrument Mechanic", "Lineman", "Machinist", "Mechanic", "Mechanic (Motor Vehicle)", "Motor Mechanic", "Motor Vehicle Mechanic", "Other Trade", "Plumber", "Power Electrician", "Refrigeration and Air Conditioning Mechanic", "Robotics Electronics Mechanic", "Sheet Metal Worker", "Technician Power Electronic System", "Tool & Die Maker", "Tractor Mechanic", "Turner", "TV and Radio Mechanic", "Welder", "Wireman"];
const TATA_COURSES = ["Advanced CNC Machining Technician", "Artisan Using Advanced Tool", "Basic Designer and Virtual Verifier (Mechanical)", "Industrial Robotics & Digital Manufacturing Technician", "Mechanic Electric Vehicle", "Manufacturing Process Control and Automation"];
const DIPLOMA_STREAMS = ["Aeronautical Engineering", "Agriculture", "Architecture", "Automobile Engineering", "Ceramics Technology", "Chemical Engineering", "Cinematography", "Civil", "Commercial Practice", "Computer Science Engineering", "Computer-Aided Design (CAD)", "Dialysis Technology", "Electrical Engineering", "Electronics and Communication Engineering", "Electronics Instrumentation & Control Engineering", "Fashion Designing", "Fire and Safety Engineering", "General Nursing", "Horticulture", "Hotel Management", "Information Science", "Insurance", "Interior Decoration", "Junior Health Inspector", "Leather & Fashion Technology", "Library and Information Science", "Mechanical", "Mechatronics Engineering", "Medical Laboratory Technology (DMLT)", "Metallurgy Engineering", "Mining Engineering", "Modern Office Management", "Operation Theatre Technology", "Pharmacy", "Polymer Technology", "Printing Technology", "Sound Recording", "Textile Technology", "Tool and Die Making", "Tourism", "Veterinary and Livestock Development Assistant", "Visual Arts", "Water Technology & Health Science"];

const UG_MAPPING: Record<string, string[]> = {
  "BA": ["B. Ed", "Economics", "English Literature", "Fine Arts", "History", "Journalism and Mass Communication", "Kannada", "Other Languages (Hindi, French, Sanskrit, etc.)", "Philosophy", "Political Science", "Psychology", "Public Administration", "Social Science", "Sociology"],
  "Bachelor of Science (BSc)": ["Agriculture", "Agriculture Business Management", "Biology", "Biotechnology", "Botany", "Chemistry", "Computer Science", "Electronics", "Environmental Science", "Geology", "Horticulture", "Information Technology", "Mathematics", "Medical Lab Technology (MLT)", "Microbiology", "Nursing (professional program)", "PCM (Physics, Chemistry, Mathematics)", "Physics", "Sericulture", "Statistics", "Zoology"],
  "Bachelor of Commerce (BCom)": ["Accounting", "Banking and Finance", "BCom in Human Resource Management", "Business Administration", "Computer Applications", "Computer Science", "Economics", "Finance", "Human Resource Management", "Insurance", "International Business", "Marketing", "Risk Management", "Taxation", "Tourism and Travel Management"],
  "MBBS (Bachelor of Medicine & Bachelor of Surgery)": ["Medicine", "Surgery", "Pediatrics", "Dentistry", "Bachelor of Dental Surgery(BDS)", "MBBS in Nursing", "MBBS in Pharmacy", "MBBS in Physiotherapy", "Biomedical Science"],
  "Bachelor of Laws (LLB)": ["Criminal Law", "Constitutional Law", "Corporate Law", "Intellectual Property Law", "Environmental Law", "Family Law", "Labour / Industrial Law", "Taxation Law"],
  "Bachelor of Architecture (B.Arch)": ["Architectural Design", "Urban Planning", "Landscape Architecture", "Interior Design", "Sustainable / Green Architecture", "Digital / Computational Design"],
  "Bachelor in Fashion Design (B.Des)": ["Merchandising", "Apparel Design", "Textile Design", "Communication", "Styling", "Fashion Management", "Marketing / Technology", "Accessories Design", "Knitwear / Fabric Design"],
  "Bachelor of Computer Applications (BCA)": ["General / Core Computer Applications", "Software Development", "Database Management", "Networking / Cyber Security", "Web / Mobile Application Development", "Cloud Computing", "AI / Machine Learning", "Data Science / Big Data"],
  "Bachelor in Hotel Management (BHM)": ["General / Core Hotel Management", "Hospitality & Tourism Management", "Culinary Arts", "Food Production", "Food & Beverage Service", "Front Office / Rooms Division Management", "Event Management", "Housekeeping Management"],
  "Bachelor of Science in Agriculture (BSAg)": ["Agriculture", "Horticulture", "Animal Husbandry", "Agricultural Economics"],
  "Bachelor of Pharmacy (BPharm)": ["General / Core Pharmacy", "Pharmaceutical Technology", "Clinical Pharmacy", "Pharmacology", "Pharmaceutical Chemistry", "Pharmacognosy", "Quality Assurance"],
  "Bachelor of Social Work (BSW)": ["General / Core Social Work", "Community Development", "Child & Family Welfare", "Medical & Psychiatric Social Work"],
  "Bachelor of Business Management (BBM)": ["General Management", "Finance", "Marketing", "Human Resource Management", "International Business", "Entrepreneurship"],
  "Bachelor of Veterinary Science (BVSc)": ["Veterinary Science / Animal Husbandry", "Animal Nutrition", "Veterinary Surgery & Radiology", "Bachelor in Homeopathic Medicine and Surgery (BHMS)", "Livestock Management"],
  "Chartered Accountancy (CA)": ["General", "Audit", "Taxation", "Chartered Accountant in Final Course", "Chartered Accountant in Intermediate Course", "Chartered Accountant", "Finance"],
  "Bsc Nursing": ["Critical Care Nursing (ICU Specialist)", "Operation Theatre (OT) & Perioperative Nursing", "Pediatric Nursing", "OBG Nursing"],
  "Agriculture": ["BSAg in Agriculture", "BSAg in Horticulture", "BSAg in Animal Husbandry", "BSAg in Agricultural Economics"],
  "BBA": ["Finance", "Marketing", "Human Resource Management (HR)", "Business Analytics / Data Analytics", "Hospitality & Tourism Management"],
  "B.Voc": ["Food Processing", "Healthcare and Nursing", "Travel and Tourism", "Software Development", "Retail Management", "Automobile Engineering", "Hospitality Management", "Multimedia and Animation", "Textile Technology", "Agriculture and Horticulture", "Information Technology", "Financial Services", "Marketing and Sales", "Handicrafts and Design"],
  "Bachelor of Dental Surgery": ["Orthodontics", "Periodontics", "Prosthodontics", "Oral & Maxillofacial Surgery", "Pediatric Dentistry", "Conservative Dentistry & Endodontics", "Oral Medicine & Radiology"]
};
const UG_COURSES = Object.keys(UG_MAPPING);

const PG_MAPPING: Record<string, string[]> = {
  "MA": ["Political Science", "History", "Fine Arts", "Kannada Literature", "Anthropology", "Yoga", "Master of Library Information Science", "English Literature", "Sociology", "Psychology", "Economics", "Journalism and Mass Communication"],
  "MSc": ["Physics", "Forensic Science & Criminology", "Geology", "Visual Communication", "Biochemistry", "Applied Geology", "Food Science and Technology", "Genetics and Plant Breeding", "Business Analytics", "Big data Analytics", "Clinical Psychology", "Medical Statistics", "Clinical Research", "Biostatistics", "Agriculture", "Botany", "Agri Nectorology", "Chemistry", "Mathematics", "Biotechnology", "Microbiology", "Biology", "Computer Science / IT", "Statistics", "Environmental Science"],
  "MBA": ["Finance", "Fashion Communication", "Hospitality", "Mass Communication", "Agri Business Management", "Human Resource and Marketing", "HR and Finance", "Supply Chain Management", "Entrepreneurship", "Business Analytics", "Project Management", "Marketing", "Human Resource Management", "Operations Management", "International Business", "IT / Systems"],
  "MD": ["Master of Dentistry", "Master of Pharmacy (MPharm)", "Master of Physiotherapy (MPT)", "Master of Biomedical Science", "Gynecology", "Ophthalmology", "ENT", "Orthopedics", "Dermatology", "Surgery", "Neurology", "Pediatrics", "Doctor of Pharmacy (Pharma-D)", "General Medicine"],
  "MS": ["General Surgery"],
  "LLM": ["Constitutional Law", "Environmental Law", "Corporate Law", "Criminal Law", "International Law"],
  "Mpharm": ["Pharmacognosy", "Quality Assurance", "Clinical Pharmacy", "Pharmaceutical Chemistry", "Pharmaceutics", "Pharmacology"],
  "MArch": ["Sustainable Architecture", "Interior Design", "Landscape Architecture", "Urban Planning"],
  "MEd": ["Educational Leadership", "Special Education", "Education"],
  "MCOM": ["Marketing", "Finance and Taxation", "Accounting", "Finance", "Cost Management Accounting"],
  "Agriculture": ["MSc in Agricultural Engineering", "MSc in Horticulture", "MSc in Agricultural Entomology", "MSc in Agricultural Extension", "MSc in Agricultural Microbiology", "MSc in Plant Pathology", "MSc in Soil Science and Agri. Chemistry", "MSc in Genetics and Plant Breeding", "MSc in Crop Physiology", "MSc in Food Science and Nutrition", "MSc in Agricultural Statistics", "MSc in Plant Biochemistry", "MSc in Seed Science and Technology", "MSc in Sericulture", "MSc in Soil and Water Engineering", "MSc in Processing and Food Engineering", "MSC in Electronics", "MSC in Plant Science", "MSc in Agri. Marketing and Cooperation", "MSc in Plant Biotechnology", "MSc in Apiculture", "MSc in Geoinformatics", "MSc in Agri. Business Management", "MSc in Bio-informatics", "MSc in Actuarial Science", "MSc in Agronomy", "MSc in Animal Husbandry", "MSc in Agricultural Economics", "Masters of Fisheries Science", "Master of Commerce in Human Resources Development", "MSc in Zoology", "MSc in Nanoscience & Technology", "MSc in Big Data Analytics"],
  "Architecture": ["MArch in Urban Planning", "MArch in Landscape Architecture", "MArch in Interior Design"],
  "Fashion Design": ["Master of Fashion Design", "Master of Fashion Merchandising", "Master of Textile Design"],
  "MCA (Master in Computer Application)": ["Software Development", "Web Development", "Networking", "Database Management", "Cybersecurity", "Cloud Computing", "Data Science / Data Analytics", "Artificial Intelligence"],
  "MSW (Master of Social Works)": ["Rural Development", "HR & Industrial Social Work", "Child & Family Welfare", "Medical & Psychiatric Social Work", "Clinical Social Work", "Social Work Practice", "Community Development", "MSW in LLB", "MSW in Human Resource Development and Management", "MSW in Master of Psychiatric Social Work"],
  "MVSC (Master in Veterinary Science)": ["Livestock Production & Management", "Animal Genetics & Breeding", "Animal Nutrition", "Veterinary Pathology", "Veterinary Microbiology", "Veterinary Surgery & Radiology", "Veterinary Medicine"],
  "MHM": ["Tourism & Travel Management", "Healthcare Administration", "Hospital Operations", "Tourism Management", "Health Policy & Planning", "Hospital Finance & Management", "Food & Beverage Management", "Hotel Operations", "Hospitality Management / General Management", "Housekeeping Management", "Front Office Management", "Food & Beverage Service", "Food Production"],
  "MSc Nursing": ["Pediatric Nursing", "Nursing Education", "Critical Care Nursing", "Community Health Nursing", "Medical-Surgical Nursing", "Mental Health (Psychiatric) Nursing", "Obstetrics & Gynecological Nursing", "Child Health"],
  "MD (Homeopathy)": ["Homeopathic Materia Medica", "Organon of Medicine & Homeopathic Philosophy", "Repertory", "Practice of Medicine in Homeopathy", "Homeopathic Pharmacy", "Homeopathic Surgery (where applicable)"]
};
const PG_COURSES = Object.keys(PG_MAPPING);

const BE_ME_COURSES = ["Computer Science", "Information Technology", "Electronics & Communication", "Electrical", "Mechanical", "Civil", "Aerospace", "Chemical", "Biotechnology", "Artificial Intelligence & ML", "Other"];
const UNIVERSITIES = ["IIT (Any)", "NIT (Any)", "IIIT (Any)", "IISc Bengaluru", "BITS Pilani", "IIM (Any)", "Delhi University", "Anna University", "VTU", "Bangalore University", "Mysore University", "Osmania University", "Other"];
const GENERIC_SPECIALIZATIONS = ["Artificial Intelligence & Machine Learning", "Data Science", "Cyber Security", "Finance", "Marketing", "Human Resources", "Operations", "Business Analytics", "Accounting", "Economics", "Physics", "Chemistry", "Mathematics", "Biology", "English Literature", "Political Science"];

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

  // SMART PIN CODE API
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
          let mappedMla = "Auto-mapped (e.g. Yelahanka)"; let mappedMp = "Auto-mapped (e.g. Chikkaballapur)"; let mappedGp = "Auto-mapped (e.g. Rajanukunte)";
          if (pin === "560064") { mappedMla = "Yelahanka"; mappedMp = "Chikkaballapur"; mappedGp = "Rajanukunte"; }
          setData((d) => ({ ...d, state: INDIAN_STATES.includes(o.State) ? o.State : d.state || o.State, district: o.District, taluk: o.Block && o.Block !== "NA" ? o.Block : o.Name, mla: mappedMla, mp: mappedMp, gramPanchayat: mappedGp }));
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

  // =======================================================
  // 🚀 REAL DATABASE SUBMISSION - NO MOCK STORES USED HERE
  // =======================================================
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

    console.log("🚀 SENDING PAYLOAD TO DB:", payload);

    try {
      const res = await fetch("http://localhost:5000/api/auth/candidate/register", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
      });
      
      const json = await res.json();
      console.log("📥 RESPONSE FROM DB:", json);

      if (json.success) {
        // Sets global session so they are logged in.
        setSession({ id: json.uniqueId, name: payload.fullName, email: payload.email, role: "candidate" });
        setDone({ uniqueId: json.uniqueId } as CandidateProfile);
        toast.success("Account securely created in Database!");
      } else {
        toast.error(json.message || "Registration failed");
      }
    } catch (err) {
      console.error("Database connection failed:", err);
      toast.error("Fetch failed. Is your Node backend running on port 5000?");
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
            {/* ================= STEP 1: BASIC INFO ================= */}
            {STEPS[step].key === "basic" && (
              <div className="grid md:grid-cols-2 gap-5 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="md:col-span-2"><Label>Full Name *</Label><Input value={data.fullName || ""} onChange={(e) => set("fullName", e.target.value)} className="mt-1" placeholder="As per Aadhaar" /></div>
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
                <div><Label>Gender</Label><Select value={data.gender || ""} onValueChange={(v) => set("gender", v)}><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select></div>
                <div><Label>Preferred Language</Label><Select value={data.language || "English"} onValueChange={(v) => set("language", v)}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{INDIAN_LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select></div>
                <div className="md:col-span-2"><Label>Category</Label><Select value={data.category || ""} onValueChange={(v) => set("category", v as CandidateProfile["category"])}><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{["General Merit (GM)","SC","ST","OBC","EWS","PwD"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                
                <div className="md:col-span-2 p-5 bg-slate-50 border border-border rounded-xl mt-2 space-y-4">
                  <div className="font-display font-bold text-navy flex items-center gap-2">Geographic Location {pinLookup === "loading" && <Loader2 className="h-4 w-4 animate-spin text-saffron" />}</div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-3"><Label>PIN Code</Label><Input value={data.pincode || ""} onChange={(e) => set("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))} className="mt-1 font-mono max-w-[200px]" placeholder="560064" maxLength={6} />{pinLookup === "ok" && <p className="text-xs text-india-green mt-1 font-medium">Details auto-filled</p>}{pinLookup === "error" && <p className="text-xs text-destructive mt-1">Invalid PIN code</p>}</div>
                    <div><Label>State</Label><Input disabled value={data.state || ""} className="mt-1 bg-white" /></div>
                    <div><Label>District</Label><Input disabled value={data.district || ""} className="mt-1 bg-white" /></div>
                    <div><Label>Taluk</Label><Input disabled value={data.taluk || ""} className="mt-1 bg-white" /></div>
                    <div><Label>MP</Label><Input disabled value={data.mp || ""} className="mt-1 bg-white font-medium" /></div>
                    <div><Label>MLA</Label><Input disabled value={data.mla || ""} className="mt-1 bg-white font-medium" /></div>
                    <div><Label>Panchayat</Label><Input disabled value={data.gramPanchayat || ""} className="mt-1 bg-white font-medium" /></div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: VERIFY */}
            {STEPS[step].key === "verify" && (
              <div className="max-w-md mx-auto text-center py-6 animate-in fade-in">
                <div className="mx-auto size-14 rounded-full bg-saffron/15 flex items-center justify-center mb-4"><ShieldCheck className="h-7 w-7 text-saffron" /></div>
                <h3 className="font-display text-lg font-bold text-navy">Verify your phone</h3>
                {!otpSent ? (<Button className="mt-6 bg-navy text-white hover:bg-navy/90" onClick={sendOtp}>Send OTP</Button>) : data.otpVerified ? (<div className="mt-6 inline-flex items-center gap-2 text-india-green font-medium"><Check className="h-4 w-4" /> Phone verified</div>) : (<div className="mt-6 space-y-3"><Input value={otpInput} onChange={(e) => setOtpInput(e.target.value)} placeholder="Enter 6-digit OTP" className="text-center tracking-widest" maxLength={6} /><div className="flex gap-2 justify-center"><Button onClick={verifyOtp} className="bg-india-green text-white">Verify</Button><Button variant="outline" onClick={sendOtp}>Resend</Button></div></div>)}
              </div>
            )}

            {/* ================= STEP 3: EXCEL EDUCATION ================= */}
            {STEPS[step].key === "education" && (() => {
              const q = data.qualification || "";
              const isSchool = ["Below 10th / SSLC", "10th std / SSLC", "12th std / 2nd PUC"].includes(q);
              const isIti = q === "ITI"; const isTata = q === "TATA Udyog"; const isDiploma = q === "Diploma";
              const isUg = q === "UG Degree"; const isPg = q === "PG Degree";
              const isHigher = isUg || isPg || q === "BE/B-Tech" || q === "ME/M-Tech" || q === "PHD";
              
              const instIsOther = data.institution === "__other__"; const courseIsOther = data.course === "__other__"; const specIsOther = data.specialization === "__other__";
              
              const dynamicUgSpecializations = isUg && data.course && UG_MAPPING[data.course] ? UG_MAPPING[data.course] : GENERIC_SPECIALIZATIONS;
              const dynamicPgSpecializations = isPg && data.course && PG_MAPPING[data.course] ? PG_MAPPING[data.course] : GENERIC_SPECIALIZATIONS;
              const currentSpecializations = isUg ? dynamicUgSpecializations : isPg ? dynamicPgSpecializations : GENERIC_SPECIALIZATIONS;

              return (
                <div className="grid md:grid-cols-2 gap-5 animate-in fade-in">
                  <div><Label>Highest Qualification *</Label><Select value={data.qualification || ""} onValueChange={(v) => { set("qualification", v); set("institution", ""); set("specialization", ""); set("course", ""); set("stateBoardName", ""); }}><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{HIGHEST_QUALS.map((qq) => <SelectItem key={qq} value={qq}>{qq}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label>Year of Passing *</Label><Input value={data.yearOfPassing || ""} onChange={(e) => set("yearOfPassing", e.target.value)} className="mt-1" /></div>

                  {isSchool && (
                    <>
                      <div><Label>Board *</Label><Select value={data.institution || ""} onValueChange={(v) => set("institution", v)}><SelectTrigger className="mt-1"><SelectValue placeholder="Select board" /></SelectTrigger><SelectContent>{BOARDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select></div>
                      {data.institution === "State Board" && (<div><Label>Select State *</Label><Select value={data.stateBoardName || ""} onValueChange={(v) => set("stateBoardName", v)}><SelectTrigger className="mt-1"><SelectValue placeholder="Select state" /></SelectTrigger><SelectContent>{STATE_BOARDS_LIST.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select></div>)}
                      <div className={data.institution === "State Board" ? "md:col-span-2" : ""}><Label>School Name *</Label><Input className="mt-1" value={data.schoolName || ""} onChange={(e) => set("schoolName", e.target.value)} /></div>
                    </>
                  )}

                  {(isIti || isTata || isDiploma) && (
                    <>
                      <div className="md:col-span-2"><Label>{isIti ? "ITI Trade *" : isTata ? "TATA Udyog Course *" : "Diploma Stream *"}</Label><Select value={data.specialization || ""} onValueChange={(v) => set("specialization", v)}><SelectTrigger className="mt-1"><SelectValue placeholder="Select specialization" /></SelectTrigger><SelectContent>{(isIti ? ITI_TRADES : isTata ? TATA_COURSES : DIPLOMA_STREAMS).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}<SelectItem value="__other__">Other</SelectItem></SelectContent></Select>{specIsOther && <Input className="mt-2" value={data.specializationOther || ""} onChange={(e) => set("specializationOther", e.target.value)} />}</div>
                      <div className="md:col-span-2"><Label>Institute Name *</Label><Input className="mt-1" value={data.institution || ""} onChange={(e) => set("institution", e.target.value)} /></div>
                    </>
                  )}

                  {isHigher && (
                    <>
                      <div className="md:col-span-2"><Label>College / University *</Label><Select value={data.institution || ""} onValueChange={(v) => set("institution", v)}><SelectTrigger className="mt-1"><SelectValue placeholder="Select college" /></SelectTrigger><SelectContent>{UNIVERSITIES.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select></div>
                      <div><Label>Course *</Label><Select value={data.course || ""} onValueChange={(v) => { set("course", v); set("specialization", ""); }}><SelectTrigger className="mt-1"><SelectValue placeholder="Select course" /></SelectTrigger><SelectContent>{(isUg ? UG_COURSES : isPg ? PG_COURSES : BE_ME_COURSES).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}<SelectItem value="__other__">Other</SelectItem></SelectContent></Select>{courseIsOther && <Input className="mt-2" value={data.courseOther || ""} onChange={(e) => set("courseOther", e.target.value)} />}</div>
                      <div><Label>Specialization / Domain *</Label><Select value={data.specialization || ""} onValueChange={(v) => set("specialization", v)}><SelectTrigger className="mt-1"><SelectValue placeholder="Select specialization" /></SelectTrigger><SelectContent>{currentSpecializations.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}<SelectItem value="__other__">Other</SelectItem></SelectContent></Select>{specIsOther && <Input className="mt-2" value={data.specializationOther || ""} onChange={(e) => set("specializationOther", e.target.value)} />}</div>
                    </>
                  )}
                  <div><Label>Percentage / CGPA</Label><Input value={data.percentage || ""} onChange={(e) => set("percentage", e.target.value)} className="mt-1" /></div>
                  <div className="md:col-span-2 pt-2"><Label className="block mb-2">Languages you speak</Label><div className="flex flex-wrap gap-2">{INDIAN_LANGUAGES.map((l) => { const on = data.languagesFluent?.includes(l); return <Badge key={l} onClick={() => toggleArr("languagesFluent", l)} className={`cursor-pointer px-3 py-1 ${on ? "bg-india-green text-white" : "bg-slate-100 text-slate-700"}`}>{l}</Badge>; })}</div></div>
                </div>
              );
            })()}

            {/* STEP 4: SKILLS */}
            {STEPS[step].key === "skills" && (() => {
              const query = skillSearch.trim().toLowerCase();
              const filtered = query ? NSQF_SKILLS.filter((s) => s.toLowerCase().includes(query)) : NSQF_SKILLS;
              const addSkill = (s: string) => { const v = s.trim(); if (!v) return; if (!(data.skills || []).some((x) => x.toLowerCase() === v.toLowerCase())) { setData((d) => ({ ...d, skills: [...(d.skills || []), v] })); } setSkillSearch(""); };
              return (
                <div className="animate-in fade-in">
                  <div className="flex gap-2 mb-4"><Input value={skillSearch} onChange={(e) => setSkillSearch(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillSearch); } }} placeholder="Search a skill" /><Button onClick={() => addSkill(skillSearch)} disabled={!skillSearch.trim()} className="bg-navy text-white">Add</Button></div>
                  {(data.skills?.length || 0) > 0 && (<div className="mb-4"><div className="text-xs font-medium text-navy mb-2">Your skills</div><div className="flex flex-wrap gap-2">{data.skills!.map((s) => <Badge key={s} className="bg-saffron text-navy px-3 py-1"><Check className="h-3 w-3 mr-1" /> {s} <X className="h-3 w-3 ml-2 cursor-pointer" onClick={() => toggleArr("skills", s)}/></Badge>)}</div></div>)}
                  <div><div className="text-xs font-medium text-muted-foreground mb-2">Suggested skills</div><div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto">{filtered.map((s) => { const on = data.skills?.includes(s); return <Badge key={s} onClick={() => on ? toggleArr("skills", s) : addSkill(s)} className={`cursor-pointer ${on ? "bg-india-green text-white" : "bg-muted text-navy"}`}>{s}</Badge>; })}</div></div>
                </div>
              );
            })()}

            {/* STEP 5: EXPERIENCE */}
            {STEPS[step].key === "experience" && (
              <div className="grid md:grid-cols-2 gap-4 animate-in fade-in">
                <div className="md:col-span-2"><Label>Experience Type</Label><div className="mt-2 flex gap-3">{(["Fresher","Experienced"] as const).map((t) => (<button key={t} onClick={() => set("experienceType", t)} className={`flex-1 p-4 rounded-lg border text-left ${data.experienceType === t ? "border-navy bg-navy/5" : "border-border"}`}><div className="font-medium text-navy">{t}</div></button>))}</div></div>
                {data.experienceType === "Experienced" && (<><div className="md:col-span-2 -mb-1 mt-2"><h4 className="font-display font-semibold text-navy text-sm">Current Employment</h4></div><div><Label>Total Years Experience *</Label><Input value={data.yearsOfExperience || ""} onChange={(e) => set("yearsOfExperience", e.target.value)} className="mt-1" /></div><div><Label>Employment Status</Label><Select value={data.employmentStatus || ""} onValueChange={(v) => set("employmentStatus", v)}><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{["Currently employed","Serving notice period","Not employed"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div><div><Label>Current Job Title *</Label><Input value={data.currentRole || ""} onChange={(e) => set("currentRole", e.target.value)} className="mt-1" /></div><div><Label>Current Company *</Label><Input value={data.currentCompany || ""} onChange={(e) => set("currentCompany", e.target.value)} className="mt-1" /></div></>)}
              </div>
            )}

            {/* STEP 6: RESUME */}
            {STEPS[step].key === "resume" && (
              <div className="text-center py-6 animate-in fade-in">
                <label className="block border-2 border-dashed border-navy/30 rounded-xl p-8 hover:bg-navy/5 cursor-pointer"><Upload className="h-10 w-10 mx-auto text-navy" /><div className="mt-3 font-medium text-navy">{data.resumeFileName || "Upload your Resume"}</div><input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { set("resumeFileName", f.name); toast.success("Resume uploaded"); } }} /></label>
              </div>
            )}

            {/* STEP 7: PREFERENCES */}
            {STEPS[step].key === "preferences" && (
              <div className="grid md:grid-cols-2 gap-4 animate-in fade-in">
                <div className="md:col-span-2"><Label>Preferred Roles</Label><Input className="mt-1" placeholder="Type a role and press Enter" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const v = e.currentTarget.value.trim(); if (v && !(data.preferredRoles || []).includes(v)) set("preferredRoles", [...(data.preferredRoles || []), v]); e.currentTarget.value = ""; } }} />{(data.preferredRoles?.length || 0) > 0 && (<div className="flex flex-wrap gap-2 mt-3">{data.preferredRoles!.map((r) => <Badge key={r} className="bg-navy text-white">{r} <X className="h-3 w-3 ml-2 cursor-pointer" onClick={() => set("preferredRoles", data.preferredRoles!.filter((x) => x !== r))}/></Badge>)}</div>)}</div>
                <div className="md:col-span-2 mt-2"><Label>Preferred Work Locations *</Label><div className="flex flex-wrap gap-2 mt-2">{["Bengaluru","Mysuru","Hubballi","Mangaluru","Remote"].map((l) => { const on = data.preferredLocations?.includes(l); return <Badge key={l} onClick={() => toggleArr("preferredLocations", l)} className={`cursor-pointer ${on ? "bg-navy text-white" : "bg-slate-100 text-slate-700"}`}>{l}</Badge>; })}</div></div>
                <label className="md:col-span-2 flex items-center gap-2 mt-1 bg-saffron/10 border p-3 rounded-lg"><Checkbox checked={!!data.willingToRelocate} onCheckedChange={(v) => set("willingToRelocate", !!v)} /> <span className="font-medium text-navy">Willing to relocate anywhere in India</span></label>
                <div><Label>Job Type *</Label><Select value={data.preferredJobType || ""} onValueChange={(v) => set("preferredJobType", v)}><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{["Full-time","Internship","Contract"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Expected Salary (LPA)</Label><Input value={data.expectedSalary || ""} onChange={(e) => set("expectedSalary", e.target.value)} className="mt-1" /></div>
              </div>
            )}

            {/* STEP 8: REVIEW */}
            {STEPS[step].key === "review" && (
              <div className="space-y-6 animate-in fade-in">
                <ReviewSection title="Basic Information"><ReviewRow label="Full Name" value={data.fullName} /><ReviewRow label="Email" value={data.email} /><ReviewRow label="Phone" value={data.phone} /><ReviewRow label="PIN Code" value={data.pincode} /></ReviewSection>
                <ReviewSection title="Education"><ReviewRow label="Qualification" value={data.qualification} /><ReviewRow label="Institution" value={data.institution === "State Board" ? `${data.stateBoardName} State Board` : data.institution} /><ReviewRow label="Course/Stream" value={data.course || data.specialization} /><ReviewRow label="Year of Passing" value={data.yearOfPassing} /></ReviewSection>
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