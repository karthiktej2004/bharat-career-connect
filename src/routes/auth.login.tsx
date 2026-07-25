import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo, TricolorBar } from "@/components/Brand";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { setSession } from "@/lib/mockStore";
import { toast } from "sonner";
import { GraduationCap, Building2, ShieldCheck, ArrowLeft, AlertCircle, KeyRound, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/auth/login")({
  head: () => ({ meta: [{ title: "Sign In — Bharat Career Connect" }, { name: "description", content: "Sign in as candidate or employer." }] }),
  component: LoginPage,
});

const ROLES = [
  { id: "candidate", label: "Candidate", icon: GraduationCap },
  { id: "employer", label: "Employer", icon: Building2 },
] as const;

type RoleId = (typeof ROLES)[number]["id"];

function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<RoleId>("candidate");
  
  // States for the form
  const [companyName, setCompanyName] = useState("");
  const [identifier, setIdentifier] = useState(""); // Used for Email or Phone
  const [password, setPassword] = useState(""); 
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ==========================================
  // 🚀 MASTER LOGIN FUNCTION
  // ==========================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      // Pulls the backend URL from Render's environment variables safely
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "https://bcc-backend-0cny.onrender.com"; 
      
      // Setup payload dynamically based on role
      const payload = role === "employer" 
        ? { role, company_name: companyName, email: identifier, password }
        : { role, identifier, password };

      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const json = await res.json();
      
      if (json.success) {
        toast.success("Login successful!");
        
        // Save the session data dynamically
        setSession({ 
          id: json.data.id, 
          name: json.data.name, 
          email: json.data.email, 
          role: json.data.role 
        });
        
        // Smart Redirect based on role
        if (json.data.role === 'candidate') {
          navigate({ to: "/candidate" });
        } else if (json.data.role === 'employer') {
          navigate({ to: "/employer" }); 
        }
      } else {
        // Displays backend's specific error messages
        setError(json.message);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Server connection failed. Is the backend running?");
    } finally {
      setIsLoading(false);
    }
  };

  const isEmployer = role === "employer";

  return (
    <div className="min-h-screen flex flex-col hero-gradient">
      <TricolorBar />
      <div className="p-4">
        <Button asChild variant="ghost" size="sm" className="text-navy hover:bg-navy/5">
          <Link to="/"><ArrowLeft className="h-4 w-4 mr-1" /> Back to home</Link>
        </Button>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 shadow-elegant border-border/60">
          <div className="flex justify-center mb-6"><Logo /></div>
          <h1 className="text-2xl font-display font-bold text-navy text-center">Welcome back</h1>
          <p className="text-sm text-muted-foreground text-center mt-1">Sign in to continue</p>

          <div className="grid grid-cols-2 gap-2 mt-6">
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => { 
                  setRole(r.id); 
                  setError(null); 
                  setCompanyName(""); 
                  setIdentifier(""); 
                  setPassword(""); 
                }}
                className={`p-3 rounded-lg border text-center transition ${role === r.id ? "border-saffron bg-saffron/10" : "border-border hover:bg-muted"}`}
              >
                <r.icon className={`h-5 w-5 mx-auto ${role === r.id ? "text-saffron" : "text-muted-foreground"}`} />
                <p className="text-xs font-medium mt-1 text-navy">{r.label}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            
            {/* Conditional Company Name Field for Employers */}
            {isEmployer && (
              <div>
                <Label>Company Name</Label>
                <Input required value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Tata Consultancy Services" className="mt-1" />
              </div>
            )}

            <div>
              <Label>{isEmployer ? "Work Email" : "Email or Mobile Number"}</Label>
              <Input required value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder={isEmployer ? "hr@company.com" : "you@email.com or 98xxxxxxxx"} className="mt-1" />
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <Label>Password</Label>
                <ForgotPasswordDialog currentRole={role} defaultIdentifier={identifier} />
              </div>
              <div className="relative mt-1">
                <Input required type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-muted-foreground hover:text-navy">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex gap-2 items-start rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p>{error}</p>
                </div>
              </div>
            )}

            <Button type="submit" disabled={isLoading} className="w-full bg-navy text-white hover:bg-navy/90">
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 text-sm text-center text-muted-foreground">
            {role === "candidate" ? (
              <p>New here? <Link to="/auth/signup" className="text-saffron font-medium hover:underline">Register as Candidate</Link></p>
            ) : (
              <p>New here? <Link to="/register-company" className="text-saffron font-medium hover:underline">Register as Employer</Link></p>
            )}
          </div>

          <div className="mt-6 pt-5 border-t border-border">
            <Button asChild variant="outline" size="sm" className="border-navy/20 text-navy w-full">
              <Link to="/auth/admin-login"><ShieldCheck className="h-4 w-4 mr-1" /> Are you a Bharat Career Connect Admin?</Link>
            </Button>
          </div>

        </Card>
      </div>
    </div>
  );
}


// ==========================================
// 🚀 FORGOT PASSWORD DIALOG WITH BACKEND API
// ==========================================
function ForgotPasswordDialog({ currentRole, defaultIdentifier }: { currentRole: string, defaultIdentifier: string }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"identify" | "verify" | "reset">("identify");
  const [identifier, setIdentifier] = useState(defaultIdentifier);
  const [otp, setOtp] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "https://bcc-backend-0cny.onrender.com";

  function reset() {
    setStep("identify"); 
    setOtp(""); 
    setPwd(""); 
    setPwd2("");
  }

  // 1. Send Request to check DB and generate OTP
  async function sendOtp() {
    const id = identifier.trim();
    if (!id) { toast.error("Enter your registered email or phone"); return; }
    
    setIsLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: currentRole, identifier: id })
      });
      const json = await res.json();
      
      if (json.success) {
        setStep("verify");
        toast.success(json.message); // Shows the success message from backend
      } else {
        toast.error(json.message); // Shows "Not registered" error from backend
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // 2. Just UI move to next step for OTP verification
  function verify() {
    if (otp.length < 6) { toast.error("Please enter a valid 6-digit OTP"); return; }
    setStep("reset");
  }

  // 3. Final submission with new password and OTP verification
  async function submitReset() {
    if (pwd.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (pwd !== pwd2) { toast.error("Passwords do not match"); return; }
    
    setIsLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          role: currentRole, 
          identifier: identifier, 
          otp: otp, 
          newPassword: pwd 
        })
      });
      const json = await res.json();
      
      if (json.success) {
        toast.success(json.message);
        setOpen(false); 
        reset();
      } else {
        toast.error(json.message); // E.g., "Invalid OTP"
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <button type="button" onClick={() => { setIdentifier(defaultIdentifier); setOpen(true); }} className="text-xs text-saffron font-medium hover:underline">
        Forgot password?
      </button>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-navy">
            <KeyRound className="h-4 w-4" /> Reset your password
          </DialogTitle>
          <DialogDescription>
            {step === "identify" && `Enter your registered ${currentRole === 'employer' ? 'Work Email' : 'Email or Mobile Number'} to receive an OTP.`}
            {step === "verify" && "Enter the 6-digit OTP sent to your contact details."}
            {step === "reset" && "Create a new password for your account."}
          </DialogDescription>
        </DialogHeader>

        {step === "identify" && (
          <div className="space-y-3">
            <Label>Registered {currentRole === 'employer' ? 'Email' : 'Email or Phone'}</Label>
            <Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder={currentRole === 'employer' ? "hr@company.com" : "you@email.com or 98xxxxxxxx"} />
          </div>
        )}

        {step === "verify" && (
          <div className="space-y-4">
            <div>
              <Label>Enter OTP</Label>
              <Input inputMode="numeric" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit code" className="mt-1" />
            </div>
            <button type="button" onClick={sendOtp} disabled={isLoading} className="text-xs text-saffron font-medium hover:underline">
              {isLoading ? "Sending..." : "Resend OTP"}
            </button>
          </div>
        )}

        {step === "reset" && (
          <div className="space-y-3">
            <div><Label>New password</Label><Input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} className="mt-1" /></div>
            <div><Label>Confirm new password</Label><Input type="password" value={pwd2} onChange={(e) => setPwd2(e.target.value)} className="mt-1" /></div>
          </div>
        )}

        <DialogFooter>
          {step === "identify" && <Button onClick={sendOtp} disabled={isLoading} className="bg-navy text-white hover:bg-navy/90 w-full">{isLoading ? "Verifying..." : "Send OTP"}</Button>}
          {step === "verify" && <Button onClick={verify} className="bg-navy text-white hover:bg-navy/90 w-full">Verify OTP</Button>}
          {step === "reset" && <Button onClick={submitReset} disabled={isLoading} className="bg-navy text-white hover:bg-navy/90 w-full">{isLoading ? "Updating..." : "Update password"}</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
