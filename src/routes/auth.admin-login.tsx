import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Logo, TricolorBar } from "@/components/Brand";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShieldCheck, ArrowLeft, AlertCircle } from "lucide-react";
import { setSession } from "@/lib/mockStore"; // <-- Crucial import for DashShell!

export const Route = createFileRoute("/auth/admin-login")({
  head: () => ({ meta: [{ title: "Admin Sign In — Bharat Career Connect" }, { name: "description", content: "Bharat Career Connect admin control panel sign-in." }] }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !password) { setError("Enter email and password"); return; }
    
    setIsLoading(true);

    try {
      // 🚀 Point to the MASTER LOGIN route
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Hardcode role as 'admin' so the backend securely validates it
        body: JSON.stringify({ role: 'admin', email, password }), 
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // 🚀 Save the session perfectly matching the backend payload
        setSession({ 
          id: data.data.id, 
          name: data.data.name, 
          email: data.data.email, 
          role: data.data.role 
        });
        
        toast.success("Welcome back, Admin");
        navigate({ to: "/admin" }); // Navigate to the admin dashboard
      } else {
        // Backend rejected the password/email
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Admin login error:", err);
      setError("Server connection failed. Is the backend running?");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col hero-gradient">
      <TricolorBar />
      <div className="p-4">
        <Button asChild variant="ghost" size="sm" className="text-navy hover:bg-navy/5">
          <Link to="/auth/login"><ArrowLeft className="h-4 w-4 mr-1" /> Back to sign in</Link>
        </Button>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 shadow-elegant border-border/60">
          <div className="flex justify-center mb-6"><Logo /></div>
          <div className="flex flex-col items-center">
            <div className="size-12 rounded-full bg-india-green/10 text-india-green flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-display font-bold text-navy text-center mt-3">Admin</h1>
            <p className="text-sm text-muted-foreground text-center mt-1">Bharat Career Connect control panel</p>
          </div>

          <div className="mt-4 rounded-md border border-india-green/30 bg-india-green/5 p-3 text-xs text-navy">
            Restricted access. Only authorised Bharat Career Connect administrators can sign in here.
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <Label>Email</Label>
              <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@bharatcareerconnect.in" className="mt-1" />
            </div>
            <div>
              <Label>Password</Label>
              <Input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1" />
            </div>

            {error && (
              <div className="flex gap-2 items-start rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <Button type="submit" disabled={isLoading} className="w-full bg-navy text-white hover:bg-navy/90">
              {isLoading ? "Authenticating..." : "Sign in to Control Panel"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}