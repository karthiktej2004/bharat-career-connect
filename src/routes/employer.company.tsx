import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { DashShell, PageHeader } from "@/components/DashShell";
import { employerNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Upload, Loader2, Save, UserPlus, Trash2 } from "lucide-react";
import { getSession } from "@/lib/mockStore";
import { toast } from "sonner";

export const Route = createFileRoute("/employer/company")({
  head: () => ({ meta: [{ title: "Company Profile — Bharat Career Connect" }] }),
  component: EmployerCompanyProfile,
});

function EmployerCompanyProfile() {
  return (
    <DashShell role="employer" nav={employerNav}>
      <EmployerCompanyProfileBody />
    </DashShell>
  );
}

export function EmployerCompanyProfileBody() {
  const user = getSession();
  const userId = user?.id;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState({
    companyName: "",
    fullName: "",
    designation: "",
    email: "",
    mobile: "",
    department: "tech",
    language: "en",
    about: "",
    photoUrl: "",
  });

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/employer/profile/${userId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setProfile(json.data);
      }
    } catch (err) {
      toast.error("Failed to load company profile.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await new Promise((res) => setTimeout(res, 600)); // Simulate API save
      toast.success("Company profile details updated successfully!");
    } catch (e) {
      toast.error("Error saving profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Company Profile"
        description="Manage your organization details, brand overview, and HR team contacts."
      />

      {isLoading ? (
        <div className="flex justify-center p-16">
          <Loader2 className="h-8 w-8 animate-spin text-saffron" />
        </div>
      ) : (
        <form onSubmit={handleSaveProfile} className="space-y-6 mt-6">
          <Card className="p-6 border-border/60 space-y-4 bg-white shadow-sm">
            <h3 className="font-display font-bold text-lg text-navy flex items-center gap-2">
              <Building2 className="h-5 w-5 text-saffron" /> Organization Information
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Company Name</Label>
                <Input
                  value={profile.companyName}
                  onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Primary HR Contact Name</Label>
                <Input
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Official Email Address</Label>
                <Input
                  disabled
                  value={profile.email}
                  className="mt-1 bg-slate-100 text-muted-foreground"
                />
              </div>
              <div>
                <Label>HR Contact Phone</Label>
                <Input
                  value={profile.mobile}
                  onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>About Organization</Label>
              <Textarea
                rows={4}
                value={profile.about}
                onChange={(e) => setProfile({ ...profile, about: e.target.value })}
                className="mt-1"
                placeholder="Share your company's mission, culture, and hiring focus..."
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-saffron text-navy font-semibold hover:bg-saffron/90 gap-1.5"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Profile Changes
              </Button>
            </div>
          </Card>
        </form>
      )}
    </>
  );
}
