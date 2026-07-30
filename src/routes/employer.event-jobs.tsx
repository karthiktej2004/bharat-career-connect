import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { DashShell, PageHeader } from "@/components/DashShell";
import { employerNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CalendarDays, MapPin, Users, CheckCircle2, Clock, AlertCircle, Loader2, Plus, MapPinned, Briefcase } from "lucide-react";
import { getSession } from "@/lib/mockStore";
import { toast } from "sonner";

export const Route = createFileRoute("/employer/events")({
  head: () => ({ meta: [{ title: "Job Fair Participation — Bharat Career Connect" }] }),
  component: EmployerEvents,
});

const EMPLOYMENT_TYPES = ["Trainee", "Intern", "Apprentice", "Full-Time", "Part-Time", "Contractor", "Freelancer", "Volunteer", "Consultant", "Vendor"];
const PREFERRED_SHIFTS = ["Day Shift", "Night Shift", "Remote", "Hybrid", "On-Site", "Rotational"];
const SUB_CATEGORIES = ["Open For All", "Male Only", "Female Only", "PWD", "Widow", "LGBTQ", "Senior Citizens", "Veterans"];

function EmployerEvents() {
  return (
    <DashShell role="employer" nav={employerNav}>
      <EmployerEventsBody />
    </DashShell>
  );
}

export function EmployerEventsBody() {
  const user = getSession();
  const userId = user?.id;

  const [events, setEvents] = useState<any[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [applyingEventId, setApplyingEventId] = useState<number | null>(null);

  // --- JOB POSTING MODAL STATE ---
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [selectedEventIdForJob, setSelectedEventIdForJob] = useState<number | null>(null);
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "", type: "", shift: "", subCategory: "", location: "",
    qualification: "", experience: "", salary: "", vacancies: "",
    skills: "", description: "", responsibilities: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const fetchEventsData = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const eventsRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/events`);
      const eventsJson = await eventsRes.json();

      const appsRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/employer/${userId}/event-stalls`);
      const appsJson = await appsRes.json();

      if (eventsJson.success) setEvents(eventsJson.data);
      if (appsJson.success) setMyApplications(appsJson.data);
    } catch (err) {
      console.error("Error fetching job fair events:", err);
      toast.error("Failed to load job fair events.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchEventsData();
  }, [fetchEventsData]);

  const handleApplyForStall = async (eventId: number) => {
    if (!userId) return;
    setApplyingEventId(eventId);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/employer/event-stalls/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employerId: userId, eventId })
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Stall application submitted successfully! Awaiting admin review.");
        fetchEventsData();
      } else {
        toast.error(json.message || "Failed to submit stall application.");
      }
    } catch (err) {
      toast.error("Server connection error.");
    } finally {
      setApplyingEventId(null);
    }
  };

  const openJobModal = (eventId: number) => {
    setSelectedEventIdForJob(eventId);
    setIsJobDialogOpen(true);
  };

  const handleJobSubmit = async () => {
    if (!formData.title || !formData.type || !formData.location) {
      toast.error("Please fill in all required fields (Title, Type, Location).");
      return;
    }
    setIsSubmittingJob(true);
    try {
      // Sends the job to the backend with the event_id attached
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/employer/${userId}/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          jobType: formData.type,
          location: formData.location,
          qualification: formData.qualification,
          experience: formData.experience,
          salary: formData.salary,
          skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : [],
          vacancies: formData.vacancies,
          description: formData.description,
          event_id: selectedEventIdForJob 
        })
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Job posted successfully for this event!");
        setIsJobDialogOpen(false);
        setFormData({
          title: "", type: "", shift: "", subCategory: "", location: "",
          qualification: "", experience: "", salary: "", vacancies: "",
          skills: "", description: "", responsibilities: ""
        });
      } else {
        toast.error(json.message || "Failed to post job.");
      }
    } catch (err) {
      toast.error("Server connection error while posting job.");
    } finally {
      setIsSubmittingJob(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Job Fair Participation"
        description="Apply for a physical or virtual stall, wait for admin approval, and unlock event-specific hiring tools."
      />

      {isLoading ? (
        <div className="flex justify-center p-16">
          <Loader2 className="h-8 w-8 animate-spin text-saffron" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {events.map((evt) => {
            const userApp = myApplications.find(a => a.eventId === evt.id);
            const status = userApp ? userApp.status : null; 
            const allocatedStall = userApp?.allocatedStall; 

            return (
              <Card key={evt.id} className="p-6 border-border/60 flex flex-col justify-between shadow-sm relative overflow-hidden bg-white">
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <Badge variant="outline" className="mb-2 uppercase text-[10px] tracking-widest bg-slate-100 text-navy font-semibold">
                        {evt.event_type || "Physical"}
                      </Badge>
                      <h3 className="font-display font-bold text-xl text-navy">{evt.name}</h3>
                    </div>
                    {status === 'approved' && (
                      <Badge className="bg-india-green/15 text-india-green gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approved
                      </Badge>
                    )}
                    {status === 'pending' && (
                      <Badge className="bg-saffron/15 text-saffron gap-1">
                        <Clock className="h-3.5 w-3.5" /> Pending
                      </Badge>
                    )}
                    {status === 'rejected' && (
                      <Badge className="bg-destructive/15 text-destructive gap-1">
                        <AlertCircle className="h-3.5 w-3.5" /> Rejected
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-saffron shrink-0" />
                      <span>{new Date(evt.event_date).toLocaleDateString("en-IN", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-saffron shrink-0" />
                      <span>{evt.city || "Venue TBD"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-saffron shrink-0" />
                      <span>Capacity: {evt.employer_capacity || 50} Employer Stalls</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">
                      Stall Fee: <strong className="text-navy">₹{evt.stall_price || 0}</strong>
                    </span>
                  </div>

                  {/* DYNAMIC APPLICATION STAGES */}
                  <div className="flex flex-col gap-2">
                    {!status ? (
                      <Button 
                        disabled={applyingEventId === evt.id}
                        onClick={() => handleApplyForStall(evt.id)} 
                        className="bg-saffron text-navy hover:bg-saffron/90 font-semibold w-full"
                      >
                        {applyingEventId === evt.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                        Apply for Stall
                      </Button>
                    ) : status === 'pending' ? (
                      <Button variant="outline" disabled className="w-full border-saffron text-saffron bg-saffron/5 font-semibold">
                        Waiting for BCC Approval
                      </Button>
                    ) : status === 'approved' ? (
                      <div className="w-full space-y-3">
                        <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg text-sm text-indigo-900">
                          {allocatedStall ? (
                            <div>
                              <p className="font-semibold mb-1 flex items-center gap-1.5"><MapPinned className="h-4 w-4" /> Stall Allocated!</p>
                              <p className="text-xs opacity-90">Stall Number: <strong>{allocatedStall}</strong></p>
                              {evt.google_maps_link && (
                                <a href={evt.google_maps_link} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                                  View on Google Maps &rarr;
                                </a>
                              )}
                            </div>
                          ) : (
                            <p className="font-medium flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-india-green" /> 
                              Event approved waiting for stall allocation
                            </p>
                          )}
                        </div>
                        {/* ONLY SHOW THIS BUTTON IF APPROVED */}
                        <Button 
                          onClick={() => openJobModal(evt.id)} 
                          className="bg-navy text-white hover:bg-navy/90 font-semibold w-full gap-2"
                        >
                          <Plus className="h-4 w-4" /> Post job for this event
                        </Button>
                      </div>
                    ) : (
                      <Button variant="outline" disabled className="w-full border-destructive text-destructive bg-destructive/5 font-semibold">
                        Application Rejected
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
          
          {events.length === 0 && !isLoading && (
             <div className="col-span-full py-12 text-center text-muted-foreground bg-slate-50 border border-dashed rounded-xl">
               No upcoming job fairs available right now.
             </div>
          )}
        </div>
      )}

      {/* MODAL TO POST A NEW JOB FOR THE EVENT */}
      <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-display text-navy flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-saffron" /> Post Job for Event
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid md:grid-cols-2 gap-4 py-4">
            <div className="md:col-span-2">
              <Label>Job Title <span className="text-red-500">*</span></Label>
              <Input 
                placeholder="e.g. Junior Software Engineer" 
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value.replace(/[0-9]/g, ""))}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">Numbers are not allowed in the job title.</p>
            </div>

            <div>
              <Label>Employment Type <span className="text-red-500">*</span></Label>
              <Select value={formData.type} onValueChange={(v) => handleInputChange("type", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Location <span className="text-red-500">*</span></Label>
              <Input placeholder="e.g. Bengaluru" value={formData.location} onChange={(e) => handleInputChange("location", e.target.value)} className="mt-1" />
            </div>

            <div>
              <Label>Preferred Shift</Label>
              <Select value={formData.shift} onValueChange={(v) => handleInputChange("shift", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select shift" /></SelectTrigger>
                <SelectContent>
                  {PREFERRED_SHIFTS.map(shift => <SelectItem key={shift} value={shift}>{shift}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Sub Category (Classification)</Label>
              <Select value={formData.subCategory} onValueChange={(v) => handleInputChange("subCategory", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {SUB_CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Qualification</Label>
              <Input placeholder="e.g. BE/B-Tech" value={formData.qualification} onChange={(e) => handleInputChange("qualification", e.target.value)} className="mt-1" />
            </div>

            <div>
              <Label>Experience</Label>
              <Input placeholder="e.g. 0-2 yrs" value={formData.experience} onChange={(e) => handleInputChange("experience", e.target.value)} className="mt-1" />
            </div>

            <div>
              <Label>CTC / Stipend</Label>
              <Input placeholder="e.g. ₹4.2 LPA" value={formData.salary} onChange={(e) => handleInputChange("salary", e.target.value)} className="mt-1" />
            </div>

            <div>
              <Label>Vacancies</Label>
              <Input type="number" placeholder="e.g. 5" value={formData.vacancies} onChange={(e) => handleInputChange("vacancies", e.target.value)} className="mt-1" />
            </div>

            <div className="md:col-span-2">
              <Label>Skills (comma separated)</Label>
              <Input placeholder="e.g. Java, SQL, REST APIs" value={formData.skills} onChange={(e) => handleInputChange("skills", e.target.value)} className="mt-1" />
            </div>

            <div className="md:col-span-2">
              <Label>Responsibilities <span className="text-red-500">*</span></Label>
              <Textarea 
                placeholder="List the day-to-day responsibilities for this role..." 
                value={formData.responsibilities} 
                onChange={(e) => handleInputChange("responsibilities", e.target.value)} 
                className="mt-1 resize-none h-20"
              />
            </div>

            <div className="md:col-span-2">
              <Label>Job Description</Label>
              <Textarea 
                placeholder="Overview, benefits, and requirements..." 
                value={formData.description} 
                onChange={(e) => handleInputChange("description", e.target.value)} 
                className="mt-1 resize-none h-24"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsJobDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleJobSubmit} disabled={isSubmittingJob} className="bg-saffron text-navy hover:bg-saffron/90">
              {isSubmittingJob ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
