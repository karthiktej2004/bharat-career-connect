import { createFileRoute } from "@tanstack/react-router";
import { DashShell, PageHeader } from "@/components/DashShell";
import { employerNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Briefcase, Award, KeyRound, Mail, Smartphone, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/employer/company")({
  head: () => ({ meta: [{ title: "Employer Profile — Employer" }] }),
  component: Company,
});

function Company() {
  return (
    <DashShell role="employer" nav={employerNav}>
      <CompanyBody />
    </DashShell>
  );
}

export function CompanyBody() {
  const [otpSent, setOtpSent] = useState<{ email: boolean; phone: boolean }>({ email: false, phone: false });
  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  function sendOtp(kind: "email" | "phone") {
    setOtpSent(s => ({ ...s, [kind]: true }));
    toast.success(kind === "email" ? "OTP sent to priya@company.com" : "OTP sent to +91 98450 11223");
  }

  function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!otpSent.email || !otpSent.phone) { toast.error("Verify both email and mobile OTPs first"); return; }
    if (emailOtp.length !== 6 || phoneOtp.length !== 6) { toast.error("Enter both 6-digit OTPs"); return; }
    if (newPass.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (newPass !== confirmPass) { toast.error("Passwords do not match"); return; }
    toast.success("Password updated successfully");
    setOtpSent({ email: false, phone: false });
    setEmailOtp(""); setPhoneOtp(""); setNewPass(""); setConfirmPass("");
  }

  return (
    <>
      <PageHeader title="Employer Profile" description="Your personal recruiter profile at Acme Corp. Company details are managed by your Company Admin." />
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-6 border-border/60 lg:col-span-2">
          <form onSubmit={(e) => { e.preventDefault(); toast.success("Profile updated"); }} className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="size-20 rounded-full bg-gradient-to-br from-saffron to-india-green flex items-center justify-center text-white font-display font-bold text-3xl">P</div>
              <div>
                <Button type="button" variant="outline">Upload photo</Button>
                <p className="text-xs text-muted-foreground mt-1">JPG or PNG, max 2 MB</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div><Label>Full Name</Label><Input className="mt-1" defaultValue="Priya Sharma" /></div>
              <div><Label>Designation</Label><Input className="mt-1" defaultValue="Senior Talent Acquisition" /></div>
              <div><Label>Work Email</Label><Input className="mt-1" defaultValue="priya@company.com" disabled /></div>
              <div><Label>Mobile</Label><Input className="mt-1" defaultValue="+91 98450 11223" /></div>
              <div><Label>Department</Label>
                <Select defaultValue="tech">
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tech">Technology Hiring</SelectItem>
                    <SelectItem value="sales">Sales & BD</SelectItem>
                    <SelectItem value="ops">Operations</SelectItem>
                    <SelectItem value="hr">General HR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Preferred Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">हिन्दी</SelectItem>
                    <SelectItem value="kn">ಕನ್ನಡ</SelectItem>
                    <SelectItem value="te">తెలుగు</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>About You</Label><Textarea rows={3} className="mt-1" defaultValue="8+ years hiring tech talent across India. Focus on engineering and product roles." /></div>
            <Button type="submit" className="bg-saffron text-navy hover:bg-saffron/90">Save profile</Button>
          </form>
        </Card>

        <div className="space-y-4">
          <Card className="p-6 border-border/60">
            <Briefcase className="h-6 w-6 text-navy mb-2" />
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Company</p>
            <p className="font-display font-bold text-navy text-lg">Acme Corp</p>
            <p className="text-xs text-muted-foreground mt-1">Managed by Company Admin</p>
          </Card>
          <Card className="p-6 border-border/60 text-center">
            <User className="h-6 w-6 text-saffron mx-auto mb-2" />
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Candidates Reviewed</p>
            <p className="font-display font-bold text-3xl text-navy mt-1">184</p>
            <p className="text-xs text-muted-foreground">this quarter</p>
          </Card>
          <Card className="p-6 border-border/60">
            <Award className="h-6 w-6 text-saffron mb-2" />
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge className="bg-india-green/15 text-india-green">Verified Recruiter</Badge>
              <Badge className="bg-saffron/15 text-saffron">Top Rated 2026</Badge>
            </div>
          </Card>
        </div>
      </div>

      <Card className="p-6 border-border/60 mt-6">
        <div className="flex items-center gap-2 mb-4"><KeyRound className="h-5 w-5 text-india-green" /><h2 className="font-display font-bold text-navy">Change Password (OTP verified)</h2></div>
        <form onSubmit={submitPassword} className="grid lg:grid-cols-2 gap-4">
          <div>
            <Label className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-saffron" />Registered Email · priya@company.com</Label>
            <div className="flex gap-2 mt-1">
              <Input placeholder="6-digit OTP" maxLength={6} value={emailOtp} onChange={e => setEmailOtp(e.target.value.replace(/\D/g, ""))} disabled={!otpSent.email} />
              <Button type="button" variant={otpSent.email ? "outline" : "default"} className={otpSent.email ? "" : "bg-navy text-white hover:bg-navy/90"} onClick={() => sendOtp("email")}>{otpSent.email ? "Resend" : "Send OTP"}</Button>
            </div>
          </div>
          <div>
            <Label className="flex items-center gap-2 text-sm"><Smartphone className="h-4 w-4 text-saffron" />Registered Mobile · +91 98450 11223</Label>
            <div className="flex gap-2 mt-1">
              <Input placeholder="6-digit OTP" maxLength={6} value={phoneOtp} onChange={e => setPhoneOtp(e.target.value.replace(/\D/g, ""))} disabled={!otpSent.phone} />
              <Button type="button" variant={otpSent.phone ? "outline" : "default"} className={otpSent.phone ? "" : "bg-navy text-white hover:bg-navy/90"} onClick={() => sendOtp("phone")}>{otpSent.phone ? "Resend" : "Send OTP"}</Button>
            </div>
          </div>
          <div><Label>New password</Label><Input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} className="mt-1" /></div>
          <div><Label>Confirm password</Label><Input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} className="mt-1" /></div>
          <div className="lg:col-span-2 flex items-center justify-between">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-india-green" />Both OTPs required. Password must be at least 8 characters.</p>
            <Button type="submit" className="bg-saffron text-navy hover:bg-saffron/90">Update password</Button>
          </div>
        </form>
      </Card>
    </>
  );
}
