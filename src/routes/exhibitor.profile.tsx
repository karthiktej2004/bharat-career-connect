import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DashShell, PageHeader } from "@/components/DashShell";
import { exhibitorNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getSession } from "@/lib/mockStore";
import { Store, Building2, Mail, Phone, Globe, MapPin, FileText, Loader2, Save } from "lucide-react";

export const Route = createFileRoute("/exhibitor/profile")({
  head: () => ({ meta: [{ title: "Profile — Exhibitor Panel" }] }),
  component: ExhibitorProfile,
});

function ExhibitorProfile() {
  const user = getSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    id: user?.id || "",
    company_name: "",
    email: "",
    phone: "",
    website: "",
    gst_number: "",
    city: "",
    state: "",
    address: "",
    about_us: "",
    logo_url: "",
    status: "active"
  });

  const fetchProfile = async () => {
    if (!user?.id) return;
    try {
      // 🚨 ADDED FALLBACK URL HERE TO PREVENT BLANK PAGE 🚨
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://15.207.249.155:5000"}/api/exhibitor/profile/${user.id}`);
      const json = await res.json();
      
      if (json.success && json.data) {
        setFormData({
          id: json.data.id || user.id,
          company_name: json.data.company_name || "",
          email: json.data.email || "",
          phone: json.data.phone || "",
          website: json.data.website || "",
          gst_number: json.data.gst_number || "",
          city: json.data.city || "",
          state: json.data.state || "",
          address: json.data.address || "",
          about_us: json.data.about_us || "",
          logo_url: json.data.logo_url || "",
          status: json.data.status || "approved"
        });
      }
    } catch (error) {
      toast.error("Failed to load profile details from server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return toast.error("Logo image must be less than 2MB");
      const reader = new FileReader();
      reader.onloadend = () => setFormData((prev) => ({ ...prev, logo_url: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // 🚨 ADDED FALLBACK URL HERE TO PREVENT SAVE ERRORS 🚨
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://15.207.249.155:5000"}/api/exhibitor/profile/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
      } else {
        toast.error(json.message || "Failed to update profile.");
      }
    } catch (error) {
      toast.error("Network error saving profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashShell role="exhibitor" nav={exhibitorNav}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </DashShell>
    );
  }

  // 🚨 FORMAT THE DISPLAY ID CORRECTLY 🚨
  const displayId = `BCC-UMP-EXP-${String(formData.id).replace(/\D/g, '').padStart(9, '0')}`;

  return (
    <DashShell role="exhibitor" nav={exhibitorNav}>
      <PageHeader 
        title="Exhibitor Profile" 
        description="Manage your brand details, contact information, and public profile." 
      />

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-6 border-border/60">
          <div className="flex items-center justify-between mb-6 pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
                <Store className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-display font-bold text-navy text-lg">{formData.company_name || "Company Name"}</h2>
                <p className="text-xs text-muted-foreground">Exhibitor ID: {displayId}</p>
              </div>
            </div>
            <Badge className="bg-purple-600 text-white uppercase">{formData.status}</Badge>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>Company / Brand Name *</Label>
              <div className="relative mt-1">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input required value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} className="pl-9" />
              </div>
            </div>

            <div>
              <Label>Official Email Address (Primary)</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input disabled value={formData.email} className="pl-9 bg-muted/50 cursor-not-allowed" />
              </div>
            </div>

            <div>
              <Label>Contact Phone Number *</Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="pl-9" />
              </div>
            </div>

            <div>
              <Label>Official Website</Label>
              <div className="relative mt-1">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://www.company.com" className="pl-9" />
              </div>
            </div>

            <div>
              <Label>GST Number / Tax ID</Label>
              <div className="relative mt-1">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input value={formData.gst_number} onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })} placeholder="29AAAAA0000A1Z5" className="pl-9 uppercase" />
              </div>
            </div>

            <div>
              <Label>City</Label>
              <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="Bengaluru" className="mt-1" />
            </div>

            <div>
              <Label>State</Label>
              <Input value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} placeholder="Karnataka" className="mt-1" />
            </div>

            <div className="sm:col-span-2">
              <Label>Address</Label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Street address, building name..." className="pl-9" />
              </div>
            </div>

            <div className="sm:col-span-2">
              <Label>Company Brand Logo (Max 2MB)</Label>
              <Input type="file" accept="image/*" className="mt-1 cursor-pointer" onChange={handleLogoUpload} />
              {formData.logo_url && (
                <div className="mt-2 p-2 border rounded-md bg-muted/20 w-max">
                  <img src={formData.logo_url} alt="Logo Preview" className="h-20 w-auto rounded object-cover" />
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              <Label>About Company / Brand Description</Label>
              <Textarea rows={4} value={formData.about_us} onChange={(e) => setFormData({ ...formData, about_us: e.target.value })} placeholder="Describe your products, industry focus, and what you will display at the Udyoga Mela..." className="mt-1" />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={isSaving} className="bg-purple-600 text-white hover:bg-purple-700">
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Save Changes
            </Button>
          </div>
        </Card>
      </form>
    </DashShell>
  );
}
