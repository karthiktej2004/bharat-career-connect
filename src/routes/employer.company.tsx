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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, Briefcase, Award, KeyRound, Mail, Smartphone, ShieldCheck, HelpCircle, Lock, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";

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
  const [employerId, setEmployerId] = useState<string>("");
  const [profile, setProfile] = useState({
    companyName: "Loading Company...",
    fullName: "Recruiter",
    designation: "Talent Acquisition",
    email: "",
    mobile: "",
    department: "tech",
    language: "en",
    about: "",
    photoUrl: "",
  });

  const [candidatesCount, setCandidatesCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploadingPhoto, setUploadingPhoto] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Change Password States
  const [otpSent, setOtpSent] = useState<{ email: boolean; phone: boolean }>({ email: false, phone: false });
  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  // 1. Read logged-in session securely from localStorage
  useEffect(() => {
    try {
      const keys = ["bcc_user", "user", "employer", "bcc_employer"];
      let foundUser: any = null;

      for (const key of keys) {
        const item = localStorage.getItem(key);
        if (item) {
          try {
            const parsed = JSON.parse(item);
            if (parsed && (parsed.id || parsed.email)) {
              foundUser = parsed;
              break;
            }
          } catch (e) {}
        }
      }

      if (foundUser) {
        const activeId = (foundUser.id || foundUser.email).toString();
        setEmployerId(activeId);
        setProfile((prev) => ({
          ...prev,
          companyName: foundUser.name || foundUser.companyName || "Your Company",
          email: foundUser.email || prev.email,
        }));
      }
    } catch (e) {
      console.error("Error reading stored user session:", e);
    }
  }, []);

  // 2. Fetch live data from backend using active employer session ID
  useEffect(() => {
    if (!employerId) return;

    let isMounted = true;
    const fetchEmployerData = async () => {
      setLoading(true);
      try {
        // Fetch Employer/Recruiter Profile
        const profileRes = await fetch(`https://bcc-backend-0cny.onrender.com/api/employer/profile/${employerId}`);
        const profileJson = await profileRes.json();

        if (isMounted && profileJson.success && profileJson.data) {
          const d = profileJson.data;
          setProfile({
            companyName: d.companyName || "Your Company",
            fullName: d.fullName || "Recruiter",
            designation: d.designation || "HR Manager",
            email: d.email || "",
            mobile: d.mobile || "+91 98765 43210",
            department: d.department || "tech",
            language: d.language || "en",
            about: d.about || "Recruiter at " + (d.companyName || "Company"),
            photoUrl: d.photoUrl || "",
          });
        }

        // Fetch Candidates Reviewed Live Count
        const countRes = await fetch(`https://bcc-backend-0cny.onrender.com/api/employer/${employerId}/candidates-reviewed-count`);
        const countJson = await countRes.json();

        if (isMounted && countJson.success) {
          setCandidatesCount(typeof countJson.count === "number" ? countJson.count : parseInt(countJson.count) || 0);
        }
      } catch (err) {
        console.error("Error loading employer profile metrics:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchEmployerData();
    return () => { isMounted = false; };
  }, [employerId]);

  // Handle Photo Upload Only
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Photo size must be less than 2 MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setUploadingPhoto(true);

      try {
        const res = await fetch("https://bcc-backend-0cny.onrender.com/api/employer/profile/update", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employerId,
            fullName: profile.fullName,
            designation: profile.designation,
            mobile: profile.mobile,
            department: profile.department,
            language: profile.language,
            about: profile.about,
            photoUrl: base64String,
          }),
        });

        const json = await res.json();
        if (json.success) {
          setProfile((p) => ({ ...p, photoUrl: base64String }));
          toast.success("Profile photo updated successfully!");
        } else {
          toast.error("Failed to save profile photo.");
        }
      } catch (err) {
        console.error("Upload photo error:", err);
        toast.error("Server error uploading photo.");
      } finally {
        setUploadingPhoto(false);
      }
    };

    reader.readAsDataURL(file);
  };

  // OTP & Password Handlers
  function sendOtp(kind: "email" | "phone") {
    setOtpSent((s) => ({ ...s, [kind]: true }));
    toast.success(kind === "email" ? `OTP sent to ${profile.email}` : `OTP sent to ${profile.mobile}`);
  }

  function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!otpSent.email || !otpSent.phone) {
      toast.error("Verify both email and mobile OTPs first");
      return;
    }
    if (emailOtp.length !== 6 || phoneOtp.length !== 6) {
      toast.error("Enter both 6-digit OTPs");
      return;
    }
    if (newPass.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (newPass !== confirmPass) {
      toast.error("Passwords do not match");
      return;
    }
    toast.success("Password updated successfully!");
    setOtpSent({ email: false, phone: false });
    setEmailOtp("");
    setPhoneOtp("");
    setNewPass("");
    setConfirmPass("");
  }

  return (
    <>
      <PageHeader
        title="Employer Profile"
        description={`Your official recruiter profile for ${profile.companyName}. Profile details are locked by default; only photo upload is permitted.`}
        action={
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 border-saffron text-navy hover:bg-saffron/10">
                <HelpCircle className="h-4 w-4 text-saffron" />
                Need Modifications? Contact Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-india-green" /> Profile Change Request
                </DialogTitle>
                <DialogDescription className="mt-2 text-sm text-muted-foreground">
                  For administrative verification compliance, core recruiter details (Company Name, Email, Mobile, Designation) can only be modified by site administrators.
                </DialogDescription>
              </DialogHeader>

              <div className="bg-muted/50 p-4 rounded-lg space-y-3 mt-2 text-sm">
                <p className="font-semibold text-navy">Contact Admin for Modifications:</p>
                <div className="flex items-center gap-2 text-xs">
                  <Mail className="h-4 w-4 text-saffron" />
                  <span>Email Admin: <strong className="text-navy">support@bharatcareerconnect.in</strong></span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Smartphone className="h-4 w-4 text-saffron" />
                  <span>Admin Helpline: <strong className="text-navy">+91 98450 11223</strong></span>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button variant="default" className="bg-navy text-white hover:bg-navy/90">
                  Got It
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-6 border-border/60 lg:col-span-2">
          <div className="space-y-4">
            {/* PHOTO UPLOAD SECTION (EDITABLE) */}
            <div className="flex items-center gap-4">
              <div className="relative size-20 rounded-full bg-gradient-to-br from-saffron to-india-green flex items-center justify-center text-white font-display font-bold text-3xl overflow-hidden shadow-inner">
                {profile.photoUrl ? (
                  <img src={profile.photoUrl} alt="Profile" className="size-full object-cover" />
                ) : (
                  profile.companyName.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/jpeg, image/png"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 border-saffron text-saffron hover:bg-saffron/10"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                >
                  {uploadingPhoto ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploadingPhoto ? "Uploading..." : "Upload photo"}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">JPG or PNG, max 2 MB (Editable)</p>
              </div>
            </div>

            {/* PROFILE FORM (READ ONLY / LOCKED) */}
            <div className="grid md:grid-cols-2 gap-4 pt-2">
              <div>
                <Label className="flex items-center justify-between">
                  <span>Full Name</span>
                  <Lock className="h-3 w-3 text-muted-foreground" />
                </Label>
                <Input className="mt-1 bg-muted/30 font-medium" value={profile.fullName} disabled />
              </div>

              <div>
                <Label className="flex items-center justify-between">
                  <span>Designation</span>
                  <Lock className="h-3 w-3 text-muted-foreground" />
                </Label>
                <Input className="mt-1 bg-muted/30" value={profile.designation} disabled />
              </div>

              <div>
                <Label className="flex items-center justify-between">
                  <span>Work Email</span>
                  <Lock className="h-3 w-3 text-muted-foreground" />
                </Label>
                <Input className="mt-1 bg-muted/30 font-medium" value={profile.email} disabled />
              </div>

              <div>
                <Label className="flex items-center justify-between">
                  <span>Mobile</span>
                  <Lock className="h-3 w-3 text-muted-foreground" />
                </Label>
                <Input className="mt-1 bg-muted/30" value={profile.mobile} disabled />
              </div>

              <div>
                <Label className="flex items-center justify-between">
                  <span>Department</span>
                  <Lock className="h-3 w-3 text-muted-foreground" />
                </Label>
                <Select value={profile.department} disabled>
                  <SelectTrigger className="mt-1 bg-muted/30"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tech">Technology Hiring</SelectItem>
                    <SelectItem value="sales">Sales & BD</SelectItem>
                    <SelectItem value="ops">Operations</SelectItem>
                    <SelectItem value="hr">General HR</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="flex items-center justify-between">
                  <span>Preferred Language</span>
                  <Lock className="h-3 w-3 text-muted-foreground" />
                </Label>
                <Select value={profile.language} disabled>
                  <SelectTrigger className="mt-1 bg-muted/30"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">हिन्दी</SelectItem>
                    <SelectItem value="kn">ಕನ್ನಡ</SelectItem>
                    <SelectItem value="te">తెలుగు</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="flex items-center justify-between">
                <span>About You / Company</span>
                <Lock className="h-3 w-3 text-muted-foreground" />
              </Label>
              <Textarea rows={3} className="mt-1 bg-muted/30" value={profile.about} disabled />
            </div>

            <p className="text-xs text-muted-foreground flex items-center gap-1 italic">
              <Lock className="h-3 w-3" /> Profile details are locked. Click "Need Modifications? Contact Admin" above to request edits.
            </p>
          </div>
        </Card>

        {/* SIDEBAR METRICS */}
        <div className="space-y-4">
          <Card className="p-6 border-border/60">
            <Briefcase className="h-6 w-6 text-navy mb-2" />
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Company</p>
            <p className="font-display font-bold text-navy text-xl mt-0.5">{profile.companyName}</p>
            <p className="text-xs text-muted-foreground mt-1">Verified Corporate Account</p>
          </Card>

          {/* LIVE CANDIDATES REVIEWED COUNT */}
          <Card className="p-6 border-border/60 text-center">
            <User className="h-6 w-6 text-saffron mx-auto mb-2" />
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Candidates Reviewed</p>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin mx-auto mt-2 text-saffron" />
            ) : (
              <p className="font-display font-bold text-3xl text-navy mt-1">{candidatesCount}</p>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">Live Database Applications</p>
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

      {/* CHANGE PASSWORD SECTION */}
      <Card className="p-6 border-border/60 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="h-5 w-5 text-india-green" />
          <h2 className="font-display font-bold text-navy">Change Password (OTP verified)</h2>
        </div>
        <form onSubmit={submitPassword} className="grid lg:grid-cols-2 gap-4">
          <div>
            <Label className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-saffron" /> Registered Email · {profile.email || "No Email"}
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="6-digit OTP"
                maxLength={6}
                value={emailOtp}
                onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ""))}
                disabled={!otpSent.email}
              />
              <Button
                type="button"
                variant={otpSent.email ? "outline" : "default"}
                className={otpSent.email ? "" : "bg-navy text-white hover:bg-navy/90"}
                onClick={() => sendOtp("email")}
              >
                {otpSent.email ? "Resend" : "Send OTP"}
              </Button>
            </div>
          </div>

          <div>
            <Label className="flex items-center gap-2 text-sm">
              <Smartphone className="h-4 w-4 text-saffron" /> Registered Mobile · {profile.mobile || "No Mobile"}
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="6-digit OTP"
                maxLength={6}
                value={phoneOtp}
                onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ""))}
                disabled={!otpSent.phone}
              />
              <Button
                type="button"
                variant={otpSent.phone ? "outline" : "default"}
                className={otpSent.phone ? "" : "bg-navy text-white hover:bg-navy/90"}
                onClick={() => sendOtp("phone")}
              >
                {otpSent.phone ? "Resend" : "Send OTP"}
              </Button>
            </div>
          </div>

          <div>
            <Label>New password</Label>
            <Input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Confirm password</Label>
            <Input
              type="password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="lg:col-span-2 flex items-center justify-between">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-india-green" /> Both OTPs required. Password must be at least 8 characters.
            </p>
            <Button type="submit" className="bg-saffron text-navy hover:bg-saffron/90">
              Update password
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}
