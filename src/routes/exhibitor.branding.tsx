import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DashShell, PageHeader } from "@/components/DashShell";
import { exhibitorNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { getSession } from "@/lib/mockStore";
import { Loader2, Save, Image as ImageIcon, UploadCloud, MessageSquare, Palette, FileText, Trash2, Building2 } from "lucide-react";

export const Route = createFileRoute("/exhibitor/branding")({
  head: () => ({ meta: [{ title: "Branding & Promotion — Exhibitor Panel" }] }),
  component: ExhibitorBranding,
});

function ExhibitorBranding() {
  const user = getSession();
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [companyName, setCompanyName] = useState(user?.name || "Acme Corporation");

  // Branding State
  const [brandColor, setBrandColor] = useState("#0F172A");
  const [welcomeMsg, setWelcomeMsg] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  
  // Materials State
  const [materials, setMaterials] = useState<any[]>([]);
  const [matTitle, setMatTitle] = useState("");
  const [matType, setMatType] = useState("Brochure / PDF");
  const [matFile, setMatFile] = useState("");
  const [isUploadingMat, setIsUploadingMat] = useState(false);

  useEffect(() => {
    if (user?.id) fetchInitialData();
  }, [user?.id]);

  useEffect(() => {
    if (selectedEventId) fetchEventData(selectedEventId);
  }, [selectedEventId]);

  const fetchInitialData = async () => {
    try {
      // Get Approved Events
      const eventsRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/exhibitor/${user?.id}/approved-events`);
      const eventsJson = await eventsRes.json();
      if (eventsJson.success) {
        setEvents(eventsJson.data);
        if (eventsJson.data.length > 0) {
          setSelectedEventId(eventsJson.data[0].id.toString());
        }
      }
      
      // Get Profile for Company Name
      const profileRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/exhibitor/profile/${user?.id}`);
      const profileJson = await profileRes.json();
      if (profileJson.success && profileJson.data.company_name) {
        setCompanyName(profileJson.data.company_name);
      }
    } catch (error) {
      toast.error("Failed to load initial data.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEventData = async (eventId: string) => {
    try {
      const brandRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/exhibitor/${user?.id}/branding/${eventId}`);
      const brandJson = await brandRes.json();
      if (brandJson.success && brandJson.data) {
        setBrandColor(brandJson.data.brand_color || "#0F172A");
        setWelcomeMsg(brandJson.data.welcome_message || "");
        setBannerUrl(brandJson.data.banner_url || "");
      } else {
        // Reset if no data found for this event
        setBrandColor("#0F172A"); setWelcomeMsg(""); setBannerUrl("");
      }

      const matRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/exhibitor/${user?.id}/materials/${eventId}`);
      const matJson = await matRes.json();
      if (matJson.success) setMaterials(matJson.data);
    } catch (error) {
      toast.error("Failed to load event data.");
    }
  };

  const handleSaveBranding = async () => {
    if (!selectedEventId) return toast.error("Please select an event first.");
    setIsSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/exhibitor/${user?.id}/branding/${selectedEventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand_color: brandColor, welcome_message: welcomeMsg, banner_url: bannerUrl })
      });
      if ((await res.json()).success) toast.success("Branding updated successfully!");
    } catch (error) {
      toast.error("Failed to save branding.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBannerUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUploadMaterial = async () => {
    if (!selectedEventId) return toast.error("Select an event first.");
    if (!matTitle || !matType) return toast.error("Title and Type are required.");
    setIsUploadingMat(true);
    
    // Simulating file upload URL creation for demonstration
    const mockFileUrl = "/mock-document.pdf"; 

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/exhibitor/${user?.id}/materials/${selectedEventId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: matTitle, file_type: matType, file_url: mockFileUrl })
      });
      const json = await res.json();
      if (json.success) {
        setMaterials([json.data, ...materials]);
        setMatTitle(""); setMatFile("");
        toast.success("Material uploaded.");
      }
    } catch (error) {
      toast.error("Failed to upload material.");
    } finally {
      setIsUploadingMat(false);
    }
  };

  const handleDeleteMaterial = async (id: number) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/exhibitor/materials/${id}`, { method: "DELETE" });
      if ((await res.json()).success) {
        setMaterials(materials.filter(m => m.id !== id));
        toast.success("Material removed.");
      }
    } catch (error) {
      toast.error("Failed to delete material.");
    }
  };

  if (isLoading) return <DashShell role="exhibitor" nav={exhibitorNav}><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div></DashShell>;

  return (
    <DashShell role="exhibitor" nav={exhibitorNav}>
      <PageHeader 
        title="Branding & Promotion" 
        description="Customize how your booth looks to candidates and visitors." 
        action={
          <Button onClick={handleSaveBranding} disabled={isSaving || !selectedEventId} className="bg-saffron text-navy hover:bg-saffron/90 font-semibold shadow-sm">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} Save Changes
          </Button>
        }
      />

      <div className="mb-6 flex items-center gap-3 bg-white/80 backdrop-blur border border-purple-200/60 p-3 rounded-lg shadow-sm">
        <Label className="text-sm font-bold text-purple-700 whitespace-nowrap ml-2">SELECT EVENT:</Label>
        <Select value={selectedEventId} onValueChange={setSelectedEventId}>
          <SelectTrigger className="w-full sm:max-w-md border-purple-200 focus:ring-purple-500">
            <SelectValue placeholder="Choose an approved event" />
          </SelectTrigger>
          <SelectContent>
            {events.length === 0 ? (
              <SelectItem value="none" disabled>No approved events yet</SelectItem>
            ) : (
              events.map(ev => <SelectItem key={ev.id} value={ev.id.toString()}>{ev.name}</SelectItem>)
            )}
          </SelectContent>
        </Select>
      </div>

      {!selectedEventId ? (
        <Card className="p-16 text-center border-border/60">
          <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-navy">No Event Selected</h3>
          <p className="text-sm text-muted-foreground mt-1">Please select an approved event from the dropdown above to manage its branding.</p>
        </Card>
      ) : (
        <>
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* LEFT COLUMN - CONTROLS */}
            <div className="lg:col-span-2 space-y-6">
              
              <Card className="p-5 border-border/60 shadow-sm bg-white/80 backdrop-blur">
                <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy mb-4">
                  <Palette className="h-4 w-4 text-purple-600" /> Primary Brand Color
                </Label>
                <div className="flex items-center gap-4">
                  <div className="relative size-12 rounded border border-border overflow-hidden cursor-pointer shadow-sm">
                    <input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-navy">Choose a Color</p>
                    <p className="text-xs text-muted-foreground mt-0.5">This accent color will be applied to buttons and headers on your virtual stall page.</p>
                  </div>
                </div>
              </Card>

              <Card className="p-5 border-border/60 shadow-sm bg-white/80 backdrop-blur">
                <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy mb-4">
                  <MessageSquare className="h-4 w-4 text-blue-500" /> Welcome Message
                </Label>
                <Textarea 
                  rows={4} 
                  value={welcomeMsg} 
                  onChange={(e) => setWelcomeMsg(e.target.value)} 
                  placeholder="e.g. Welcome to Acme Corp! We are hiring passionate engineers to join our growing team..." 
                  className="bg-muted/30 focus:bg-white"
                />
              </Card>

              <Card className="p-5 border-border/60 shadow-sm bg-white/80 backdrop-blur">
                <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy mb-4">
                  <ImageIcon className="h-4 w-4 text-emerald-500" /> Stall Banner Image
                </Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-muted/20 relative group hover:bg-muted/40 transition-colors">
                  <input type="file" accept="image/*" onChange={handleBannerUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <ImageIcon className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3 group-hover:text-purple-500 transition-colors" />
                  <p className="font-semibold text-sm text-navy">Click to upload banner image</p>
                  <p className="text-xs text-muted-foreground mt-1">Recommended size: 1920x400px (JPG or PNG)</p>
                </div>
              </Card>

            </div>

            {/* RIGHT COLUMN - LIVE PREVIEW */}
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 block">Live Preview</Label>
              <Card className="overflow-hidden border-border/60 shadow-md bg-white">
                <div className="h-32 bg-muted/50 relative">
                  {bannerUrl ? (
                    <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full"><ImageIcon className="h-8 w-8 text-muted-foreground/20" /></div>
                  )}
                </div>
                
                <div className="px-5 pb-5 relative">
                  <div className="size-14 rounded-lg bg-white border border-border shadow-sm flex items-center justify-center font-bold text-navy text-xs -mt-7 mb-3 relative z-10 overflow-hidden">
                    Logo
                  </div>
                  
                  <h3 className="font-bold text-navy text-lg">{companyName}</h3>
                  
                  <div className="mt-3 bg-muted/40 p-3 rounded text-sm text-muted-foreground italic border border-transparent min-h-[60px]">
                    {welcomeMsg || "Your welcome message will appear here for candidates..."}
                  </div>
                  
                  <div 
                    className="mt-4 py-2.5 rounded text-center text-white font-semibold text-sm transition-colors cursor-pointer"
                    style={{ backgroundColor: brandColor }}
                  >
                    Apply Now
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* NEW FILE UPLOAD SECTION */}
          <Card className="p-5 border-border/60 shadow-sm bg-white/80 backdrop-blur mb-6">
            <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-saffron mb-4">
              <UploadCloud className="h-4 w-4" /> New File Upload
            </Label>
            <div className="grid sm:grid-cols-12 gap-4 items-end">
              <div className="sm:col-span-5">
                <Label className="text-xs mb-1.5 block">Material Title</Label>
                <Input value={matTitle} onChange={(e) => setMatTitle(e.target.value)} placeholder="e.g. 2026 Product Catalog" />
              </div>
              <div className="sm:col-span-3">
                <Label className="text-xs mb-1.5 block">File Type</Label>
                <Select value={matType} onValueChange={setMatType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Brochure / PDF">Brochure / PDF</SelectItem>
                    <SelectItem value="Company Presentation">Company Presentation</SelectItem>
                    <SelectItem value="Job Descriptions">Job Descriptions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-3">
                <Label className="text-xs mb-1.5 block">Select File</Label>
                <Input type="file" value={matFile} onChange={(e) => setMatFile(e.target.value)} className="cursor-pointer" />
              </div>
              <div className="sm:col-span-1">
                <Button onClick={handleUploadMaterial} disabled={isUploadingMat} className="w-full bg-navy text-white hover:bg-navy/90">
                  {isUploadingMat ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload"}
                </Button>
              </div>
            </div>
          </Card>

          <Card className="border-border/60 bg-white/80 backdrop-blur">
            {materials.length === 0 ? (
              <div className="text-center py-12">
                <UploadCloud className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <h3 className="font-semibold text-navy">No materials uploaded yet.</h3>
                <p className="text-sm text-muted-foreground mt-1">Visitors will not see any downloads on your stall profile.</p>
              </div>
            ) : (
              <div className="p-4 grid gap-3">
                {materials.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-white shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded bg-saffron/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-saffron" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-navy">{m.title}</p>
                        <p className="text-xs text-muted-foreground">{m.file_type}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteMaterial(m.id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </DashShell>
  );
}
