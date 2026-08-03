import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Clock, ArrowLeft, Loader2, CheckCircle2, Upload, MapPin, Users, Briefcase, FileText, Eye, EyeOff, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/register-company")({
  head: () => ({ meta: [{ title: "Register Company — Bharat Career Connect" }] }),
  component: RegisterCompany,
});

// --- CONSTANTS ---
const ORG_TYPES = ["Employer Primary Category(E)", "Sector Skill Council (SSC)", "Associations / Industry Clusters", "Skill Training Centre", "Others"];
const LEGAL_STRUCTURES = ["Sole Proprietorship", "Partnership", "Limited Liability Partnership (LLP)", "Private Limited Company", "Public Limited Company", "One-Person Company", "NGO - Section 8 / Trust", "State Public Sector Undertaking", "Central Public Sector Undertaking", "Others"];

const SECTORS_LIST = [
  "Aerospace and Aviation Sector", "Agriculture Sector", "Apparel Sector", "Automotive Sector",
  "Beauty & Wellness Sector", "BFSI Sector", "Capital Goods Sector", "Construction Sector",
  "Domestic Workers Sector", "Education Sector", "Electronics Sector", "Food Processing Sector",
  "Furniture & Fittings Sector", "Gems & Jewellery Sector", "Government Sector", "Green Jobs Sector",
  "Handicrafts and Carpet Sector", "Healthcare Sector", "HR Consultancy Sector", "Hydrocarbon Sector",
  "Infrastructure Equipment Sector", "Instrumentation Automation Surveillance", "Iron and Steel Sector",
  "IT-ITeS Sector", "Leather Sector", "Life Sciences Sector", "Logistics Sector",
  "Management & Entrepreneurship and", "Manufacturing Sector", "Media & Entertainment Sector",
  "Mining Sector", "Persons with Disability Sector", "Power Sector", "Retail Sector",
  "Rubber, Chemical, & Petrochemical", "Service Sector", "Social Sector", "Sports Sector",
  "Telecom Sector", "Textile Sector", "Tourism & Hospitality Sector", "Water Management & Plumbing Sector",
  "Paints and Coating Sector", "State Public Sector Undertaking", "Central Public Sector Undertaking",
  "Space Sector", "Defence Sector", "Nuclear Sector", "Industrial Safety Sector", "Legal Sector",
  "General Sector", "Spirituality Sector", "Others"
];

const ORG_PRESENCE = ["Local", "Regional", "State-wide", "Pan-India", "International"];
const TITLES = ["Mr.", "Mrs.", "Ms.", "Miss.", "Dr.", "Prof."];
const DESIGNATIONS = ["Founder", "Chairman", "Director", "President", "Vice President", "Secretary", "HR Manager", "Project Manager", "Coordinator", "Others"];
const EMPLOYEE_STRENGTH = ["1-4", "5-29", "30-100", "101-300", "301-500", "501-1000", "1001 and above"];
const DISABILITIES = ["Blindness", "Low-vision", "Hearing Impairment", "Locomotor Disability", "Intellectual Disability", "Specific Learning Disabilities", "Multiple Sclerosis", "All the above"];
const DISCOVERY_SOURCES = ["Search Engine (Google/Bing)", "Social Media", "Email Campaign", "Job Fair Event / Udyoga Mela", "Referral", "Alumni Network", "Others"];

function RegisterCompany() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [registeredId, setRegisteredId] = useState("");
  
  // NEW: Robust Server Error State
  const [serverError, setServerError] = useState("");
  
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [f, setF] = useState({
    gst_number: "", is_gst_verified: false, company_name: "", website: "", org_type: "", legal_structure: "", 
    selected_sector: "", custom_sector: "", 
    pincode: "", state: "", district: "", taluk: "", mla_constituency: "", mp_constituency: "", resident_type: "", local_body_details: "", locality_area: "", current_address: "", map_link: "", org_presence: "", multiple_branches: "false",
    poc1_title: "", poc1_name: "", poc1_designation: "", poc1_email: "", poc1_phone: "", password: "", confirmPassword: "",
    poc2_title: "", poc2_name: "", poc2_designation: "", poc2_email: "", poc2_phone: "",
    employee_strength: "", hiring_for: "", hire_pwds: "", accepted_disabilities: [] as string[],
    digital_onboarding: "true", source_of_discovery: "",
    policy_agreed: false, consent_agreed: false
  });

  const handleInputChange = (field: string, value: any) => setF(prev => ({ ...prev, [field]: value }));

  const toggleDisability = (item: string) => {
    setF(prev => {
      const array = prev.accepted_disabilities;
      if (array.includes(item)) return { ...prev, accepted_disabilities: array.filter(i => i !== item) };
      return { ...prev, accepted_disabilities: [...array, item] };
    });
  };

  const handleVerifyGST = () => {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    const formattedGst = f.gst_number.trim().toUpperCase();

    if (!gstRegex.test(formattedGst)) {
      toast.error("Invalid GST/CIN format.");
      return;
    }
    toast.success("GSTIN Verified!");
    setF(prev => ({ ...prev, gst_number: formattedGst, is_gst_verified: true, company_name: "Verified Company Pvt Ltd" }));
  };

  const handleSendOTP = () => {
    if (f.poc1_phone.length < 10) return toast.error("Enter a valid phone number.");
    setOtpSent(true);
    toast.info("OTP sent! (Use 1234 for testing)");
  };

  const handleVerifyOTP = () => {
    if (enteredOtp === "1234") {
      setIsOtpVerified(true);
      toast.success("Phone verified!");
    } else {
      toast.error("Invalid OTP.");
    }
  };

  const handleNextStep = () => {
    setServerError(""); // Clear any previous errors

    if (step === 1) {
      if (!f.company_name || !f.org_type || !f.legal_structure || !f.selected_sector) {
        return toast.error("Please fill all mandatory basic details.");
      }
      if (f.selected_sector === "Others" && !f.custom_sector.trim()) {
        return toast.error("Please specify your sector in the input box.");
      }
    }
    
    if (step === 3) {
      if (!isOtpVerified || !f.poc1_email || !f.password) {
        return toast.error("Please complete PoC 1 details and verify your phone number.");
      }
      
      // STRICT PASSWORD REGEX: Min 8 chars, 1 Uppercase, 1 Lowercase, 1 Number, 1 Special
      const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
      if (!passRegex.test(f.password)) {
        return toast.error("Password must be at least 8 characters long and contain 1 Uppercase, 1 Lowercase, 1 Number, and 1 Special Character.");
      }
      if (f.password !== f.confirmPassword) {
        return toast.error("Passwords do not match.");
      }
    }

    setStep(prev => prev + 1);
    window.scrollTo(0,0);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(""); // Clear errors before submitting

    if (!f.policy_agreed || !f.consent_agreed) {
      return toast.error("You must agree to the declarations to proceed.");
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      const payload: any = { ...f };
      
      payload.core_sectors = f.selected_sector === "Others" ? [f.custom_sector] : [f.selected_sector];
      
      delete payload.selected_sector;
      delete payload.custom_sector;
      delete payload.confirmPassword;

      Object.entries(payload).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === 'boolean') {
          formData.append(key, value ? "true" : "false");
        } else if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });

      if (logoFile) formData.append("org_logo", logoFile);

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/employer/register`, {
        method: "POST",
        body: formData 
      });
      
      let json;
      try {
        json = await res.json();
      } catch (parseErr) {
        setServerError(`Server Connection Error (Status: ${res.status}). The backend may be offline or crashing.`);
        setIsSubmitting(false);
        return;
      }

      if (json.success) {
        setRegisteredId(json.uniqueId || "PENDING-ID");
        setShowSuccess(true);
        setTimeout(() => navigate({ to: "/for-employers" }), 8000);
      } else {
        setServerError(json.message || "Registration failed. Please review your details.");
        window.scrollTo(0,0); // Scroll to top so they see the error
      }
    } catch (err: any) {
      setServerError(err.message || "Network error. Please check your connection.");
      window.scrollTo(0,0);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- SUCCESS SCREEN ---
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <Card className="max-w-xl p-10 text-center border-india-green/40 shadow-xl rounded-2xl bg-white animate-in fade-in zoom-in duration-500">
          <div className="mx-auto size-24 bg-india-green/10 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="h-12 w-12 text-india-green" />
          </div>
          <h1 className="text-3xl font-display font-bold text-navy mb-2">Registration Successful!</h1>
          
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 inline-block mx-auto min-w-[250px]">
             <p className="text-sm text-slate-500 uppercase tracking-wider font-bold mb-1">Your Employer ID</p>
             <p className="text-2xl font-mono font-bold text-navy tracking-widest">{registeredId}</p>
          </div>

          <p className="text-slate-600 mb-8 max-w-md mx-auto">Your comprehensive company profile has been submitted and is currently under review by our moderation team.</p>
          
          <div className="inline-flex items-center gap-2 bg-saffron/15 text-saffron border border-saffron/20 font-semibold px-5 py-3 rounded-full mb-6 text-sm">
            <Clock className="h-5 w-5 animate-pulse" /> Waiting for Admin Approval from Bharat Career Connect
          </div>
          <p className="text-sm text-muted-foreground border-t border-border/60 pt-6 mt-2">Redirecting you back to the home page...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        <Link to="/for-employers" className="inline-flex items-center text-sm text-navy hover:underline mb-6 font-medium">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Employers Page
        </Link>

        {/* STEPPER UI */}
        <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4">
          {[
            { id: 1, name: "Organization", icon: Building2 },
            { id: 2, name: "Location", icon: MapPin },
            { id: 3, name: "Contacts", icon: Users },
            { id: 4, name: "Operations", icon: Briefcase },
            { id: 5, name: "Documents", icon: FileText }
          ].map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-2 min-w-[80px]">
              <div className={`size-10 rounded-full flex items-center justify-center border-2 transition-colors ${step >= s.id ? "bg-navy border-navy text-white" : "bg-white border-slate-200 text-slate-400"}`}>
                <s.icon className="h-4 w-4" />
              </div>
              <span className={`text-xs font-semibold ${step >= s.id ? "text-navy" : "text-slate-400"}`}>{s.name}</span>
            </div>
          ))}
        </div>

        {/* EXPLICIT SERVER ERROR BANNER */}
        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-5 py-4 rounded-lg flex items-start gap-3 mb-6 animate-in fade-in">
            <AlertCircle className="h-6 w-6 mt-0.5 shrink-0" />
            <div className="text-sm font-medium">
              <p className="font-bold text-base mb-1">Registration Failed</p>
              <p>{serverError}</p>
            </div>
          </div>
        )}

        <Card className="p-8 border-border/60 shadow-sm rounded-xl bg-white">
          <form onSubmit={handleRegister} className="space-y-6">
            
            {/* STEP 1: BASIC ORG INFO */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-display font-bold text-navy border-b pb-2">Basic Organization Information</h3>
                
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <Label>GST / CIN Number *</Label>
                    <div className="flex gap-2 mt-1">
                      <Input required value={f.gst_number} onChange={(e) => handleInputChange('gst_number', e.target.value)} placeholder="e.g., 29AAAAA0000A1Z5" className="uppercase" disabled={f.is_gst_verified} />
                      <Button type="button" variant={f.is_gst_verified ? "outline" : "default"} onClick={handleVerifyGST} disabled={f.is_gst_verified} className={f.is_gst_verified ? "text-india-green border-india-green" : "bg-navy"}>
                        {f.is_gst_verified ? "Verified" : "Verify"}
                      </Button>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <Label>Organization Name *</Label>
                    <Input required value={f.company_name} onChange={(e) => handleInputChange('company_name', e.target.value)} placeholder="Company Name" className="mt-1" />
                  </div>

                  <div className="sm:col-span-2">
                    <Label>Organization Website</Label>
                    <Input type="url" value={f.website} onChange={(e) => handleInputChange('website', e.target.value)} placeholder="https://..." className="mt-1" />
                  </div>

                  <div>
                    <Label>Organization Type *</Label>
                    <Select value={f.org_type} onValueChange={(v) => handleInputChange('org_type', v)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>{ORG_TYPES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Legal Structure *</Label>
                    <Select value={f.legal_structure} onValueChange={(v) => handleInputChange('legal_structure', v)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select structure" /></SelectTrigger>
                      <SelectContent>{LEGAL_STRUCTURES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>

                  <div className="sm:col-span-2">
                    <Label>Core Sector of Operation *</Label>
                    <Select value={f.selected_sector} onValueChange={(v) => handleInputChange('selected_sector', v)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select Sector from list..." /></SelectTrigger>
                      <SelectContent>
                        {SECTORS_LIST.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {f.selected_sector === "Others" && (
                    <div className="sm:col-span-2 mt-1 animate-in slide-in-from-top-2 duration-300">
                      <Label className="text-saffron">Please specify your Sector *</Label>
                      <Input 
                        required 
                        value={f.custom_sector} 
                        onChange={(e) => handleInputChange('custom_sector', e.target.value)} 
                        placeholder="e.g. Artificial Intelligence Research" 
                        className="mt-1 border-saffron focus-visible:ring-saffron" 
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: LOCATION */}
            {step === 2 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-display font-bold text-navy border-b pb-2">Location & Address Details</h3>
                
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <Label>Pincode *</Label>
                    <Input required maxLength={6} value={f.pincode} onChange={(e) => handleInputChange('pincode', e.target.value.replace(/\D/g, ''))} placeholder="560001" className="mt-1" />
                  </div>
                  <div>
                    <Label>State / Union Territory *</Label>
                    <Input required value={f.state} onChange={(e) => handleInputChange('state', e.target.value)} placeholder="Karnataka" className="mt-1" />
                  </div>
                  <div>
                    <Label>District *</Label>
                    <Input required value={f.district} onChange={(e) => handleInputChange('district', e.target.value)} placeholder="Bengaluru Urban" className="mt-1" />
                  </div>
                  <div>
                    <Label>Taluk *</Label>
                    <Input required value={f.taluk} onChange={(e) => handleInputChange('taluk', e.target.value)} placeholder="Bengaluru" className="mt-1" />
                  </div>
                  
                  <div className="sm:col-span-2">
                    <Label>Current Full Address *</Label>
                    <Textarea required value={f.current_address} onChange={(e) => handleInputChange('current_address', e.target.value)} placeholder="Building, Street, Area..." className="mt-1 resize-none" rows={3} />
                  </div>

                  <div>
                    <Label>Resident Type *</Label>
                    <Select value={f.resident_type} onValueChange={(v) => handleInputChange('resident_type', v)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Urban">Urban Resident</SelectItem>
                        <SelectItem value="Rural">Rural Resident</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Organizational Presence *</Label>
                    <Select value={f.org_presence} onValueChange={(v) => handleInputChange('org_presence', v)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select presence" /></SelectTrigger>
                      <SelectContent>{ORG_PRESENCE.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: PoC & SECURITY */}
            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                
                {/* PoC 1 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-display font-bold text-navy border-b pb-2">Primary Contact (Admin Login)</h3>
                  <div className="grid sm:grid-cols-12 gap-4">
                    <div className="sm:col-span-3">
                      <Label>Title *</Label>
                      <Select value={f.poc1_title} onValueChange={(v) => handleInputChange('poc1_title', v)}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Title" /></SelectTrigger>
                        <SelectContent>{TITLES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="sm:col-span-5">
                      <Label>Full Name *</Label>
                      <Input required value={f.poc1_name} onChange={(e) => handleInputChange('poc1_name', e.target.value)} className="mt-1" />
                    </div>
                    <div className="sm:col-span-4">
                      <Label>Designation *</Label>
                      <Select value={f.poc1_designation} onValueChange={(v) => handleInputChange('poc1_designation', v)}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Designation" /></SelectTrigger>
                        <SelectContent>{DESIGNATIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>

                    <div className="sm:col-span-6">
                      <Label>WhatsApp Number *</Label>
                      <div className="flex gap-2 mt-1">
                        <Input required value={f.poc1_phone} onChange={(e) => handleInputChange('poc1_phone', e.target.value.replace(/\D/g, ''))} disabled={isOtpVerified} />
                        {!isOtpVerified && <Button type="button" variant="secondary" onClick={handleSendOTP}>Send OTP</Button>}
                        {isOtpVerified && <Badge className="bg-india-green flex items-center justify-center px-4 rounded-md">Verified</Badge>}
                      </div>
                    </div>
                    <div className="sm:col-span-6">
                      <Label>Official Email ID *</Label>
                      <Input required type="email" value={f.poc1_email} onChange={(e) => handleInputChange('poc1_email', e.target.value)} className="mt-1" />
                    </div>
                  </div>

                  {otpSent && !isOtpVerified && (
                    <div className="bg-saffron/10 border border-saffron/30 p-4 rounded-lg flex gap-3 items-end">
                      <div className="flex-1">
                        <Label className="text-navy">Enter Mobile OTP *</Label>
                        <Input value={enteredOtp} onChange={(e) => setEnteredOtp(e.target.value)} placeholder="Use 1234" className="mt-1 bg-white" />
                      </div>
                      <Button type="button" onClick={handleVerifyOTP} className="bg-navy text-white">Verify OTP</Button>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4 pt-2">
                    <div className="relative">
                      <Label>Set Panel Password *</Label>
                      <Input 
                        required 
                        type={showPassword ? "text" : "password"} 
                        value={f.password} 
                        onChange={(e) => handleInputChange('password', e.target.value)} 
                        className="mt-1 pr-10" 
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[34px] text-slate-400 hover:text-navy transition-colors">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <div className="flex items-start gap-1.5 mt-2">
                        <AlertCircle className="h-3 w-3 text-saffron mt-0.5 shrink-0" />
                        <p className="text-[10px] text-slate-500 leading-tight">Must be at least 8 characters, include 1 Uppercase, 1 Lowercase, 1 Number, & 1 Special Character.</p>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <Label>Confirm Password *</Label>
                      <Input 
                        required 
                        type={showConfirmPassword ? "text" : "password"} 
                        value={f.confirmPassword} 
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)} 
                        className="mt-1 pr-10" 
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-[34px] text-slate-400 hover:text-navy transition-colors">
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      {f.confirmPassword.length > 0 && f.password !== f.confirmPassword && (
                        <p className="text-[10px] text-red-500 mt-1.5 font-medium">Passwords do not match.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* PoC 2 (Optional) */}
                <div className="space-y-4 pt-4 border-t border-border/40">
                  <h3 className="text-lg font-display font-bold text-navy border-b pb-2">Secondary Contact (Optional)</h3>
                  <div className="grid sm:grid-cols-12 gap-4">
                    <div className="sm:col-span-3">
                      <Label>Title</Label>
                      <Select value={f.poc2_title} onValueChange={(v) => handleInputChange('poc2_title', v)}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Title" /></SelectTrigger>
                        <SelectContent>{TITLES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="sm:col-span-5">
                      <Label>Full Name</Label>
                      <Input value={f.poc2_name} onChange={(e) => handleInputChange('poc2_name', e.target.value)} className="mt-1" />
                    </div>
                    <div className="sm:col-span-4">
                      <Label>Designation</Label>
                      <Select value={f.poc2_designation} onValueChange={(v) => handleInputChange('poc2_designation', v)}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Designation" /></SelectTrigger>
                        <SelectContent>{DESIGNATIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: OPERATIONS & INCLUSION */}
            {step === 4 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-display font-bold text-navy border-b pb-2">Operations & Inclusion</h3>
                
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <Label>Current Employee Strength *</Label>
                    <Select value={f.employee_strength} onValueChange={(v) => handleInputChange('employee_strength', v)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select range" /></SelectTrigger>
                      <SelectContent>{EMPLOYEE_STRENGTH.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Do you hire Persons with Disabilities? *</Label>
                    <Select value={f.hire_pwds} onValueChange={(v) => handleInputChange('hire_pwds', v)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select option" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                        <SelectItem value="Planning to">Planning to</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(f.hire_pwds === "Yes" || f.hire_pwds === "Planning to") && (
                    <div className="sm:col-span-2">
                      <Label>Disability Types Accepted (Select multiple)</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {DISABILITIES.map(d => (
                          <Badge 
                            key={d} 
                            variant={f.accepted_disabilities.includes(d) ? "default" : "outline"}
                            className={`cursor-pointer px-3 py-1.5 ${f.accepted_disabilities.includes(d) ? "bg-navy text-white" : "hover:bg-slate-100"}`}
                            onClick={() => toggleDisability(d)}
                          >
                            {d}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 5: DOCUMENTS & DECLARATIONS */}
            {step === 5 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-display font-bold text-navy border-b pb-2">Documents & Declarations</h3>
                
                <div className="p-5 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 text-center">
                  <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                    <Upload className="h-5 w-5 text-navy" />
                  </div>
                  <Label htmlFor="logo-upload" className="cursor-pointer text-navy font-semibold hover:underline">
                    Click to upload Organization Logo
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1 mb-3">PDF, JPG, PNG only (Max 2MB)</p>
                  <Input 
                    id="logo-upload" 
                    type="file" 
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && file.size > 2 * 1024 * 1024) return toast.error("File size must be under 2MB");
                      if (file) setLogoFile(file);
                    }}
                  />
                  {logoFile && (
                    <Badge variant="secondary" className="bg-white border-slate-200">
                      {logoFile.name} ({(logoFile.size / 1024).toFixed(0)} KB)
                    </Badge>
                  )}
                </div>

                <div>
                  <Label>How did you hear about us?</Label>
                  <Select value={f.source_of_discovery} onValueChange={(v) => handleInputChange('source_of_discovery', v)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select source" /></SelectTrigger>
                    <SelectContent>{DISCOVERY_SOURCES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                <div className="space-y-3 bg-slate-100 p-4 rounded-lg border border-slate-200">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={f.policy_agreed} onChange={(e) => handleInputChange('policy_agreed', e.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-300 text-navy focus:ring-navy" />
                    <span className="text-sm text-slate-700">Self-declaration of compliance with labour laws & confirm organization is not blacklisted. *</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={f.consent_agreed} onChange={(e) => handleInputChange('consent_agreed', e.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-300 text-navy focus:ring-navy" />
                    <span className="text-sm text-slate-700">Consent to data usage & communication regarding hiring events and candidates. *</span>
                  </label>
                </div>
              </div>
            )}

            {/* NAVIGATION BUTTONS */}
            <div className="flex items-center justify-between pt-6 border-t border-border/40">
              <Button type="button" variant="outline" onClick={() => step > 1 ? setStep(step - 1) : navigate({to: "/for-employers"})}>
                {step === 1 ? "Cancel" : "Back"}
              </Button>

              {step < 5 ? (
                <Button type="button" onClick={handleNextStep} className="bg-navy text-white hover:bg-navy/90 px-8">
                  Next Step
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting || !f.policy_agreed || !f.consent_agreed} className="bg-saffron text-navy hover:bg-saffron/90 font-semibold px-8">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Complete Registration
                </Button>
              )}
            </div>

          </form>
        </Card>
      </div>
    </div>
  );
}
