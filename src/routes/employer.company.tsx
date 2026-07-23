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
    fullName: "Priya Sharma",
    designation: "Senior Talent Acquisition",
    email: "priya@company.com",
    mobile: "+91 98450 11223",
    department: "tech",
    language: "en",
    about: "8+ years hiring tech talent across India. Focus on engineering and product roles.",
    photoUrl: "",
    companyName: "Acme Corp",
  });
  
  const [candidatesCount, setCandidatesCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploadingPhoto, setUploadingPhoto] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get Logged-in Employer ID from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("bcc_user") || localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed.id) setEmployerId(parsed.id.toString());
        if (parsed.name) setProfile((p) => ({ ...p, companyName: parsed.name }));
        if (parsed.email) setProfile((p) => ({ ...p, email: parsed.email }));
      }
    } catch (e) {
      console.error("Error reading stored user:", e);
    }
  }, []);

  // Fetch Live Profile & Candidates Count from Backend
  useEffect(() => {
    if (!employerId) return;

    const fetchEmployerData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Profile Data
        const profileRes = await fetch(`https://bcc-backend-0cny.onrender.com/api/employer/profile/${employerId}`);
        const profileJson = await profileRes.json();
        if (profileJson.success && profileJson.data) {
          const d = profileJson.data;
          setProfile((prev) => ({
            ...prev,
            fullName: d.full_name || prev.fullName,
            designation: d.designation || prev.designation,
            mobile: d.mobile || prev.mobile,
            department: d.department || prev.department,
            language: d.preferred_language || prev.language,
            about: d.about_you || prev.about,
            photoUrl: d.profile_photo_url || prev.photoUrl,
          }));
        }

        // 2. Fetch Live Candidates Reviewed Count
        const countRes = await fetch(`https://bcc-backend-0cny.onrender.com/api/employer/${employerId}/candidates-reviewed-count`);
        const countJson = await countRes.json();
        if (countJson.success) {
          setCandidatesCount(countJson.count);
        }
      } catch (err) {
        console.error("Error fetching employer profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployerData();
  }, [employerId]);

  // Handle Profile Photo Upload Only
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
          toast.error("Failed to save profile photo");
        }
      } catch (err) {
        console.error("Upload photo error:", err);
        toast.error("Server error uploading photo");
      } finally {
        setUploadingPhoto(false);
      }
    };

    reader.readAsDataURL(file);
  };

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
                  For administrative security and verification compliance, recruiter profile information (Name, Email, Mobile, Designation) can only be altered by site administrators.
                </DialogDescription>
              </DialogHeader>

              <div className="bg-muted/50 p-4 rounded-lg space-y-3 mt-2 text-sm">
                <p className="font-semibold text-navy">To request modifications or re-verifications:</p>
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
                  profile.fullName.charAt(0).toUpperCase()
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
                <Input className="mt-1 bg-muted/30" value={profile.fullName} disabled />
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
                <Input className="mt-1 bg-muted/30" value={profile.email} disabled />
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
                <span>About You</span>
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
            <p className="font-display font-bold text-navy text-lg">{profile.companyName}</p>
            <p className="text-xs text-muted-foreground mt-1">Managed by Company Admin</p>
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
    </>
  );
}
