import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge"; // <-- FIX: Added missing Badge import
import { CheckCircle2, User, Building2, Store, ShieldCheck, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/attend/$eventId")({
  head: () => ({ meta: [{ title: "Event Check-In — Bharat Career Connect" }] }),
  component: MobileCheckIn,
});

function MobileCheckIn() {
  const { eventId } = Route.useParams();
  
  // UI Steps: 'role' -> 'details' -> 'otp' -> 'verify' -> 'success'
  const [step, setStep] = useState<'role' | 'details' | 'otp' | 'verify' | 'success'>('role');
  const [loading, setLoading] = useState(false);

  // Form Data
  const [role, setRole] = useState<'candidate' | 'employer' | 'exhibitor'>('candidate');
  const [formData, setFormData] = useState({ email: "", phone: "", otp: "" });
  const [candidateData, setCandidateData] = useState<any>(null);

  // API Base URL (using your hardcoded IP for immediate compatibility)
  const API_BASE = "http://15.207.249.155:5000/api/admin";

  // Step 1: Select Role
  const handleRoleSelect = (selectedRole: any) => {
    setRole(selectedRole);
    setStep('details');
  };

  // Step 2: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/qr/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, phone: formData.phone, role })
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        setStep('otp');
      } else {
        toast.error(json.message);
      }
    } catch (err) {
      toast.error("Network error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/qr/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setCandidateData(json.data);
        setStep('verify');
      } else {
        toast.error(json.message || "Could not verify candidate data.");
      }
    } catch (err) {
      toast.error("Network error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Mark Final Attendance
  const handleMarkAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/qr/mark-attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, userId: candidateData.id, role })
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        setStep('success');
      } else {
        toast.error(json.message);
      }
    } catch (err) {
      toast.error("Network error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Header Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="h-12 w-12 bg-navy rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-2xl">B</span>
            </div>
            <div className="leading-tight">
              <h1 className="font-display font-black text-navy text-2xl tracking-tight">BHARAT <span className="text-saffron">CAREER</span></h1>
              <p className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] mt-0.5">CONNECT ENTRY</p>
            </div>
          </div>
        </div>

        {/* STEP 1: ROLE SELECTION */}
        {step === 'role' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-center font-bold text-navy text-xl mb-6">Select your profile to enter</h2>
            
            <button onClick={() => handleRoleSelect('candidate')} className="w-full bg-white p-6 rounded-2xl border border-border shadow-sm flex items-center gap-5 hover:border-navy hover:shadow-md transition-all text-left group">
              <div className="h-14 w-14 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform"><User className="h-7 w-7" /></div>
              <div><h3 className="font-bold text-navy text-lg">Candidate</h3><p className="text-sm text-muted-foreground mt-0.5">Looking for jobs</p></div>
            </button>

            <button onClick={() => handleRoleSelect('employer')} className="w-full bg-white p-6 rounded-2xl border border-border shadow-sm flex items-center gap-5 hover:border-india-green hover:shadow-md transition-all text-left group">
              <div className="h-14 w-14 bg-india-green/10 rounded-full flex items-center justify-center text-india-green group-hover:scale-110 transition-transform"><Building2 className="h-7 w-7" /></div>
              <div><h3 className="font-bold text-navy text-lg">Employer</h3><p className="text-sm text-muted-foreground mt-0.5">Hiring candidates</p></div>
            </button>

            <button onClick={() => handleRoleSelect('exhibitor')} className="w-full bg-white p-6 rounded-2xl border border-border shadow-sm flex items-center gap-5 hover:border-saffron hover:shadow-md transition-all text-left group">
              <div className="h-14 w-14 bg-saffron/10 rounded-full flex items-center justify-center text-saffron group-hover:scale-110 transition-transform"><Store className="h-7 w-7" /></div>
              <div><h3 className="font-bold text-navy text-lg">Exhibitor</h3><p className="text-sm text-muted-foreground mt-0.5">Managing a stall</p></div>
            </button>
          </div>
        )}

        {/* STEP 2: DETAILS FORM */}
        {step === 'details' && (
          <Card className="p-8 border-none shadow-lg rounded-2xl animate-in fade-in zoom-in-95 duration-300">
            <h2 className="font-display font-bold text-navy text-2xl text-center mb-2">Enter Details</h2>
            <p className="text-center text-sm text-muted-foreground mb-8">Verify your {role} registration to enter.</p>
            
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div>
                <Label className="text-navy font-semibold">Registered Email</Label>
                <Input required type="email" placeholder="john@example.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="mt-1.5 h-12 bg-slate-50 border-slate-200" />
              </div>
              <div>
                <Label className="text-navy font-semibold">Mobile Number</Label>
                <Input required type="tel" placeholder="10-digit mobile number" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="mt-1.5 h-12 bg-slate-50 border-slate-200" />
              </div>
              <div className="pt-2">
                <Button type="submit" className="w-full h-12 bg-navy text-white hover:bg-navy/90 text-md font-semibold rounded-xl" disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Request OTP"}
                </Button>
                <Button type="button" variant="ghost" className="w-full mt-3 text-muted-foreground hover:text-navy" onClick={() => setStep('role')}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* STEP 3: OTP VERIFICATION */}
        {step === 'otp' && (
          <Card className="p-8 border-none shadow-lg rounded-2xl animate-in fade-in zoom-in-95 duration-300 text-center">
            <div className="mx-auto w-16 h-16 bg-saffron/10 rounded-full flex items-center justify-center mb-6">
              <ShieldCheck className="h-8 w-8 text-saffron" />
            </div>
            <h2 className="font-display font-bold text-navy text-2xl mb-2">Verify OTP</h2>
            <p className="text-sm text-muted-foreground mb-8">Enter the 4-digit code sent to your mobile.</p>
            
            <form onSubmit={handleVerifyOtp}>
              <Input required type="text" maxLength={4} placeholder="1234" value={formData.otp} onChange={(e) => setFormData({...formData, otp: e.target.value})} className="text-center text-3xl tracking-[0.5em] h-16 mb-8 font-mono bg-slate-50 border-slate-200 rounded-xl" />
              
              <Button type="submit" className="w-full h-12 bg-saffron text-navy hover:bg-saffron/90 text-md font-bold rounded-xl" disabled={loading}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify & Proceed"}
              </Button>
              <Button type="button" variant="ghost" className="w-full mt-3 text-muted-foreground hover:text-navy" onClick={() => setStep('details')}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Change Details
              </Button>
            </form>
          </Card>
        )}

        {/* STEP 4: VERIFY DETAILS & MARK ATTENDANCE */}
        {step === 'verify' && candidateData && (
          <Card className="p-6 border-none shadow-lg rounded-2xl animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-3 border-b border-border pb-4 mb-5">
              <div className="h-12 w-12 bg-navy text-white rounded-full flex items-center justify-center font-bold text-xl">
                {/* FIX: Added fallback to prevent crash if name is empty in database */}
                {(candidateData.name || "User").charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-display font-bold text-navy text-xl leading-tight">{candidateData.name || "N/A"}</h2>
                <Badge variant="outline" className="mt-1 bg-slate-50 uppercase text-[10px] tracking-wider">{role}</Badge>
              </div>
            </div>

            <div className="space-y-4 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">System ID</p>
                <p className="font-mono font-medium text-navy mt-0.5">{candidateData.id || "N/A"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Email</p>
                  <p className="text-sm font-medium text-navy truncate mt-0.5" title={candidateData.email}>{candidateData.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Phone</p>
                  <p className="text-sm font-medium text-navy mt-0.5">{candidateData.phone || "N/A"}</p>
                </div>
              </div>
              {role === 'candidate' && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Qualification</p>
                  <p className="text-sm font-medium text-navy mt-0.5">{candidateData.qual || "N/A"}</p>
                </div>
              )}
            </div>
            
            <Button onClick={handleMarkAttendance} className="w-full h-14 bg-india-green hover:bg-india-green/90 text-white text-lg font-bold rounded-xl shadow-lg shadow-india-green/20" disabled={loading}>
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <><CheckCircle2 className="mr-2 h-6 w-6" /> Confirm Attendance</>}
            </Button>
          </Card>
        )}

        {/* STEP 5: SUCCESS */}
        {step === 'success' && (
          <Card className="p-8 border-none shadow-lg rounded-2xl animate-in zoom-in duration-500 text-center bg-gradient-to-b from-white to-india-green/5 border-t-4 border-t-india-green">
            <div className="h-24 w-24 bg-india-green rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-india-green/30">
              <CheckCircle2 className="h-12 w-12 text-white" />
            </div>
            <h2 className="font-display font-black text-navy text-2xl mb-2">Check-In Successful!</h2>
            <p className="text-muted-foreground mb-6">Attendance has been recorded in the database. You may now enter the venue.</p>
            
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm inline-block mx-auto text-left w-full">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Entry Timestamp</p>
              <p className="font-mono text-navy font-bold">{new Date().toLocaleString('en-IN')}</p>
            </div>
          </Card>
        )}

      </div>
    </div>
  );
}
