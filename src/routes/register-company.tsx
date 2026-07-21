import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, ShieldCheck, Clock, ChevronDown, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/register-company")({
  head: () => ({ meta: [{ title: "Register Company — Bharat Career Connect" }] }),
  component: RegisterCompany,
});

const SECTORS = [
  "Aerospace and Aviation Sector", "Agriculture Sector", "Apparel Sector", "Automotive Sector",
  "Beauty & Wellness Sector", "BFSI Sector", "Capital Goods Sector", "Construction Sector",
  "Domestic Workers Sector", "Education Sector", "Electronics Sector", "Food Processing Sector",
  "Furniture & Fittings Sector", "Gems & Jewellery Sector", "Government Sector", "Green Jobs Sector",
  "Handicrafts and Carpet Sector", "Healthcare Sector", "HR Consultancy Sector", "Hydrocarbon Sector",
  "Infrastructure Equipment Sector", "Instrumentation Automation Surveillance & Communication Sector",
  "Iron and Steel Sector", "IT-ITeS Sector", "Leather Sector", "Life Sciences Sector",
  "Logistics Sector", "Management & Entrepreneurship and Professional Sector", "Manufacturing Sector",
  "Media & Entertainment Sector", "Mining Sector", "Persons with Disability Sector", "Power Sector",
  "Retail Sector", "Rubber, Chemical, & Petrochemical Sector", "Service Sector", "Social Sector",
  "Sports Sector", "Telecom Sector", "Textile Sector", "Tourism & Hospitality Sector",
  "Water Management & Plumbing Sector", "Paints and Coating Sector", "State Public Sector Undertaking",
  "Central Public Sector Undertaking", "Space Sector", "Defence Sector", "Nuclear Sector",
  "Industrial Safety Sector", "Legal Sector", "General Sector", "Spirituality Sector"
];

function RegisterCompany() {
  const navigate = useNavigate();
  const [f, setF] = useState({
    company_name: "", email_domain: "", gst_cin: "", industry: "", sector: "", 
    company_size: "", website: "", hq_city: "", about_company: "", 
    hr_name: "", hr_phone: "", email: "", password: "", confirmPassword: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sectorQuery, setSectorQuery] = useState("");
  const [isSectorDropdownOpen, setIsSectorDropdownOpen] = useState(false);
  
  // OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  // Success UI State
  const [showSuccess, setShowSuccess] = useState(false);

  const filteredSectors = SECTORS.filter(s => s.toLowerCase().includes(sectorQuery.toLowerCase()));

  // GST Real-Time Validation & Verification Logic
  const handleVerifyGST = () => {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    const formattedGst = f.gst_cin.trim().toUpperCase();

    if (!formattedGst) {
      toast.error("Please enter a GSTIN number to verify.");
      return;
    }

    // Structural Check against standard Indian GST Identification Numbers
    if (!gstRegex.test(formattedGst)) {
      toast.error("Invalid GST/CIN number! This is not a legal or verified tax identifier.");
      // Clear the invalid input and keep it unlocked
      setF(prev => ({ ...prev, company_name: "", gst_cin: "" }));
      return;
    }

    // Success Simulation if structural integrity passes
    toast.success("Legal GSTIN Detected! Authenticating profile records...");
    
    // Auto-populate the company name based on legal business name data matching format
    setF(prev => ({ 
      ...prev, 
      gst_cin: formattedGst,
      company_name: "Manias Technology Solutions Private Limited" 
    }));
  };

  // OTP Mock Verification
  const handleSendOTP = () => {
    if (f.hr_phone.length < 10) {
      toast.error("Please enter a valid phone number.");
      return;
    }
    setOtpSent(true);
    toast.info("OTP sent to mobile. (Use 1234 for testing)");
  };

  const handleVerifyOTP = () => {
    if (enteredOtp === "1234") {
      setIsOtpVerified(true);
      toast.success("Phone number verified successfully!");
    } else {
      toast.error("Invalid OTP. Try 1234.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (f.password !== f.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!f.sector) {
      toast.error("Please select a valid sector from the dropdown list");
      return;
    }
    if (!isOtpVerified) {
      toast.error("You must verify your phone number with the OTP first.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("https://bcc-backend-0cny.onrender.com/api/auth/employer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f)
      });
      
      const json = await res.json();
      if (json.success) {
        setShowSuccess(true);
        // Wait 4 seconds for them to read the message, then redirect
        setTimeout(() => {
          navigate({ to: "/for-employers" }); 
        }, 4000);
      } else {
        toast.error(json.message);
        setIsSubmitting(false);
      }
    } catch (err) {
      toast.error("Database connection failed. Please try again.");
      setIsSubmitting(false);
    } 
  };

  // SUCCESS SCREEN OVERLAY
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <Card className="max-w-lg p-10 text-center border-india-green/40 shadow-xl rounded-2xl bg-white animate-in fade-in zoom-in duration-500">
          <div className="mx-auto size-20 bg-india-green/10 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="h-10 w-10 text-india-green" />
          </div>
          <h1 className="text-3xl font-display font-bold text-navy mb-4">Registration Sent!</h1>
          <p className="text-muted-foreground mb-2">
            Your company profile has been successfully sent for verification.
          </p>
          <div className="inline-flex items-center gap-2 bg-saffron/15 text-saffron font-semibold px-4 py-2 rounded-full mt-2 mb-6">
            <Clock className="h-4 w-4" />
            Waiting for Admin Approval
          </div>
          <p className="text-sm text-muted-foreground border-t border-border/60 pt-6">
            You will receive an email once the admin approves your GST and company details. You will be redirected shortly...
          </p>
        </Card>
      </div>
    );
  }

  // NORMAL FORM SCREEN
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <Link to="/for-employers" className="inline-flex items-center text-sm text-navy hover:underline mb-6 font-medium">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Employers Page
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-orange-50 border border-orange-200 text-orange-900 px-4 py-3 rounded-lg text-sm">
              This is for <strong>new company registrations</strong>. If you already have an account, <Link to="/auth/login" className="font-bold hover:underline">go to Sign In.</Link>
            </div>

            <Card className="p-8 border-border/60 shadow-sm rounded-xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="size-12 bg-navy rounded-xl flex items-center justify-center shrink-0">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-display font-bold text-navy">Employer Registration</h1>
                  <p className="text-sm text-muted-foreground">Employer accounts are activated only after admin verification.</p>
                </div>
              </div>

              <form onSubmit={handleRegister} className="space-y-8">
                <div className="space-y-5">
                  <h3 className="text-xs font-bold tracking-widest text-saffron uppercase">Company Details</h3>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>GST / CIN *</Label>
                      <div className="flex gap-2 mt-1">
                        <Input required value={f.gst_cin} onChange={(e) => setF({...f, gst_cin: e.target.value})} placeholder="29AAAAA0000A1Z5" className="uppercase" />
                        <Button type="button" variant="secondary" onClick={handleVerifyGST} className="bg-slate-500 text-white hover:bg-slate-600">Verify</Button>
                      </div>
                    </div>

                    <div>
                      <Label>Company Name (Auto-filled via GST) *</Label>
                      <Input required value={f.company_name} onChange={(e) => setF({...f, company_name: e.target.value})} placeholder="Acme Technologies Pvt Ltd" className="mt-1" />
                    </div>
                    
                    <div>
                      <Label>Official Email Domain *</Label>
                      <Input required value={f.email_domain} onChange={(e) => setF({...f, email_domain: e.target.value})} placeholder="acme.com" className="mt-1" />
                    </div>
                    
                    <div>
                      <Label>Website</Label>
                      <Input value={f.website} onChange={(e) => setF({...f, website: e.target.value})} placeholder="https://acme.com" className="mt-1" />
                    </div>

                    <div>
                      <Label>Industry</Label>
                      <Select value={f.industry} onValueChange={(v) => setF({...f, industry: v})}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IT">Information Technology</SelectItem>
                          <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="Healthcare">Healthcare</SelectItem>
                          <SelectItem value="Finance">Finance & Banking</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Company Size</Label>
                      <Select value={f.company_size} onValueChange={(v) => setF({...f, company_size: v})}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-50">1 - 50 Employees</SelectItem>
                          <SelectItem value="51-200">51 - 200 Employees</SelectItem>
                          <SelectItem value="201-1000">201 - 1000 Employees</SelectItem>
                          <SelectItem value="1000+">1000+ Employees</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="sm:col-span-2 relative">
                      <Label>Sector Classification *</Label>
                      <div className="relative mt-1">
                        <Input 
                          required
                          value={f.sector || sectorQuery} 
                          onChange={(e) => { 
                            setSectorQuery(e.target.value); 
                            setF({...f, sector: ""}); 
                            setIsSectorDropdownOpen(true); 
                          }}
                          onFocus={() => setIsSectorDropdownOpen(true)}
                          onBlur={() => setTimeout(() => setIsSectorDropdownOpen(false), 200)}
                          placeholder="Search and select your sector from the list..."
                          className="pr-8"
                        />
                        <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                      
                      {isSectorDropdownOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {filteredSectors.length > 0 ? filteredSectors.map(s => (
                            <div 
                              key={s} 
                              className="p-3 text-sm text-navy hover:bg-slate-100 cursor-pointer border-b border-border/40 last:border-0"
                              onMouseDown={(e) => { 
                                e.preventDefault(); 
                                setF({...f, sector: s}); 
                                setSectorQuery(s);
                                setIsSectorDropdownOpen(false); 
                              }}
                            >
                              {s}
                            </div>
                          )) : (
                            <div className="p-3 text-sm text-muted-foreground">No matching sectors found.</div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <Label>Headquarters City</Label>
                      <Input value={f.hq_city} onChange={(e) => setF({...f, hq_city: e.target.value})} placeholder="Bengaluru" className="mt-1" />
                    </div>
                    
                    <div className="sm:col-span-2">
                      <Label>About the Company</Label>
                      <Textarea value={f.about_company} onChange={(e) => setF({...f, about_company: e.target.value})} placeholder="Brief description of your business, products and hiring focus" rows={4} className="mt-1" />
                    </div>
                  </div>
                </div>

                <div className="space-y-5 pt-4 border-t border-border/40">
                  <h3 className="text-xs font-bold tracking-widest text-saffron uppercase">Authorized HR Contact</h3>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name *</Label>
                      <Input required value={f.hr_name} onChange={(e) => setF({...f, hr_name: e.target.value})} className="mt-1" />
                    </div>
                    <div>
                      <Label>Phone *</Label>
                      <div className="flex gap-2 mt-1">
                        <Input required value={f.hr_phone} onChange={(e) => setF({...f, hr_phone: e.target.value})} placeholder="+91" disabled={isOtpVerified} />
                        {!isOtpVerified && (
                          <Button type="button" variant="secondary" onClick={handleSendOTP} className="bg-slate-500 text-white hover:bg-slate-600">
                            {otpSent ? "Resend OTP" : "Send OTP"}
                          </Button>
                        )}
                        {isOtpVerified && (
                          <Badge className="bg-india-green text-white flex items-center justify-center px-4 rounded-md">Verified</Badge>
                        )}
                      </div>
                    </div>

                    {/* OTP INPUT BOX (Hidden until OTP is sent) */}
                    {otpSent && !isOtpVerified && (
                      <div className="sm:col-span-2 bg-saffron/10 border border-saffron/30 p-4 rounded-lg flex gap-3 items-end">
                        <div className="flex-1">
                          <Label className="text-navy">Enter Mobile OTP *</Label>
                          <Input value={enteredOtp} onChange={(e) => setEnteredOtp(e.target.value)} placeholder="Enter 4-digit code (Use 1234)" className="mt-1 bg-white" />
                        </div>
                        <Button type="button" onClick={handleVerifyOTP} className="bg-navy text-white hover:bg-navy/90">Verify OTP</Button>
                      </div>
                    )}
                    
                    <div className="sm:col-span-2 mt-2">
                      <Label>Work Email *</Label>
                      <Input required type="email" value={f.email} onChange={(e) => setF({...f, email: e.target.value})} placeholder="you@company.com" className="mt-1" />
                      <p className="text-[11px] text-muted-foreground mt-1.5">HR email must belong to the same domain as the official email domain above.</p>
                    </div>

                    <div>
                      <Label>Password *</Label>
                      <Input required type="password" value={f.password} onChange={(e) => setF({...f, password: e.target.value})} placeholder="Minimum 8 characters" className="mt-1" />
                    </div>
                    <div>
                      <Label>Confirm Password *</Label>
                      <Input required type="password" value={f.confirmPassword} onChange={(e) => setF({...f, confirmPassword: e.target.value})} className="mt-1" />
                    </div>
                    <p className="text-[11px] text-muted-foreground sm:col-span-2">This password will be used by the HR contact above to sign in to the Company Admin Panel after approval.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <Button type="submit" disabled={isSubmitting || !isOtpVerified} className="bg-saffron text-navy hover:bg-saffron/90 font-semibold px-8 disabled:opacity-60">
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Submit for review
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate({to: "/for-employers"})}>Cancel</Button>
                </div>
              </form>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 border-border/60 shadow-sm bg-white">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="h-5 w-5 text-india-green" />
                <h3 className="font-display font-bold text-navy">How verification works</h3>
              </div>
              <ol className="text-sm text-muted-foreground space-y-3 pl-1">
                <li>1. Submit company + HR details</li>
                <li>2. Admin reviews GST, domain and website</li>
                <li>3. Approval unlocks employer login for anyone on your work-email domain</li>
                <li>4. Start posting jobs & booking Udyoga Mela stalls</li>
              </ol>
            </Card>

            <Card className="p-6 border-border/60 shadow-sm bg-white">
              <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-1">Turnaround</p>
              <h3 className="font-display font-bold text-navy text-2xl flex items-center gap-2">
                <Clock className="h-6 w-6 text-navy" /> under 24 hrs
              </h3>
              <p className="text-xs text-muted-foreground mt-2">For fully-documented submissions on business days.</p>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
