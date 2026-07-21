import { createFileRoute } from "@tanstack/react-router";
import { DashShell, PageHeader } from "@/components/DashShell";
import { candidateNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, Check, Pencil, Save, X, User as UserIcon, GraduationCap, Sparkles, Briefcase, FileText, Target, Plus, Loader2 } from "lucide-react";
import {
  QUALIFICATIONS, NSQF_SKILLS, INDIAN_LANGUAGES, INDIAN_STATES,
  getSession, type CandidateProfile,
} from "@/lib/mockStore";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/candidate/profile")({
  head: () => ({ meta: [{ title: "My Profile — Candidate" }] }),
  component: Profile,
});

type Editable = Partial<CandidateProfile>;

function Profile() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Editable>({});
  const [skillSearch, setSkillSearch] = useState("");
  const [newRole, setNewRole] = useState("");

  // 1. FETCH FROM REAL DATABASE ON LOAD
  useEffect(() => {
    const loadProfile = async () => {
      const session = getSession();
      if (!session || !session.id) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:5000/api/candidate/profile/${session.id}`);
        const json = await res.json();
        if (json.success) {
          setProfile(json.data);
        }
      } catch (err) {
        toast.error("Failed to fetch profile from database.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProfile();
  }, []);

  const completion = useMemo(() => {
    if (!profile) return 0;
    const p = profile;
    const fields: unknown[] = [p.fullName, p.email, p.phone, p.dob, p.gender, p.category, p.state, p.district, p.pincode, p.qualification, p.institution, p.yearOfPassing, p.percentage, p.specialization, p.skills?.length, p.experienceType, p.resumeFileName, p.preferredLocations?.length, p.preferredJobType, p.expectedSalary];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }, [profile]);

  // 2. MASTER FUNCTION TO SAVE TO REAL POSTGRESQL DATABASE
  const saveToDatabase = async (mergedData: CandidateProfile) => {
    setIsSaving(true);
    try {
      const res = await fetch("http://localhost:5000/api/candidate/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mergedData)
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Profile securely updated!");
      } else {
        toast.error("Failed to save changes to database.");
      }
    } catch (err) {
      toast.error("Database connection failed.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashShell role="candidate" nav={candidateNav}>
        <div className="flex flex-col items-center justify-center h-[60vh] text-navy">
          <Loader2 className="h-8 w-8 animate-spin mb-4 text-saffron" />
          <p className="font-medium">Loading your profile...</p>
        </div>
      </DashShell>
    );
  }

  if (!profile) {
    return (
      <DashShell role="candidate" nav={candidateNav}>
        <PageHeader title="My Profile" description="Complete your registration to see your profile." />
        <Card className="p-8 text-center border-border/60">
          <p className="text-muted-foreground">No profile found. Please sign in again.</p>
        </Card>
      </DashShell>
    );
  }

  const startEdit = (section: string) => { setDraft({ ...profile }); setEditing(section); };
  const cancelEdit = () => { setEditing(null); setDraft({}); };
  
  // 3. APPLY EDITS & TRIGGER DB SAVE
  const saveEdit = () => {
    const merged: CandidateProfile = { ...profile, ...draft, completion };
    setProfile(merged);
    setEditing(null);
    setDraft({});
    saveToDatabase(merged); // Sends to API
  };

  const set = <K extends keyof CandidateProfile>(k: K, v: CandidateProfile[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const addSkill = (s: string) => {
    const v = s.trim();
    if (!v) return;
    const existing = profile.skills || [];
    if (existing.some((x) => x.toLowerCase() === v.toLowerCase())) return;
    const merged = { ...profile, skills: [...existing, v] };
    setProfile(merged);
    saveToDatabase(merged);
    setSkillSearch("");
  };
  
  const removeSkill = (s: string) => {
    const merged = { ...profile, skills: (profile.skills || []).filter((x) => x !== s) };
    setProfile(merged);
    saveToDatabase(merged);
  };
  
  const addRole = () => {
    const v = newRole.trim();
    if (!v) return;
    const existing = profile.preferredRoles || [];
    if (existing.some((x) => x.toLowerCase() === v.toLowerCase())) { setNewRole(""); return; }
    const merged = { ...profile, preferredRoles: [...existing, v] };
    setProfile(merged);
    saveToDatabase(merged);
    setNewRole("");
  };
  
  const removeRole = (r: string) => {
    const merged = { ...profile, preferredRoles: (profile.preferredRoles || []).filter((x) => x !== r) };
    setProfile(merged);
    saveToDatabase(merged);
  };
  
  const toggleLocation = (l: string) => {
    const existing = profile.preferredLocations || [];
    const next = existing.includes(l) ? existing.filter((x) => x !== l) : [...existing, l];
    const merged = { ...profile, preferredLocations: next };
    setProfile(merged);
    saveToDatabase(merged);
  };
  
  const toggleLanguage = (l: string) => {
    const existing = profile.languagesFluent || [];
    const next = existing.includes(l) ? existing.filter((x) => x !== l) : [...existing, l];
    const merged = { ...profile, languagesFluent: next };
    setProfile(merged);
    saveToDatabase(merged);
  };

  const skillMatches = skillSearch.trim()
    ? NSQF_SKILLS.filter((s) => s.toLowerCase().includes(skillSearch.trim().toLowerCase())).slice(0, 12)
    : [];

  return (
    <DashShell role="candidate" nav={candidateNav}>
      <PageHeader title="My Profile" description={`Candidate ID: ${profile.uniqueId}`} />

      {/* Completion */}
      <Card className="p-6 border-border/60 mb-6">
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
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-saffron to-india-green transition-all" style={{ width: `${completion}%` }} />
        </div>
        {completion < 100 && <p className="text-xs text-muted-foreground mt-2">Add the missing details below to reach 100%.</p>}
      </Card>

      {/* Basic Info */}
      <Section title="Basic Information" icon={UserIcon} editing={editing === "basic"} onEdit={() => startEdit("basic")} onSave={saveEdit} onCancel={cancelEdit} isSaving={isSaving}>
        {editing === "basic" ? (
          <div className="grid md:grid-cols-2 gap-4">
            <FieldInput label="Full Name" value={draft.fullName} onChange={(v) => set("fullName", v)} />
            <FieldInput label="Email" type="email" value={draft.email} onChange={(v) => set("email", v)} />
            <FieldInput label="Phone" value={draft.phone} onChange={(v) => set("phone", v)} />
            <FieldInput label="Date of Birth" type="date" value={draft.dob} onChange={(v) => set("dob", v)} />
            <FieldSelect label="Gender" value={draft.gender} onChange={(v) => set("gender", v)} options={["Male","Female","Other"]} />
            <FieldSelect label="Preferred Language" value={draft.language} onChange={(v) => set("language", v)} options={INDIAN_LANGUAGES} />
            <FieldSelect label="Category" value={draft.category} onChange={(v) => set("category", v as CandidateProfile["category"])} options={["General","SC","ST","OBC","EWS","PwD"]} />
            <FieldSelect label="State" value={draft.state} onChange={(v) => set("state", v)} options={INDIAN_STATES} />
            <FieldInput label="District" value={draft.district} onChange={(v) => set("district", v)} />
            <FieldInput label="Taluk" value={draft.taluk} onChange={(v) => set("taluk", v)} />
            <FieldInput label="PIN Code" value={draft.pincode} onChange={(v) => set("pincode", v)} />
          </div>
        ) : (
          <ReviewGrid>
            <Row label="Full Name" value={profile.fullName} />
            <Row label="Email" value={profile.email} />
            <Row label="Phone" value={profile.phone} />
            <Row label="Date of Birth" value={profile.dob} />
            <Row label="Gender" value={profile.gender} />
            <Row label="Preferred Language" value={profile.language} />
            <Row label="Category" value={profile.category} />
            <Row label="State" value={profile.state} />
            <Row label="District" value={profile.district} />
            <Row label="Taluk" value={profile.taluk} />
            <Row label="PIN Code" value={profile.pincode} />
          </ReviewGrid>
        )}
      </Section>

      {/* Education */}
      <Section title="Education" icon={GraduationCap} editing={editing === "edu"} onEdit={() => startEdit("edu")} onSave={saveEdit} onCancel={cancelEdit} isSaving={isSaving}>
        {editing === "edu" ? (
          <div className="grid md:grid-cols-2 gap-4">
            <FieldSelect label="Highest Qualification" value={draft.qualification} onChange={(v) => set("qualification", v)} options={QUALIFICATIONS} />
            <FieldInput label="Institution / Board / College" value={draft.institution} onChange={(v) => set("institution", v)} />
            <FieldInput label="School Name" value={draft.schoolName} onChange={(v) => set("schoolName", v)} />
            <FieldInput label="Course" value={draft.course} onChange={(v) => set("course", v)} />
            <FieldInput label="Specialization / Stream" value={draft.specialization} onChange={(v) => set("specialization", v)} />
            <FieldInput label="Year of Passing" value={draft.yearOfPassing} onChange={(v) => set("yearOfPassing", v)} />
            <FieldInput label="Percentage / CGPA" value={draft.percentage} onChange={(v) => set("percentage", v)} />
          </div>
        ) : (
          <ReviewGrid>
            <Row label="Qualification" value={profile.qualification} />
            <Row label="Institution" value={profile.institution} />
            <Row label="School Name" value={profile.schoolName} />
            <Row label="Course" value={profile.course} />
            <Row label="Specialization / Stream" value={profile.specialization} />
            <Row label="Year of Passing" value={profile.yearOfPassing} />
            <Row label="Percentage / CGPA" value={profile.percentage} />
          </ReviewGrid>
        )}
        <div className="mt-4">
          <Label className="text-xs text-muted-foreground">Languages you speak</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {INDIAN_LANGUAGES.map((l) => {
              const on = profile.languagesFluent?.includes(l);
              return <Badge key={l} onClick={() => toggleLanguage(l)} className={`cursor-pointer ${on ? "bg-india-green text-white" : "bg-muted text-navy hover:bg-muted/80"}`}>{l}</Badge>;
            })}
          </div>
        </div>
      </Section>

      {/* Skills — always inline editable */}
      <Section title="Skills" icon={Sparkles}>
        <div className="flex gap-2">
          <Input value={skillSearch} onChange={(e) => setSkillSearch(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillSearch); } }} placeholder="Search or type a skill and press Add" />
          <Button type="button" onClick={() => addSkill(skillSearch)} disabled={!skillSearch.trim() || isSaving} className="bg-navy hover:bg-navy/90"><Plus className="h-4 w-4 mr-1" />Add</Button>
        </div>
        {skillMatches.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {skillMatches.map((s) => {
              const has = profile.skills?.includes(s);
              return (
                <Badge key={s} onClick={() => !has && addSkill(s)} className={`cursor-pointer ${has ? "bg-india-green/20 text-india-green" : "bg-muted text-navy hover:bg-muted/80"}`}>
                  {has ? <Check className="h-3 w-3 mr-1" /> : <Plus className="h-3 w-3 mr-1" />}{s}
                </Badge>
              );
            })}
          </div>
        )}
        <div className="mt-4">
          <div className="text-xs font-medium text-muted-foreground mb-2">Your skills ({profile.skills?.length || 0})</div>
          {(profile.skills?.length || 0) === 0 ? (
            <p className="text-sm text-muted-foreground italic">No skills added yet — search above to add.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.skills!.map((s) => (
                <Badge key={s} className="bg-saffron text-navy gap-1">
                  <Check className="h-3 w-3" /> {s}
                  <button type="button" onClick={() => removeSkill(s)} disabled={isSaving} className="ml-1 hover:text-destructive"><X className="h-3 w-3" /></button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* Experience */}
      <Section title="Experience" icon={Briefcase} editing={editing === "exp"} onEdit={() => startEdit("exp")} onSave={saveEdit} onCancel={cancelEdit} isSaving={isSaving}>
        {editing === "exp" ? (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Experience Type</Label>
              <div className="mt-2 flex gap-3">
                {(["Fresher","Experienced"] as const).map((t) => (
                  <button key={t} type="button" onClick={() => set("experienceType", t)} className={`flex-1 p-3 rounded-lg border text-left transition ${draft.experienceType === t ? "border-navy bg-navy/5" : "border-border hover:border-navy/40"}`}>
                    <div className="font-medium text-navy">{t}</div>
                  </button>
                ))}
              </div>
            </div>
            {draft.experienceType === "Experienced" && (
              <>
                <FieldInput label="Total Years of Experience" value={draft.yearsOfExperience} onChange={(v) => set("yearsOfExperience", v)} placeholder="e.g. 2.5" />
                <FieldSelect label="Current Employment Status" value={draft.employmentStatus} onChange={(v) => set("employmentStatus", v)} options={["Currently employed","Serving notice period","Not employed / Available immediately"]} />
                <FieldInput label="Current / Last Job Title" value={draft.currentRole} onChange={(v) => set("currentRole", v)} />
                <FieldInput label="Current / Last Company" value={draft.currentCompany} onChange={(v) => set("currentCompany", v)} />
                <FieldSelect label="Industry" value={draft.industry} onChange={(v) => set("industry", v)} options={["IT / Software","BPO / KPO","Banking & Finance","Manufacturing","Automobile","Healthcare / Pharma","Retail / E-commerce","Telecom","Education","Construction","Logistics","Hospitality","Government / PSU","Media","Consulting","Other"]} />
                <FieldSelect label="Functional Area" value={draft.functionalArea} onChange={(v) => set("functionalArea", v)} options={["Engineering / Development","Sales / BD","Marketing","Operations","Finance / Accounts","HR","Customer Service","Admin","Design","Production","Quality","Other"]} />
                <FieldSelect label="Employment Type" value={draft.employmentType} onChange={(v) => set("employmentType", v)} options={["Full-time","Part-time","Contract","Internship","Freelance"]} />
                <FieldSelect label="Notice Period" value={draft.noticePeriod} onChange={(v) => set("noticePeriod", v)} options={["Immediate / 0 days","15 days","30 days","60 days","90 days","More than 90 days"]} />
                <FieldInput label="Current Annual Salary (LPA)" value={draft.currentSalary} onChange={(v) => set("currentSalary", v)} />
                <FieldInput label="Work Location" value={draft.workLocation} onChange={(v) => set("workLocation", v)} />
                <FieldInput label="Joined (From)" type="month" value={draft.joinedFrom} onChange={(v) => set("joinedFrom", v)} />
                <div>
                  <Label>Worked Until</Label>
                  <Input type="month" value={draft.joinedTo || ""} onChange={(e) => set("joinedTo", e.target.value)} className="mt-1" disabled={!!draft.currentlyWorking} />
                  <label className="flex items-center gap-2 text-xs mt-2"><Checkbox checked={!!draft.currentlyWorking} onCheckedChange={(v) => set("currentlyWorking", !!v)} /> I currently work here</label>
                </div>
                <div className="md:col-span-2">
                  <Label>Key Responsibilities / Achievements</Label>
                  <Textarea value={draft.jobDescription || ""} onChange={(e) => set("jobDescription", e.target.value)} className="mt-1" rows={4} />
                </div>
                <FieldInput label="Reason for Change" value={draft.reasonForChange} onChange={(v) => set("reasonForChange", v)} />
              </>
            )}
          </div>
        ) : (
          <ReviewGrid>
            <Row label="Type" value={profile.experienceType} />
            {profile.experienceType === "Experienced" && (
              <>
                <Row label="Total Experience" value={profile.yearsOfExperience ? `${profile.yearsOfExperience} yrs` : undefined} />
                <Row label="Employment Status" value={profile.employmentStatus} />
                <Row label="Job Title" value={profile.currentRole} />
                <Row label="Company" value={profile.currentCompany} />
                <Row label="Industry" value={profile.industry} />
                <Row label="Functional Area" value={profile.functionalArea} />
                <Row label="Employment Type" value={profile.employmentType} />
                <Row label="Notice Period" value={profile.noticePeriod} />
                <Row label="Current Salary" value={profile.currentSalary ? `${profile.currentSalary} LPA` : undefined} />
                <Row label="Work Location" value={profile.workLocation} />
                <Row label="From" value={profile.joinedFrom} />
                <Row label="To" value={profile.currentlyWorking ? "Present" : profile.joinedTo} />
                <Row label="Responsibilities" value={profile.jobDescription} full />
                <Row label="Reason for Change" value={profile.reasonForChange} />
              </>
            )}
          </ReviewGrid>
        )}
      </Section>

      {/* Resume */}
      <Section title="Resume" icon={FileText}>
        <label className="block border-2 border-dashed border-navy/30 rounded-xl p-6 hover:bg-navy/5 cursor-pointer transition text-center">
          <Upload className="h-8 w-8 mx-auto text-navy" />
          <div className="mt-2 font-medium text-navy">{profile.resumeFileName || "Upload your Resume (PDF/DOC)"}</div>
          <div className="text-xs text-muted-foreground mt-1">{profile.resumeFileName ? "Click to replace" : "Optional but recommended"}</div>
          <input type="file" accept=".pdf,.doc,.docx" className="hidden" disabled={isSaving} onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) { const merged = { ...profile, resumeFileName: f.name }; setProfile(merged); saveToDatabase(merged); }
          }} />
        </label>
      </Section>

      {/* Preferences */}
      <Section title="Preferences" icon={Target} editing={editing === "pref"} onEdit={() => startEdit("pref")} onSave={saveEdit} onCancel={cancelEdit} isSaving={isSaving}>
        {editing === "pref" ? (
          <div className="grid md:grid-cols-2 gap-4">
            <FieldSelect label="Job Type" value={draft.preferredJobType} onChange={(v) => set("preferredJobType", v)} options={["Full-time","Internship","Apprenticeship","Part-time","Contract"]} />
            <FieldInput label="Expected Salary (LPA)" value={draft.expectedSalary} onChange={(v) => set("expectedSalary", v)} />
            <label className="md:col-span-2 flex items-center gap-2 text-sm"><Checkbox checked={!!draft.willingToRelocate} onCheckedChange={(v) => set("willingToRelocate", !!v)} /> Willing to relocate</label>
          </div>
        ) : (
          <ReviewGrid>
            <Row label="Job Type" value={profile.preferredJobType} />
            <Row label="Expected Salary" value={profile.expectedSalary ? `${profile.expectedSalary} LPA` : undefined} />
            <Row label="Willing to Relocate" value={profile.willingToRelocate ? "Yes" : "No"} />
          </ReviewGrid>
        )}
        <div className="mt-4">
          <Label className="text-xs text-muted-foreground">Preferred Locations</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {["Bengaluru","Mysuru","Hubballi","Mangaluru","Hyderabad","Chennai","Pune","Delhi","Mumbai","Remote"].map((l) => {
              const on = profile.preferredLocations?.includes(l);
              return <Badge key={l} onClick={() => toggleLocation(l)} className={`cursor-pointer ${on ? "bg-navy text-white" : "bg-muted text-navy hover:bg-muted/80"}`}>{l}</Badge>;
            })}
          </div>
        </div>
        <div className="mt-4">
          <Label className="text-xs text-muted-foreground">Preferred Roles</Label>
          <div className="flex gap-2 mt-2">
            <Input value={newRole} onChange={(e) => setNewRole(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addRole(); } }} placeholder="e.g. Software Engineer" />
            <Button type="button" onClick={addRole} disabled={!newRole.trim() || isSaving} className="bg-navy hover:bg-navy/90"><Plus className="h-4 w-4 mr-1" />Add</Button>
          </div>
          {(profile.preferredRoles?.length || 0) > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {profile.preferredRoles!.map((r) => (
                <Badge key={r} className="bg-navy text-white gap-1">
                  {r}
                  <button type="button" disabled={isSaving} onClick={() => removeRole(r)} className="ml-1 hover:text-saffron"><X className="h-3 w-3" /></button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Section>
    </DashShell>
  );
}

function Section({ title, icon: Icon, editing, onEdit, onSave, onCancel, isSaving, children }: { title: string; icon: React.ComponentType<{ className?: string }>; editing?: boolean; onEdit?: () => void; onSave?: () => void; onCancel?: () => void; isSaving?: boolean; children: ReactNode; }) {
  return (
    <Card className="p-6 border-border/60 mb-4">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-saffron/15 text-saffron grid place-items-center"><Icon className="h-4 w-4" /></div>
          <h2 className="font-display font-bold text-navy">{title}</h2>
        </div>
        {onEdit && !editing && (
          <Button size="sm" variant="outline" onClick={onEdit} disabled={isSaving}><Pencil className="h-3 w-3 mr-1" />Edit</Button>
        )}
        {editing && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onCancel} disabled={isSaving}><X className="h-3 w-3 mr-1" />Cancel</Button>
            <Button size="sm" onClick={onSave} disabled={isSaving} className="bg-india-green hover:bg-india-green/90 text-white">
              {isSaving ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Save className="h-3 w-3 mr-1" />} Save
            </Button>
          </div>
        )}
      </div>
      {children}
    </Card>
  );
}

function ReviewGrid({ children }: { children: ReactNode }) {
  return <div className="grid md:grid-cols-2 gap-3">{children}</div>;
}

function Row({ label, value, full }: { label: string; value?: string; full?: boolean }) {
  const missing = !value;
  return (
    <div className={`p-3 rounded-lg ${missing ? "bg-saffron/5 border border-dashed border-saffron/40" : "bg-muted/40"} ${full ? "md:col-span-2" : ""}`}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`font-medium mt-0.5 ${missing ? "text-saffron italic" : "text-navy"}`}>{value || "Not provided — click Edit to add"}</div>
    </div>
  );
}

function FieldInput({ label, value, onChange, type = "text", placeholder }: { label: string; value?: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} className="mt-1" placeholder={placeholder} />
    </div>
  );
}

function FieldSelect({ label, value, onChange, options }: { label: string; value?: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
        <SelectContent>{options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}