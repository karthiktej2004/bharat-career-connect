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
import { GraduationCap, Building2, ShieldCheck, ArrowLeft, AlertCircle, KeyRound, Mail, Phone, Eye, EyeOff } from "lucide-react";

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
  const [email, setEmail] = useState("");
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
      
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          role: role, 
          email: email, 
          password: password 
        })
      });
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
          // FIX: Redirects exactly to /employer so DashShell accepts the session!
          navigate({ to: "/employer" }); 
        }
      } else {
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
                onClick={() => { setRole(r.id); setError(null); }}
                className={`p-3 rounded-lg border text-center transition ${role === r.id ? "border-saffron bg-saffron/10" : "border-border hover:bg-muted"}`}
              >
                <r.icon className={`h-5 w-5 mx-auto ${role === r.id ? "text-saffron" : "text-muted-foreground"}`} />
                <p className="text-xs font-medium mt-1 text-navy">{r.label}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <Label>{isEmployer ? "Work Email" : "Email or Phone"}</Label>
              <Input required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={isEmployer ? "hr@company.com" : "you@email.com"} className="mt-1" />
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <Label>Password</Label>
                <ForgotPasswordDialog defaultIdentifier={email} />
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

function maskEmail(e: string) {
  const [u, d] = e.split("@");
  if (!u || !d) return e;
  return u.slice(0, 2) + "•••@" + d;
}
function maskPhone(p: string) {
  return p.length >= 4 ? "•••••" + p.slice(-4) : "•••••";
}

function ForgotPasswordDialog({ defaultIdentifier }: { defaultIdentifier: string }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"identify" | "verify" | "reset">("identify");
  const [identifier, setIdentifier] = useState(defaultIdentifier);
  const [linkedEmail, setLinkedEmail] = useState("");
  const [linkedPhone, setLinkedPhone] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [genEmailOtp, setGenEmailOtp] = useState("");
  const [genPhoneOtp, setGenPhoneOtp] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");

  function reset() {
    setStep("identify"); setEmailOtp(""); setPhoneOtp(""); setPwd(""); setPwd2("");
  }

  function sendOtp() {
    const id = identifier.trim();
    if (!id) { toast.error("Enter your registered email or phone"); return; }
    const isEmail = id.includes("@");
    const email = isEmail ? id : `${id.replace(/\D/g, "").slice(-6) || "user"}@example.com`;
    const phone = isEmail ? "98" + Math.floor(10000000 + Math.random() * 89999999) : id;
    const eOtp = String(Math.floor(100000 + Math.random() * 900000));
    const pOtp = String(Math.floor(100000 + Math.random() * 900000));
    setLinkedEmail(email); setLinkedPhone(phone);
    setGenEmailOtp(eOtp); setGenPhoneOtp(pOtp);
    setStep("verify");
    toast.success(`OTP sent to ${maskEmail(email)} and ${maskPhone(phone)}`);
    toast.message("Demo OTPs", { description: `Email: ${eOtp} • SMS: ${pOtp}` });
  }

  function verify() {
    if (emailOtp !== genEmailOtp) { toast.error("Invalid email OTP"); return; }
    if (phoneOtp !== genPhoneOtp) { toast.error("Invalid phone OTP"); return; }
    setStep("reset");
  }

  function submitReset() {
    if (pwd.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (pwd !== pwd2) { toast.error("Passwords do not match"); return; }
    toast.success("Password reset successful. Please sign in.");
    setOpen(false); reset();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <button type="button" onClick={() => setOpen(true)} className="text-xs text-saffron font-medium hover:underline">
        Forgot password?
      </button>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-navy">
            <KeyRound className="h-4 w-4" /> Reset your password
          </DialogTitle>
          <DialogDescription>
            {step === "identify" && "We'll send an OTP to your registered email and mobile number."}
            {step === "verify" && "Enter the 6-digit OTPs sent to your registered email and mobile."}
            {step === "reset" && "Create a new password for your account."}
          </DialogDescription>
        </DialogHeader>

        {step === "identify" && (
          <div className="space-y-3">
            <Label>Registered email or phone</Label>
            <Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="you@email.com or 98xxxxxxxx" />
          </div>
        )}

        {step === "verify" && (
          <div className="space-y-4">
            <div className="rounded-md border border-border bg-slate-50 p-3 text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> OTP sent to <span className="font-medium text-navy">{maskEmail(linkedEmail)}</span></div>
              <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> OTP sent to <span className="font-medium text-navy">{maskPhone(linkedPhone)}</span></div>
            </div>
            <div>
              <Label>Email OTP</Label>
              <Input inputMode="numeric" maxLength={6} value={emailOtp} onChange={(e) => setEmailOtp(e.target.value)} placeholder="6-digit code" className="mt-1" />
            </div>
            <div>
              <Label>Mobile OTP</Label>
              <Input inputMode="numeric" maxLength={6} value={phoneOtp} onChange={(e) => setPhoneOtp(e.target.value)} placeholder="6-digit code" className="mt-1" />
            </div>
            <button type="button" onClick={sendOtp} className="text-xs text-saffron font-medium hover:underline">Resend OTP</button>
          </div>
        )}

        {step === "reset" && (
          <div className="space-y-3">
            <div><Label>New password</Label><Input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} className="mt-1" /></div>
            <div><Label>Confirm new password</Label><Input type="password" value={pwd2} onChange={(e) => setPwd2(e.target.value)} className="mt-1" /></div>
          </div>
        )}

        <DialogFooter>
          {step === "identify" && <Button onClick={sendOtp} className="bg-navy text-white hover:bg-navy/90 w-full">Send OTP</Button>}
          {step === "verify" && <Button onClick={verify} className="bg-navy text-white hover:bg-navy/90 w-full">Verify</Button>}
          {step === "reset" && <Button onClick={submitReset} className="bg-navy text-white hover:bg-navy/90 w-full">Update password</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
