import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo, TricolorBar } from "@/components/Brand";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Store, Building2, Mail, Phone, Lock, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/register-exhibitor")({
  head: () => ({ meta: [{ title: "Exhibitor Registration — Bharat Career Connect" }] }),
  component: ExhibitorRegistration,
});

function ExhibitorRegistration() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    company_name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/exhibitor/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const json = await res.json();
      
      if (json.success) {
        setIsSuccess(true);
        toast.success(json.message);
      } else {
        toast.error(json.message || "Registration failed.");
      }
    } catch (error) {
      toast.error("Network error. Please make sure the server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-muted/30">
        <TricolorBar />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-8 text-center shadow-elegant border-border/60">
            <div className="size-16 bg-india-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-india-green" />
            </div>
            <h2 className="text-2xl font-display font-bold text-navy mb-2">Application Submitted!</h2>
            <p className="text-muted-foreground mb-6">
              Your exhibitor registration for <strong>{formData.company_name}</strong> has been received. Our admin team will review and approve your account shortly.
            </p>
            <Button asChild className="w-full bg-navy text-white hover:bg-navy/90">
              <Link to="/auth/login">Return to Login</Link>
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col hero-gradient">
      <TricolorBar />
      <div className="p-4">
        <Button asChild variant="ghost" size="sm" className="text-navy hover:bg-navy/5">
          <Link to="/"><ArrowLeft className="h-4 w-4 mr-1" /> Back to home</Link>
        </Button>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg p-8 shadow-elegant border-border/60">
          <div className="flex justify-center mb-6"><Logo /></div>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-india-green/10 rounded-full mb-3">
              <Store className="h-6 w-6 text-india-green" />
            </div>
            <h1 className="text-2xl font-display font-bold text-navy">Exhibitor Registration</h1>
            <p className="text-sm text-muted-foreground mt-1">Create an account to showcase your brand at Udyoga Mela events.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label>Company / Organization Name *</Label>
              <div className="relative mt-1">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input required placeholder="Enter company name" className="pl-9" value={formData.company_name} onChange={(e) => setFormData({...formData, company_name: e.target.value})} />
              </div>
            </div>

            <div>
              <Label>Official Email Address *</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input required type="email" placeholder="contact@company.com" className="pl-9" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>

            <div>
              <Label>Contact Number</Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input type="tel" placeholder="10-digit mobile number" className="pl-9" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
            </div>

            <div>
              <Label>Create Password *</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input required type="password" placeholder="••••••••" className="pl-9" minLength={6} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full bg-india-green text-white hover:bg-india-green/90 mt-2">
              {isLoading ? "Submitting Application..." : "Submit Registration"}
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground mt-6">
            Already registered? <Link to="/auth/login" className="text-saffron font-medium hover:underline">Sign in here</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
