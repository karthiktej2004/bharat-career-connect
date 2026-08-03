import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { DashShell, PageHeader } from "@/components/DashShell";
import { employerNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Upload, Loader2, Save, MapPin, Users, Briefcase, FileCheck, UserPlus, Trash2 } from "lucide-react";
import { getSession } from "@/lib/mockStore";
import { toast } from "sonner";

export const Route = createFileRoute("/employer/company")({
  head: () => ({ meta: [{ title: "Company Profile — Bharat Career Connect" }] }),
  component: EmployerCompanyProfile,
});

// --- CONSTANTS ---
const ORG_TYPES = ["Employer Primary Category(E)", "Sector Skill Council (SSC)", "Associations / Industry Clusters", "Skill Training Centre", "Others"];
const LEGAL_STRUCTURES = ["Sole Proprietorship", "Partnership", "Limited Liability Partnership (LLP)", "Private Limited Company", "Public Limited Company", "One-Person Company", "NGO - Section 8 / Trust", "State Public Sector Undertaking", "Central Public Sector Undertaking", "Others"];

// Updated to match the exact 52 sectors from Registration
const SECTORS = [
  "Aerospace and Aviation Sector", "Agriculture Sector", "Apparel Sector", "Automotive Sector",
  "Beauty & Wellness Sector", "BFSI Sector", "Capital Goods Sector", "Construction Sector",
  "Domestic Workers Sector", "Education Sector", "Electronics Sector", "Food Processing Sector",
  "Furniture & Fittings Sector", "Gems & Jewellery Sector", "Government Sector", "Green Jobs Sector",
  "Handicrafts and Carpet Sector", "Healthcare Sector", "HR Consultancy Sector", "Hydrocarbon Sector",
  "Infrastructure Equipment Sector", "Instrumentation Automation Surveillance", "Iron and Steel Sector",
  "IT-ITeS Sector", "Leather Sector", "Life Sciences Sector", "Logistics Sector",
  "Management & Entrepreneurship and", "Manufacturing Sector", "Media & Entertainment Sector",
  "Mining Sector", "Persons with Disability Sector", "Power Sector", "Retail Sector",
  "Rubber, Chemical, & Petrochemical", "Service Sector", "Social Sector", "Sports Sector",
  "Telecom Sector", "Textile Sector", "Tourism & Hospitality Sector", "Water Management & Plumbing Sector",
  "Paints and Coating Sector", "State Public Sector Undertaking", "Central Public Sector Undertaking",
  "Space Sector", "Defence Sector", "Nuclear Sector", "Industrial Safety Sector", "Legal Sector",
  "General Sector", "Spirituality Sector", "Others"
];

const ORG_PRESENCE = ["Local", "Regional", "State-wide", "Pan-India", "International"];
const TITLES = ["Mr.", "Mrs.", "Ms.", "Miss.", "Dr.", "Prof."];
const DESIGNATIONS = ["Founder", "Chairman", "Director", "President", "Vice President", "Secretary", "HR Manager", "Project Manager", "Coordinator", "Others"];
const EMPLOYEE_STRENGTH = ["1-4", "5-29", "30-100", "101-300", "301-500", "501-1000", "1001 and above"];
const DISABILITIES = ["Blindness", "Low-vision", "Hearing Impairment", "Locomotor Disability", "Intellectual Disability", "Specific Learning Disabilities", "Multiple Sclerosis", "All the above"];
const OPP_TYPES = ["Internship Opportunities", "Apprenticeship Opportunities", "Job Opportunities", "All the above Opportunities"];
const JOB_TYPES = ["Full Time", "Part-Time", "Hybrid"];
const ENGAGEMENT_PREFS = ["No Preference - Open for all", "Work From Home", "Work From Office", "Hybrid Work", "Field Work"];
const JOINING_PREFS = ["Immediate Joiner", "Within 15 Days", "Within 30 Days", "Within 60 Days", "More than 60 Days"];

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
  const [activeTab, setActiveTab] = useState("basic");

  // File states
  const [complianceDoc, setComplianceDoc] = useState<File | null>(null);
  const [brochure, setBrochure] = useState<File | null>(null);

  // HR / Sub-Account States
  const [hrList, setHrList] = useState<any[]>([]);
  const [showAddHr, setShowAddHr] = useState(false);
  const [newHr, setNewHr] = useState({ full_name: "", email: "", phone: "", designation: "", password: "" });

  const [profile, setProfile] = useState({
    // Tab 1: Basic
    company_name: "", org_type: "", legal_structure: "", core_sectors: [] as string[], website: "", about_company: "",
    // Tab 2: Location
    country: "India", pincode: "", state: "", district: "", taluk: "", mla_constituency: "", mp_constituency: "", resident_type: "", local_body_details: "", locality_area: "", current_address: "", map_link: "", org_presence: "", multiple_branches: "false",
    // Tab 3: Contacts
    poc1_title: "", poc1_name: "", poc1_designation: "", poc1_email: "", poc1_phone: "",
    poc2_title: "", poc2_name: "", poc2_designation: "", poc2_email: "", poc2_phone: "",
    // Tab 4: Operations
    employee_strength: "", hiring_for: "", hire_pwds: "", accepted_disabilities: [] as string[], sector_preference: "", preferred_opportunity_types: [] as string[], preferred_job_type: "", engagement_preference: "", joining_preference: "", preferred_job_location: "",
    // Tab 5: Media & Compliance
    social_facebook: "", social_instagram: "", social_linkedin: "", social_youtube: "", social_x: "", social_whatsapp: "", social_github: ""
  });

  const parseArray = (val: any) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val); } catch (e) { return []; }
  };

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/employer/profile/${userId}`);
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        setProfile({
          company_name: d.company_name || "", org_type: d.org_type || "", legal_structure: d.legal_structure || "",
          core_sectors: parseArray(d.core_sectors), website: d.website || "", about_company: d.about_us || "",
          
          country: d.country || "India", pincode: d.pincode || "", state: d.state || "", district: d.district || "",
          taluk: d.taluk || "", mla_constituency: d.mla_constituency || "", mp_constituency: d.mp_constituency || "",
          resident_type: d.resident_type || "", local_body_details: d.local_body_details || "", locality_area: d.locality_area || "",
          current_address: d.current_address || "", map_link: d.map_link || "", org_presence: d.org_presence || "",
          multiple_branches: d.multiple_branches ? "true" : "false",

          poc1_title: d.poc1_title || "", poc1_name: d.poc1_name || "", poc1_designation: d.poc1_designation || "", poc1_email: d.poc1_email || d.email || "", poc1_phone: d.poc1_phone || "",
          poc2_title: d.poc2_title || "", poc2_name: d.poc2_name || "", poc2_designation: d.poc2_designation || "", poc2_email: d.poc2_email || "", poc2_phone: d.poc2_phone || "",

          employee_strength: d.employee_strength || "", hiring_for: d.hiring_for || "", hire_pwds: d.hire_pwds || "",
          accepted_disabilities: parseArray(d.accepted_disabilities), sector_preference: d.sector_preference || "",
          preferred_opportunity_types: parseArray(d.preferred_opportunity_types), preferred_job_type: d.preferred_job_type || "",
          engagement_preference: d.engagement_preference || "", joining_preference: d.joining_preference || "",
          preferred_job_location: d.preferred_job_location || "",

          social_facebook: d.social_facebook || "", social_instagram: d.social_instagram || "", social_linkedin: d.social_linkedin || "",
          social_youtube: d.social_youtube || "", social_x: d.social_x || "", social_whatsapp: d.social_whatsapp || "", social_github: d.social_github || ""
        });
      }
    } catch (err) {
      toast.error("Failed to load company profile.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const fetchHrs = useCallback(async () => {
    if (!userId) return;
    try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/employer/${userId}/hrs`);
        const json = await res.json();
        if (json.success) setHrList(json.data || []);
    } catch (err) {
        console.error("Failed to fetch HR accounts");
    }
  }, [userId]);

  useEffect(() => { 
    fetchProfile(); 
    fetchHrs(); 
  }, [fetchProfile, fetchHrs]);

  const handleInputChange = (field: string, value: any) => setProfile(prev => ({ ...prev, [field]: value }));

  const toggleArrayItem = (field: "core_sectors" | "accepted_disabilities" | "preferred_opportunity_types", item: string) => {
    setProfile(prev => {
      const array = prev[field];
      if (array.includes(item)) return { ...prev, [field]: array.filter(i => i !== item) };
      return { ...prev, [field]: [...array, item] };
    });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData();
      Object.entries(profile).forEach(([key, value]) => {
        if (Array.isArray(value)) formData.append(key, JSON.stringify(value));
        else formData.append(key, String(value));
      });

      // Pass ID so backend knows who to update
      formData.append("id", String(userId));

      if (complianceDoc) formData.append("compliance_doc", complianceDoc);
      if (brochure) formData.append("brochure", brochure);

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/employer/profile/update`, {
        method: "PUT",
        body: formData,
      });

      const json = await res.json();
      if (json.success) toast.success("Company profile updated successfully!");
      else toast.error(json.message || "Error saving profile.");
    } catch (e) {
      toast.error("Database connection failed. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddHr = async () => {
    if (!newHr.full_name || !newHr.email || !newHr.password) {
        return toast.error("Name, Email, and Password are required for a sub-account.");
    }
    try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/employer/${userId}/hrs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newHr)
        });
        const json = await res.json();
        if (json.success) {
            toast.success(json.message);
            setShowAddHr(false);
            setNewHr({ full_name: "", email: "", phone: "", designation: "", password: "" });
            fetchHrs();
        } else {
            toast.error(json.message);
        }
    } catch (err) {
        toast.error("Network error adding HR.");
    }
  };

  const handleDeleteHr = async (hrId: string) => {
    if(!confirm("Are you sure you want to remove this login access?")) return;
    try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/employer/hrs/${hrId}`, {
            method: 'DELETE'
        });
        const json = await res.json();
        if (json.success) {
            toast.success(json.message);
            fetchHrs();
        } else {
            toast.error(json.message);
        }
    } catch (err) {
        toast.error("Network error removing HR.");
    }
  };

  const TABS = [
    { id: "basic", label: "Basic Info", icon: Building2 },
    { id: "location", label: "Location", icon: MapPin },
    { id: "contacts", label: "PoC & Sub-Accounts", icon: Users },
    { id: "hiring", label: "Operations", icon: Briefcase },
    { id: "media", label: "Docs & Media", icon: FileCheck }
  ];

  return (
    <>
      <PageHeader title="Company Profile" description="Manage your organization's comprehensive profile and hiring preferences." />

      {isLoading ? (
        <div className="flex justify-center p-16"><Loader2 className="h-8 w-8 animate-spin text-saffron" /></div>
      ) : (
        <div className="mt-6">
          {/* TAB NAVIGATION */}
          <div className="flex overflow-x-auto border-b border-border/60 mb-6 pb-2 gap-4">
            {TABS.map(t => (
              <button 
                key={t.id} 
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${activeTab === t.id ? "bg-navy text-white shadow-sm" : "bg-white text-slate-500 hover:bg-slate-100"}`}
              >
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <Card className="p-6 border-border/60 bg-white shadow-sm">
              
              {/* TAB 1: BASIC INFO */}
              {activeTab === "basic" && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <h3 className="font-display font-bold text-lg text-navy border-b pb-2">Organization Information</h3>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                      <Label>Organization Name</Label>
                      <Input value={profile.company_name} onChange={(e) => handleInputChange('company_name', e.target.value)} className="mt-1" />
                    </div>
                    <div>
                      <Label>Organization Type</Label>
                      <Select value={profile.org_type} onValueChange={(v) => handleInputChange('org_type', v)}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>{ORG_TYPES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Legal Structure</Label>
                      <Select value={profile.legal_structure} onValueChange={(v) => handleInputChange('legal_structure', v)}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select structure" /></SelectTrigger>
                        <SelectContent>{LEGAL_STRUCTURES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Core Sectors of Operation</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {SECTORS.map(s => (
                          <Badge key={s} variant={profile.core_sectors.includes(s) ? "default" : "outline"}
                            className={`cursor-pointer px-3 py-1.5 ${profile.core_sectors.includes(s) ? "bg-saffron text-navy hover:bg-saffron/90" : "hover:bg-slate-100"}`}
                            onClick={() => toggleArrayItem("core_sectors", s)}>{s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Organization Website</Label>
                      <Input type="url" value={profile.website} onChange={(e) => handleInputChange('website', e.target.value)} className="mt-1" placeholder="https://" />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Organization Bio / About Us</Label>
                      <Textarea rows={4} value={profile.about_company} onChange={(e) => handleInputChange('about_company', e.target.value)} className="mt-1" placeholder="Brief description of the organization (200-1000 words)..." />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: LOCATION */}
              {activeTab === "location" && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <h3 className="font-display font-bold text-lg text-navy border-b pb-2">Location & Address Details</h3>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <Label>Country</Label>
                      <Input value={profile.country} onChange={(e) => handleInputChange('country', e.target.value)} className="mt-1 bg-slate-50" readOnly />
                    </div>
                    <div>
                      <Label>Pincode</Label>
                      <Input maxLength={6} value={profile.pincode} onChange={(e) => handleInputChange('pincode', e.target.value.replace(/\D/g, ''))} className="mt-1" />
                    </div>
                    <div>
                      <Label>State / Union Territory</Label>
                      <Input value={profile.state} onChange={(e) => handleInputChange('state', e.target.value)} className="mt-1" />
                    </div>
                    <div>
                      <Label>District</Label>
                      <Input value={profile.district} onChange={(e) => handleInputChange('district', e.target.value)} className="mt-1" />
                    </div>
                    <div>
                      <Label>Taluk</Label>
                      <Input value={profile.taluk} onChange={(e) => handleInputChange('taluk', e.target.value)} className="mt-1" />
                    </div>
                    <div>
                      <Label>Resident Type</Label>
                      <Select value={profile.resident_type} onValueChange={(v) => handleInputChange('resident_type', v)}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent><SelectItem value="Urban">Urban</SelectItem><SelectItem value="Rural">Rural</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Current Full Address</Label>
                      <Textarea rows={3} value={profile.current_address} onChange={(e) => handleInputChange('current_address', e.target.value)} className="mt-1" />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Google Map Link</Label>
                      <Input value={profile.map_link} onChange={(e) => handleInputChange('map_link', e.target.value)} className="mt-1" placeholder="https://maps.google.com/..." />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CONTACTS & PoC SUB-ACCOUNTS */}
              {activeTab === "contacts" && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="space-y-4">
                    <h3 className="font-display font-bold text-lg text-navy border-b pb-2">Point of Contact 1 (Primary)</h3>
                    <div className="grid sm:grid-cols-12 gap-4">
                      <div className="sm:col-span-3">
                        <Label>Title</Label>
                        <Select value={profile.poc1_title} onValueChange={(v) => handleInputChange('poc1_title', v)}>
                          <SelectTrigger className="mt-1"><SelectValue placeholder="Title" /></SelectTrigger>
                          <SelectContent>{TITLES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="sm:col-span-5">
                        <Label>Full Name</Label>
                        <Input value={profile.poc1_name} onChange={(e) => handleInputChange('poc1_name', e.target.value)} className="mt-1" />
                      </div>
                      <div className="sm:col-span-4">
                        <Label>Designation</Label>
                        <Select value={profile.poc1_designation} onValueChange={(v) => handleInputChange('poc1_designation', v)}>
                          <SelectTrigger className="mt-1"><SelectValue placeholder="Designation" /></SelectTrigger>
                          <SelectContent>{DESIGNATIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="sm:col-span-6">
                        <Label>WhatsApp Number</Label>
                        <Input value={profile.poc1_phone} onChange={(e) => handleInputChange('poc1_phone', e.target.value.replace(/\D/g, ''))} className="mt-1" />
                      </div>
                      <div className="sm:col-span-6">
                        <Label>Official Email ID</Label>
                        <Input type="email" value={profile.poc1_email} onChange={(e) => handleInputChange('poc1_email', e.target.value)} className="mt-1" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border/40">
                    <h3 className="font-display font-bold text-lg text-navy border-b pb-2">Point of Contact 2 (Secondary)</h3>
                    <div className="grid sm:grid-cols-12 gap-4">
                      <div className="sm:col-span-3">
                        <Label>Title</Label>
                        <Select value={profile.poc2_title} onValueChange={(v) => handleInputChange('poc2_title', v)}>
                          <SelectTrigger className="mt-1"><SelectValue placeholder="Title" /></SelectTrigger>
                          <SelectContent>{TITLES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="sm:col-span-5">
                        <Label>Full Name</Label>
                        <Input value={profile.poc2_name} onChange={(e) => handleInputChange('poc2_name', e.target.value)} className="mt-1" />
                      </div>
                      <div className="sm:col-span-4">
                        <Label>Designation</Label>
                        <Select value={profile.poc2_designation} onValueChange={(v) => handleInputChange('poc2_designation', v)}>
                          <SelectTrigger className="mt-1"><SelectValue placeholder="Designation" /></SelectTrigger>
                          <SelectContent>{DESIGNATIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* --- NEW HR SUB-ACCOUNT SECTION --- */}
                  <div className="pt-8 mt-8 border-t border-border/40 space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                       <div>
                         <h3 className="text-lg font-display font-bold text-navy">HR / Sub-Accounts</h3>
                         <p className="text-xs text-slate-500 mt-1">Add up to 3 team members who can log in to manage your pipeline.</p>
                       </div>
                       {hrList.length < 3 && !showAddHr && (
                          <Button type="button" onClick={() => setShowAddHr(true)} className="bg-navy text-white h-8 text-xs px-4">
                            <UserPlus className="h-3 w-3 mr-2"/> Add User
                          </Button>
                       )}
                    </div>

                    {hrList.length > 0 && (
                       <div className="grid sm:grid-cols-2 gap-4 mt-4">
                          {hrList.map(hr => (
                             <Card key={hr.id} className="p-4 border-slate-200 shadow-sm flex justify-between items-center bg-slate-50">
                                <div>
                                  <p className="font-bold text-navy text-sm">{hr.full_name}</p>
                                  <p className="text-xs text-slate-500 font-medium mt-0.5">{hr.designation} • {hr.email}</p>
                                </div>
                                <Button type="button" variant="ghost" onClick={() => handleDeleteHr(hr.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 shrink-0">
                                  <Trash2 className="h-4 w-4"/>
                                </Button>
                             </Card>
                          ))}
                       </div>
                    )}

                    {showAddHr && (
                       <Card className="p-5 border-saffron/40 bg-saffron/5 shadow-sm space-y-4 mt-4 relative">
                          <h4 className="font-bold text-navy text-sm mb-2">Create New Sub-Account</h4>
                          <div className="grid sm:grid-cols-2 gap-4">
                             <div><Label>Full Name *</Label><Input value={newHr.full_name} onChange={e => setNewHr({...newHr, full_name: e.target.value})} className="mt-1 bg-white border-slate-300"/></div>
                             <div><Label>Designation *</Label><Input value={newHr.designation} onChange={e => setNewHr({...newHr, designation: e.target.value})} className="mt-1 bg-white border-slate-300"/></div>
                             <div><Label>Login Email *</Label><Input type="email" value={newHr.email} onChange={e => setNewHr({...newHr, email: e.target.value})} className="mt-1 bg-white border-slate-300"/></div>
                             <div><Label>Phone *</Label><Input value={newHr.phone} onChange={e => setNewHr({...newHr, phone: e.target.value.replace(/\D/g, '')})} className="mt-1 bg-white border-slate-300"/></div>
                             <div className="sm:col-span-2">
                               <Label>Set Password *</Label>
                               <Input type="text" value={newHr.password} onChange={e => setNewHr({...newHr, password: e.target.value})} className="mt-1 bg-white border-slate-300 font-mono text-sm" placeholder="e.g. Secret@123"/>
                               <p className="text-[10px] text-slate-500 mt-1">Provide this password to your team member. They can log in immediately.</p>
                             </div>
                          </div>
                          <div className="flex justify-end gap-3 pt-3">
                             <Button type="button" variant="outline" onClick={() => setShowAddHr(false)} className="h-9 text-xs">Cancel</Button>
                             <Button type="button" onClick={handleAddHr} className="bg-india-green hover:bg-india-green/90 text-white h-9 text-xs">Save Account</Button>
                          </div>
                       </Card>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: HIRING & OPERATIONS */}
              {activeTab === "hiring" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h3 className="font-display font-bold text-lg text-navy border-b pb-2">Inclusion & Hiring Preferences</h3>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <Label>Employee Strength</Label>
                      <Select value={profile.employee_strength} onValueChange={(v) => handleInputChange('employee_strength', v)}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select range" /></SelectTrigger>
                        <SelectContent>{EMPLOYEE_STRENGTH.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Do you hire Persons with Disabilities (PwD)?</Label>
                      <Select value={profile.hire_pwds} onValueChange={(v) => handleInputChange('hire_pwds', v)}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem><SelectItem value="Planning to">Planning to</SelectItem></SelectContent>
                      </Select>
                    </div>

                    {(profile.hire_pwds === "Yes" || profile.hire_pwds === "Planning to") && (
                      <div className="sm:col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <Label>Disability Types Accepted</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {DISABILITIES.map(d => (
                            <Badge key={d} variant={profile.accepted_disabilities.includes(d) ? "default" : "outline"}
                              className={`cursor-pointer px-3 py-1.5 ${profile.accepted_disabilities.includes(d) ? "bg-navy text-white" : "bg-white hover:bg-slate-100"}`}
                              onClick={() => toggleArrayItem("accepted_disabilities", d)}>{d}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="sm:col-span-2 pt-2 border-t border-border/40">
                      <Label>Preferred Opportunity Types</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {OPP_TYPES.map(o => (
                          <Badge key={o} variant={profile.preferred_opportunity_types.includes(o) ? "default" : "outline"}
                            className={`cursor-pointer px-3 py-1.5 ${profile.preferred_opportunity_types.includes(o) ? "bg-saffron text-navy hover:bg-saffron/90" : "hover:bg-slate-100"}`}
                            onClick={() => toggleArrayItem("preferred_opportunity_types", o)}>{o}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Preferred Job Type</Label>
                      <Select value={profile.preferred_job_type} onValueChange={(v) => handleInputChange('preferred_job_type', v)}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{JOB_TYPES.map(j => <SelectItem key={j} value={j}>{j}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Engagement Preference</Label>
                      <Select value={profile.engagement_preference} onValueChange={(v) => handleInputChange('engagement_preference', v)}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{ENGAGEMENT_PREFS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Joining Preference (Notice Period)</Label>
                      <Select value={profile.joining_preference} onValueChange={(v) => handleInputChange('joining_preference', v)}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{JOINING_PREFS.map(j => <SelectItem key={j} value={j}>{j}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: COMPLIANCE & MEDIA */}
              {activeTab === "media" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h3 className="font-display font-bold text-lg text-navy border-b pb-2">Documents & Social Media</h3>
                  
                  <div className="grid sm:grid-cols-2 gap-5 mb-6">
                    <div className="p-5 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 text-center">
                      <div className="mx-auto w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-2"><Upload className="h-4 w-4 text-navy" /></div>
                      <Label htmlFor="compliance-upload" className="cursor-pointer text-navy font-semibold hover:underline">Upload Compliance Doc (GST/PAN)</Label>
                      <p className="text-[11px] text-muted-foreground mt-1 mb-2">PDF, JPG, PNG (Max 5MB)</p>
                      <Input id="compliance-upload" type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && file.size > 5 * 1024 * 1024) return toast.error("File exceeds 5MB limit");
                          if (file) setComplianceDoc(file);
                        }}
                      />
                      {complianceDoc && <Badge variant="secondary">{complianceDoc.name}</Badge>}
                    </div>
                    
                    <div className="p-5 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 text-center">
                      <div className="mx-auto w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-2"><Upload className="h-4 w-4 text-navy" /></div>
                      <Label htmlFor="brochure-upload" className="cursor-pointer text-navy font-semibold hover:underline">Upload Company Brochure</Label>
                      <p className="text-[11px] text-muted-foreground mt-1 mb-2">PDF, JPG, PNG (Max 5MB)</p>
                      <Input id="brochure-upload" type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && file.size > 5 * 1024 * 1024) return toast.error("File exceeds 5MB limit");
                          if (file) setBrochure(file);
                        }}
                      />
                      {brochure && <Badge variant="secondary">{brochure.name}</Badge>}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><Label>LinkedIn Page Link</Label><Input value={profile.social_linkedin} onChange={(e) => handleInputChange('social_linkedin', e.target.value)} className="mt-1" /></div>
                    <div><Label>Facebook Page Link</Label><Input value={profile.social_facebook} onChange={(e) => handleInputChange('social_facebook', e.target.value)} className="mt-1" /></div>
                    <div><Label>Instagram Link</Label><Input value={profile.social_instagram} onChange={(e) => handleInputChange('social_instagram', e.target.value)} className="mt-1" /></div>
                    <div><Label>X (Twitter) Link</Label><Input value={profile.social_x} onChange={(e) => handleInputChange('social_x', e.target.value)} className="mt-1" /></div>
                    <div><Label>YouTube Channel</Label><Input value={profile.social_youtube} onChange={(e) => handleInputChange('social_youtube', e.target.value)} className="mt-1" /></div>
                    <div><Label>WhatsApp Channel</Label><Input value={profile.social_whatsapp} onChange={(e) => handleInputChange('social_whatsapp', e.target.value)} className="mt-1" /></div>
                  </div>
                </div>
              )}

              {/* SAVE BUTTON */}
              <div className="flex justify-end pt-6 mt-6 border-t border-border/40">
                <Button type="submit" disabled={isSaving} className="bg-saffron text-navy font-semibold hover:bg-saffron/90 px-8 py-5 h-auto text-base">
                  {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />} Save All Changes
                </Button>
              </div>
            </Card>
          </form>
        </div>
      )}
    </>
  );
}
