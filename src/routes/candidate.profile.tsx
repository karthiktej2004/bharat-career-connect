import { createFileRoute } from "@tanstack/react-router";
import { DashShell, PageHeader } from "@/components/DashShell";
import { candidateNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, Check, Pencil, Save, X, User as UserIcon, GraduationCap, Sparkles, Target, FileText, Image as ImageIcon, MapPin } from "lucide-react";
import { getSession } from "@/lib/mockStore";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/candidate/profile")({
  head: () => ({ meta: [{ title: "My Profile — Candidate" }] }),
  component: Profile,
});

const INDIAN_STATES = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep", "Delhi", "Puducherry", "Ladakh", "Jammu and Kashmir"];
const RELIGIONS = ["Hinduism", "Islam", "Christianity", "Sikhism", "Buddhism", "Jainism", "Zoroastrianism (Parsis)", "Judaism", "Others", "Not interested to disclose"];
const SOCIAL_CATEGORIES = ["General / Unreserved (GEN/UR)", "Scheduled Caste (SC)", "Scheduled Tribe (ST)", "Other Backward Classes – Non-Creamy Layer (OBC-NCL)", "Other Backward Classes – Creamy Layer (OBC-CL)", "Economically Weaker Section (EWS)", "Not interested to disclose"];
const DISABILITY_LIST = ["Blindness", "Low-vision", "Leprosy Cured persons", "Hearing Impairment", "Locomotor Disability", "Dwarfism", "Intellectual Disability", "Mental Illness", "Autism Spectrum Disorder", "Cerebral Palsy", "Muscular Dystrophy", "Chronic Neurological conditions", "Specific Learning Disabilities", "Multiple Sclerosis", "Speech and Language disability", "Thalassemia", "Hemophilia", "Sickle cell disease", "Multiple Disabilities including deaf-blindness", "Acid Attack victims", "Parkinson’s disease", "All the above", "Others"];
const QUALIFICATIONS = ["Below 10th / SSLC", "10th / SSLC", "ITI", "12th STD / 2nd PUC / Intermediate", "Diploma", "UG Degree", "PG Degree", "B.E / B.Tech", "M.E / M.Tech", "PhD", "Short Term Training (STT)", "Others"];
const OPPORTUNITIES_LIST = ["Skill Training Opportunities", "Internship Opportunities", "Apprenticeship Opportunities", "Job Opportunities", "No Preference - Open for all"];
const ASPIRANT_TYPES = ["Skill Aspirant", "Internship Aspirant", "Apprenticeship Aspirant", "Job Aspirant", "No Preference - Open for all"];
const SECTORS = ["IT/ITeS", "Banking & Finance", "Retail", "Healthcare", "Hospitality", "Manufacturing", "Construction", "Agriculture", "Logistics", "Telecom", "Others", "No Preference - Open for all"];
const PROFICIENCY_LEVELS = ["Beginner", "Intermediate", "Expert"];

const formatName = (val: string) => {
  return val.replace(/[^a-zA-Z\s]/g, "").split(" ").map(w => w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : "").join(" ");
};

function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<any>({});

  const [techInput, setTechInput] = useState("");
  const [nonTechInput, setNonTechInput] = useState("");
  const [roleInput, setRoleInput] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const session = getSession();
      if (!session || !session.id) return setIsLoading(false);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://15.207.249.155:5000"}/api/candidate/profile/${session.id}`);
        const json = await res.json();
        if (json.success) setProfile(json.data);
      } catch (err) {
        toast.error("Failed to fetch profile.");
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  const saveToDatabase = async (mergedData: any) => {
    setIsSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://15.207.249.155:5000"}/api/candidate/profile/update`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(mergedData)
      });
      const json = await res.json();
      if (json.success) toast.success("Profile securely updated!");
      else toast.error("Update failed.");
    } catch (err) {
      toast.error("Network error.");
    } finally {
      setIsSaving(false);
    }
  };

  const completion = useMemo(() => {
    if (!profile) return 0;
    const p = profile;
    
    const hasAddress = p.currentAddress && Object.keys(p.currentAddress).length > 0 && !!p.currentAddress.pincode;
    const hasSkills = (p.technicalSkills?.length || 0) > 0 || (p.nonTechnicalSkills?.length || 0) > 0 || (p.skills?.length || 0) > 0;
    
    let hasLanguages = false;
    if (p.languagesFluent) {
      if (Array.isArray(p.languagesFluent)) {
        hasLanguages = p.languagesFluent.length > 0;
      } else {
        hasLanguages = true;
      }
    }

    const fields = [
      p.fullName, p.email, p.phone, p.dob, p.gender, p.category, 
      hasAddress, p.qualification, p.institution, p.yearOfPassing, 
      hasSkills, hasLanguages, p.experienceType, p.resumeFileName, 
      (p.preferredLocations?.length || 0) > 0
    ];

    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  }, [profile]);

  if (isLoading) return <DashShell role="candidate" nav={candidateNav}><div className="p-8 text-center">Loading...</div></DashShell>;
  if (!profile) return <DashShell role="candidate" nav={candidateNav}><div className="p-8 text-center text-red-500">Profile Not Found</div></DashShell>;

  const startEdit = (section: string) => { setDraft(JSON.parse(JSON.stringify(profile))); setEditing(section); };
  const cancelEdit = () => { setEditing(null); setDraft({}); };
  const saveEdit = () => {
    const merged = { ...profile, ...draft };
    setProfile(merged); setEditing(null); setDraft({}); saveToDatabase(merged);
  };

  const setD = (key: string, val: any) => setDraft((d: any) => ({ ...d, [key]: val }));
  const setAddr = (type: "currentAddress" | "permanentAddress", key: string, val: any) => {
    setDraft((d: any) => ({ ...d, [type]: { ...(d[type] || {}), [key]: val } }));
  };

  const addArr = (arrName: string, val: string, inputSetter: any) => {
    const v = val.trim(); if (!v) return;
    const existing = draft[arrName] || [];
    if (!existing.includes(v)) setD(arrName, [...existing, v]);
    inputSetter("");
  };
  const remArr = (arrName: string, val: string) => {
    setD(arrName, (draft[arrName] || []).filter((x: string) => x !== val));
  };
  const setProficiency = (skill: string, level: string) => {
    setD("skillProficiencies", { ...(draft.skillProficiencies || {}), [skill]: level });
  };

  const renderAddressForm = (type: "currentAddress" | "permanentAddress") => {
    const addr = draft[type] || {};
    return (
      <div className="grid md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border mt-3">
        <FieldInput label="Country" value={addr.country || "India"} onChange={(v: string) => setAddr(type, "country", v)} />
        <FieldInput label="Pincode" value={addr.pincode} onChange={(v: string) => setAddr(type, "pincode", v.replace(/\D/g, "").slice(0,6))} />
        <FieldSelect label="State / UT" value={addr.state} onChange={(v: string) => setAddr(type, "state", v)} options={INDIAN_STATES} />
        <FieldInput label="District" value={addr.district} onChange={(v: string) => setAddr(type, "district", v)} />
        <FieldInput label="Taluk" value={addr.taluk} onChange={(v: string) => setAddr(type, "taluk", v)} />
        <FieldInput label="MLA Constituency" value={addr.mla} onChange={(v: string) => setAddr(type, "mla", v)} />
        <FieldInput label="MP Constituency" value={addr.mp} onChange={(v: string) => setAddr(type, "mp", v)} />
        
        <FieldSelect label="Resident Type" value={addr.residentType} onChange={(v: string) => setAddr(type, "residentType", v)} options={["Urban Resident", "Rural Resident"]} />
        
        {addr.residentType === "Urban Resident" && (
          <>
            <FieldInput label="ULB List" value={addr.ulb} onChange={(v: string) => setAddr(type, "ulb", v)} />
            <FieldInput label="Wards List" value={addr.ward} onChange={(v: string) => setAddr(type, "ward", v)} />
          </>
        )}
        {addr.residentType === "Rural Resident" && (
          <>
            <FieldInput label="Grampanchayats List" value={addr.grampanchayat} onChange={(v: string) => setAddr(type, "grampanchayat", v)} />
            <FieldInput label="Villages List" value={addr.village} onChange={(v: string) => setAddr(type, "village", v)} />
          </>
        )}
        
        <div className="md:col-span-3">
          <FieldInput label="Locality / Area Name" value={addr.locality} onChange={(v: string) => setAddr(type, "locality", v)} />
        </div>
      </div>
    );
  };

  return (
    <DashShell role="candidate" nav={candidateNav}>
      <PageHeader title="Candidate Profile" description={`ID: ${profile.uniqueId}`} />

      {/* COMPLETION PERCENTAGE BAR */}
      <Card className="p-6 border-border/60 mb-6 bg-white shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-display font-bold text-navy text-lg">{profile.fullName}</div>
            <div className="text-xs text-muted-foreground">{profile.email} · {profile.phone}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Profile completion</div>
            <div className="text-2xl font-bold text-india-green">{completion}%</div>
          </div>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-saffron to-india-green transition-all duration-1000" 
            style={{ width: `${completion}%` }} 
          />
        </div>
      </Card>

      {/* PERSONAL DETAILS */}
      <Section title="Personal Details" icon={UserIcon} editing={editing === "personal"} onEdit={() => startEdit("personal")} onSave={saveEdit} onCancel={cancelEdit} isSaving={isSaving}>
        {editing === "personal" ? (
          <div className="grid md:grid-cols-2 gap-4">
            <FieldInput label="Name (First / Middle / Last)" value={draft.fullName} onChange={(v: string) => setD("fullName", formatName(v))} />
            <FieldInput label="Father Name" value={draft.fatherName} onChange={(v: string) => setD("fatherName", formatName(v))} />
            <FieldInput label="Mother Name" value={draft.motherName} onChange={(v: string) => setD("motherName", formatName(v))} />
            <FieldInput label="Mobile Number" value={draft.phone} onChange={(v: string) => setD("phone", v.replace(/\D/g, "").slice(0,10))} />
            <FieldInput label="Email ID" value={draft.email} onChange={(v: string) => setD("email", v)} type="email" />
            <FieldInput label="Aadhaar Number" value={draft.aadhaar} onChange={(v: string) => setD("aadhaar", v.replace(/\D/g, "").slice(0,12))} />
            <FieldInput label="Date of Birth" value={draft.dob} onChange={(v: string) => setD("dob", v)} type="date" />
            <FieldSelect label="Gender" value={draft.gender} onChange={(v: string) => setD("gender", v)} options={["Male", "Female", "Others"]} />
            
            <FieldSelect label="Religion" value={draft.religion} onChange={(v: string) => setD("religion", v)} options={RELIGIONS} />
            <FieldSelect label="Social Category" value={draft.category} onChange={(v: string) => setD("category", v)} options={SOCIAL_CATEGORIES} />
            
            <FieldInput label="LinkedIn URL" value={draft.linkedinUrl} onChange={(v: string) => setD("linkedinUrl", v)} />
            <FieldInput label="GitHub/Portfolio URL" value={draft.githubUrl} onChange={(v: string) => setD("githubUrl", v)} />

            <div className="md:col-span-2 p-4 border rounded-xl bg-slate-50 mt-2">
              <FieldSelect label="Disability?" value={draft.hasDisability} onChange={(v: string) => { setD("hasDisability", v); if(v==="No") { setD("disabilities", []); setD("udid", ""); } }} options={["Yes", "No"]} />
              {draft.hasDisability === "Yes" && (
                <div className="mt-3 space-y-3">
                  <FieldInput label="Mention Unique Disability ID (UDID)" value={draft.udid} onChange={(v: string) => setD("udid", v.slice(0,18))} placeholder="18 Digits Alpha-Numeric" />
                  <Label>Disability Types</Label>
                  <div className="flex flex-wrap gap-2">
                    {DISABILITY_LIST.map((d) => (
                      <Badge key={d} onClick={() => {
                        const arr = draft.disabilities || [];
                        setD("disabilities", arr.includes(d) ? arr.filter((x:string)=>x!==d) : [...arr, d]);
                      }} className={`cursor-pointer ${draft.disabilities?.includes(d) ? "bg-navy text-white" : "bg-white text-navy border"}`}>{d}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <ReviewGrid>
            <Row label="Full Name" value={profile.fullName} />
            <Row label="Father Name" value={profile.fatherName} />
            <Row label="Mother Name" value={profile.motherName} />
            <Row label="Mobile" value={profile.phone} />
            <Row label="Email" value={profile.email} />
            <Row label="Aadhaar" value={profile.aadhaar ? "XXXX XXXX " + profile.aadhaar.slice(-4) : ""} />
            <Row label="DOB" value={profile.dob} />
            <Row label="Gender" value={profile.gender} />
            <Row label="Religion" value={profile.religion} />
            <Row label="Social Category" value={profile.category} />
            <Row label="LinkedIn" value={profile.linkedinUrl} />
            <Row label="Portfolio" value={profile.githubUrl} />
            <Row label="Disability" value={profile.hasDisability === "Yes" ? `Yes (UDID: ${profile.udid || 'N/A'}) - ${profile.disabilities?.join(", ")}` : "No"} full />
          </ReviewGrid>
        )}
      </Section>

      {/* ADDRESS DETAILS */}
      <Section title="Address Details" icon={MapPin} editing={editing === "address"} onEdit={() => startEdit("address")} onSave={saveEdit} onCancel={cancelEdit} isSaving={isSaving}>
        {editing === "address" ? (
          <div className="space-y-4">
            <Label className="text-lg font-bold text-navy">Current Address</Label>
            {renderAddressForm("currentAddress")}
            
            <div className="pt-6 border-t">
              <Label className="text-lg font-bold text-navy mb-2 block">Permanent Address</Label>
              <label className="flex items-center gap-2 mb-3 cursor-pointer text-sm font-medium text-navy">
                <Checkbox checked={draft.sameAsCurrent} onCheckedChange={(v) => {
                  setD("sameAsCurrent", !!v);
                  if (v) setD("permanentAddress", JSON.parse(JSON.stringify(draft.currentAddress || {})));
                  else setD("permanentAddress", {});
                }} /> Same as Current Address
              </label>
              {!draft.sameAsCurrent && renderAddressForm("permanentAddress")}
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border">
              <h4 className="font-bold text-navy mb-2">Current Address</h4>
              <p className="text-sm text-muted-foreground">{profile.currentAddress?.country ? `${profile.currentAddress?.locality || ''}, ${profile.currentAddress?.district || ''}, ${profile.currentAddress?.state || ''} - ${profile.currentAddress?.pincode || ''}` : "Not provided"}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border">
              <h4 className="font-bold text-navy mb-2">Permanent Address</h4>
              <p className="text-sm text-muted-foreground">{profile.permanentAddress?.country ? `${profile.permanentAddress?.locality || ''}, ${profile.permanentAddress?.district || ''}, ${profile.permanentAddress?.state || ''} - ${profile.permanentAddress?.pincode || ''}` : "Not provided"}</p>
            </div>
          </div>
        )}
      </Section>

      {/* EDUCATION */}
      <Section title="Education" icon={GraduationCap} editing={editing === "edu"} onEdit={() => startEdit("edu")} onSave={saveEdit} onCancel={cancelEdit} isSaving={isSaving}>
        {editing === "edu" ? (
          <div className="grid md:grid-cols-2 gap-4">
            <FieldSelect label="Educational Qualification" value={draft.qualification} onChange={(v: string) => setD("qualification", v)} options={QUALIFICATIONS} />
            <FieldInput label="Educational Institution" value={draft.institution} onChange={(v: string) => setD("institution", v)} />
            <FieldInput label="Board / University" value={draft.boardUniversity} onChange={(v: string) => setD("boardUniversity", v)} />
            <FieldInput label="Year of Passing / Completion" type="number" value={draft.yearOfPassing} onChange={(v: string) => setD("yearOfPassing", v)} placeholder="YYYY" />
            <FieldInput label="Percentage / CGPA" value={draft.percentage} onChange={(v: string) => setD("percentage", v)} />
          </div>
        ) : (
          <ReviewGrid>
            <Row label="Qualification" value={profile.qualification} />
            <Row label="Institution" value={profile.institution} />
            <Row label="Board / University" value={profile.boardUniversity} />
            <Row label="Year of Passing" value={profile.yearOfPassing} />
            <Row label="Percentage / CGPA" value={profile.percentage} />
          </ReviewGrid>
        )}
      </Section>

      {/* SKILLS */}
      <Section title="Skills & Proficiency" icon={Sparkles} editing={editing === "skills"} onEdit={() => startEdit("skills")} onSave={saveEdit} onCancel={cancelEdit} isSaving={isSaving}>
        {editing === "skills" ? (
          <div className="space-y-6">
            <div>
              <Label className="block mb-2 font-bold text-navy">Technical Skills</Label>
              <div className="flex gap-2">
                <Input value={techInput} onChange={(e) => setTechInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addArr("technicalSkills", techInput, setTechInput); }} placeholder="Java, Python, SQL..." />
                <Button type="button" onClick={() => addArr("technicalSkills", techInput, setTechInput)}>Add</Button>
              </div>
              <div className="mt-3 space-y-2">
                {draft.technicalSkills?.map((s: string) => (
                  <div key={s} className="flex items-center justify-between bg-slate-50 p-2 rounded border">
                    <span className="font-medium text-navy">{s}</span>
                    <div className="flex items-center gap-2">
                      <Select value={draft.skillProficiencies?.[s]} onValueChange={(v) => setProficiency(s, v)}>
                        <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Proficiency" /></SelectTrigger>
                        <SelectContent>{PROFICIENCY_LEVELS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                      </Select>
                      <button onClick={() => remArr("technicalSkills", s)} className="text-red-500"><X className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <Label className="block mb-2 font-bold text-navy">Non-Technical Skills</Label>
              <div className="flex gap-2">
                <Input value={nonTechInput} onChange={(e) => setNonTechInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addArr("nonTechnicalSkills", nonTechInput, setNonTechInput); }} placeholder="Leadership, Communication..." />
                <Button type="button" onClick={() => addArr("nonTechnicalSkills", nonTechInput, setNonTechInput)}>Add</Button>
              </div>
              <div className="mt-3 space-y-2">
                {draft.nonTechnicalSkills?.map((s: string) => (
                  <div key={s} className="flex items-center justify-between bg-slate-50 p-2 rounded border">
                    <span className="font-medium text-navy">{s}</span>
                    <div className="flex items-center gap-2">
                      <Select value={draft.skillProficiencies?.[s]} onValueChange={(v) => setProficiency(s, v)}>
                        <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Proficiency" /></SelectTrigger>
                        <SelectContent>{PROFICIENCY_LEVELS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                      </Select>
                      <button onClick={() => remArr("nonTechnicalSkills", s)} className="text-red-500"><X className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Technical Skills</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.technicalSkills?.length > 0 ? profile.technicalSkills.map((s: string) => (
                  <Badge key={s} className="bg-navy text-white px-3 py-1">{s} ({profile.skillProficiencies?.[s] || "Intermediate"})</Badge>
                )) : <p className="text-sm italic text-muted-foreground mt-1">No technical skills added yet.</p>}
              </div>
            </div>
            <div className="pt-3 border-t">
              <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Non-Technical Skills</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.nonTechnicalSkills?.length > 0 ? profile.nonTechnicalSkills.map((s: string) => (
                  <Badge key={s} variant="outline" className="px-3 py-1">{s} ({profile.skillProficiencies?.[s] || "Intermediate"})</Badge>
                )) : <p className="text-sm italic text-muted-foreground mt-1">No non-technical skills added yet.</p>}
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* PROFILE TYPE & PREFERENCES */}
      <Section title="Profile Type & Preferences" icon={Target} editing={editing === "pref"} onEdit={() => startEdit("pref")} onSave={saveEdit} onCancel={cancelEdit} isSaving={isSaving}>
        {editing === "pref" ? (
          <div className="grid md:grid-cols-2 gap-4">
            <FieldSelect label="Opportunities Looking For" value={draft.opportunities?.[0]} onChange={(v: string) => setD("opportunities", [v])} options={OPPORTUNITIES_LIST} />
            <FieldSelect label="Aspirant Type" value={draft.aspirantType} onChange={(v: string) => setD("aspirantType", v)} options={ASPIRANT_TYPES} />
            
            <div className="md:col-span-2 pt-4 border-t">
              <Label className="block mb-2">Need Skilling in which Sector (Multi-select)</Label>
              <div className="flex flex-wrap gap-2">
                {SECTORS.map((s) => {
                  const on = draft.preferredSectors?.includes(s);
                  return <Badge key={s} onClick={() => {
                    const arr = draft.preferredSectors || [];
                    setD("preferredSectors", on ? arr.filter((x:string)=>x!==s) : [...arr, s]);
                  }} className={`cursor-pointer ${on ? "bg-india-green text-white" : "bg-white text-navy border"}`}>{s}</Badge>
                })}
              </div>
            </div>

            <div className="md:col-span-2">
               <Label className="block mb-2">Based on sector, prefer job roles</Label>
               <div className="flex gap-2">
                  <Input value={roleInput} onChange={(e) => setRoleInput(e.target.value)} onKeyDown={(e) => { if(e.key==="Enter") addArr("preferredRoles", roleInput, setRoleInput); }} placeholder="e.g. Data Analyst" />
                  <Button type="button" onClick={() => addArr("preferredRoles", roleInput, setRoleInput)}>Add</Button>
               </div>
               <div className="flex flex-wrap gap-2 mt-2">
                 {draft.preferredRoles?.map((r: string) => <Badge key={r} className="bg-navy gap-1">{r} <button onClick={()=>remArr("preferredRoles", r)}><X className="h-3 w-3"/></button></Badge>)}
               </div>
            </div>

            <div className="md:col-span-2 pt-4 border-t">
              <Label className="block mb-2">Location Preference (Max 3)</Label>
              <div className="flex flex-wrap gap-2">
                {["Bengaluru", "Mysuru", "Hubballi", "Hyderabad", "Remote"].map((loc) => {
                   const on = draft.preferredLocations?.includes(loc);
                   return <Badge key={loc} onClick={() => {
                     const arr = draft.preferredLocations || [];
                     if (!on && arr.length >= 3) return toast.error("Max 3 locations allowed");
                     setD("preferredLocations", on ? arr.filter((x:string)=>x!==loc) : [...arr, loc]);
                   }} className={`cursor-pointer ${on ? "bg-saffron text-navy" : "bg-white text-navy border"}`}>{loc}</Badge>
                })}
              </div>
            </div>

            <label className="md:col-span-2 flex items-center gap-2 font-medium text-navy text-sm">
              <Checkbox checked={!!draft.willingToRelocate} onCheckedChange={(v) => setD("willingToRelocate", !!v)} /> Are you Willing to Relocate for the opted opportunity?
            </label>
          </div>
        ) : (
          <ReviewGrid>
            <Row label="Opportunities" value={profile.opportunities?.[0]} />
            <Row label="Aspirant Type" value={profile.aspirantType} />
            <Row label="Sectors" value={profile.preferredSectors?.join(", ")} full />
            <Row label="Job Roles" value={profile.preferredRoles?.join(", ")} full />
            <Row label="Locations" value={profile.preferredLocations?.join(", ")} />
            <Row label="Willing to Relocate" value={profile.willingToRelocate ? "Yes" : "No"} />
          </ReviewGrid>
        )}
      </Section>
    </DashShell>
  );
}

function Section({ title, icon: Icon, editing, onEdit, onSave, onCancel, isSaving, children }: any) {
  return (
    <Card className="p-6 border-border/60 mb-4 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-border">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-saffron/15 text-saffron grid place-items-center"><Icon className="h-4 w-4" /></div>
          <h2 className="font-display font-bold text-navy">{title}</h2>
        </div>
        {onEdit && !editing && <Button size="sm" variant="outline" onClick={onEdit}><Pencil className="h-3 w-3 mr-1" />Edit</Button>}
        {editing && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button size="sm" onClick={onSave} disabled={isSaving} className="bg-india-green text-white">{isSaving ? "Saving..." : "Save"}</Button>
          </div>
        )}
      </div>
      {children}
    </Card>
  );
}

function ReviewGrid({ children }: { children: ReactNode }) { return <div className="grid md:grid-cols-2 gap-3">{children}</div>; }

function Row({ label, value, full }: { label: string; value?: string; full?: boolean }) {
  const missing = !value || value.length === 0;
  return (
    <div className={`p-3 rounded-lg ${missing ? "bg-saffron/5 border border-dashed border-saffron/40" : "bg-muted/40"} ${full ? "md:col-span-2" : ""}`}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`font-medium mt-0.5 ${missing ? "text-saffron italic text-sm" : "text-navy text-sm"}`}>{value || "Not provided"}</div>
    </div>
  );
}

function FieldInput({ label, value, onChange, type = "text", placeholder }: any) {
  return (
    <div>
      <Label className="text-xs text-navy font-semibold">{label}</Label>
      <Input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} className="mt-1 bg-white" placeholder={placeholder} />
    </div>
  );
}

function FieldSelect({ label, value, onChange, options }: any) {
  return (
    <div>
      <Label className="text-xs text-navy font-semibold">{label}</Label>
      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger className="mt-1 bg-white"><SelectValue placeholder="Select..." /></SelectTrigger>
        <SelectContent>{options.map((o:string) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}
