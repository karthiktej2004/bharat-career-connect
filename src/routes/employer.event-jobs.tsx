import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import { DashShell } from '@/components/DashShell'
import { employerNav } from '@/lib/dashNav'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Briefcase, MapPin, Edit, Trash2, XCircle, RefreshCcw, Clock, Users, Tent, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { getSession } from '@/lib/mockStore'

// 1. Tell TanStack router to expect optional URL search parameters
export const Route = createFileRoute('/employer/event-jobs')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      action: search.action as string | undefined,
      eventId: search.eventId as string | undefined,
    }
  },
  component: EmployerEventJobsPage,
})

const EMPLOYMENT_TYPES = ["Trainee", "Intern", "Apprentice", "Full-Time", "Part-Time", "Contractor", "Freelancer", "Volunteer", "Consultant", "Vendor"];
const PREFERRED_SHIFTS = ["Day Shift", "Night Shift", "Remote", "Hybrid", "On-Site", "Rotational"];
const SUB_CATEGORIES = ["Open For All", "Male Only", "Female Only", "PWD", "Widow", "LGBTQ", "Senior Citizens", "Veterans"];

type EventJob = {
  id: string;
  title: string;
  type: string;
  shift: string;
  subCategory: string;
  location: string;
  vacancies: string;
  postedDate: string;
  status: string;
  eventName: string; 
};

function EmployerEventJobsPage() {
  const user = getSession();
  const userId = user?.id;

  // 2. Grab the search params and navigate function from TanStack Router
  const { action, eventId } = Route.useSearch();
  const navigate = Route.useNavigate();

  const [jobs, setJobs] = useState<EventJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- NEW STATES FOR POSTING EVENT JOBS ---
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);
  const [approvedEvents, setApprovedEvents] = useState<{id: number, name: string}[]>([]);

  const [formData, setFormData] = useState({
    title: "", type: "", shift: "", subCategory: "", location: "",
    qualification: "", experience: "", salary: "", vacancies: "",
    skills: "", description: "", responsibilities: "", eventId: ""
  });

  // 3. The magic hook to catch the URL parameters and open the modal
  useEffect(() => {
    if (action === 'openModal' && eventId) {
      // Open the modal
      setIsJobDialogOpen(true);
      // Pre-select the event in the form
      setFormData(prev => ({ ...prev, eventId: eventId }));
      
      // Clean up the URL so it doesn't get stuck in a loop if the user refreshes
      navigate({
        to: '/employer/event-jobs',
        search: {}, 
        replace: true
      });
    }
  }, [action, eventId, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Fetch approved events and existing event jobs from backend
  const fetchData = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const [eventsRes, stallsRes, jobsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/events`),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/employer/${userId}/event-stalls`),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/employer/${userId}/jobs-list`)
      ]);
      
      const eventsData = await eventsRes.json();
      const stallsData = await stallsRes.json();
      const jobsData = await jobsRes.json();

      let allEvents: any[] = [];
      if (eventsData.success) allEvents = eventsData.data;

      // 1. FILTER: Find events where the admin has explicitly "approved" the stall
      if (eventsData.success && stallsData.success) {
        const approvedStallEventIds = stallsData.data
          .filter((app: any) => app.status === 'approved')
          .map((app: any) => app.eventId);

        const appEvents = allEvents
          .filter((evt: any) => approvedStallEventIds.includes(evt.id))
          .map((evt: any) => ({ id: evt.id, name: evt.name }));
        
        setApprovedEvents(appEvents);
      }

      // 2. FETCH JOBS: Display only jobs tied to an event
      if (jobsData.success) {
         const eJobs = jobsData.data.filter((j: any) => j.event_id != null && j.event_id.toString() !== '0');
         const formattedJobs = eJobs.map((j: any) => {
            const evt = allEvents.find(e => e.id.toString() === j.event_id?.toString());
            return {
              id: j.id.toString(),
              title: j.title,
              type: j.job_type || 'Full-Time',
              shift: 'Day Shift', 
              subCategory: 'Open For All', 
              location: j.location,
              vacancies: j.vacancies?.toString() || "1",
              postedDate: j.created_at || new Date().toISOString(),
              status: j.status,
              eventName: evt ? evt.name : `Event ID: ${j.event_id}`
            };
         });
         setJobs(formattedJobs);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleJobSubmit = async () => {
    if (!formData.eventId || !formData.title || !formData.type || !formData.location) {
      toast.error("Please select an Event and fill in all required fields.");
      return;
    }

    setIsSubmittingJob(true);
    try {
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
          vacancies: formData.vacancies || "1",
          description: formData.description,
          event_id: formData.eventId // Ties the job strictly to the event
        })
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Event Job posted successfully!");
        setIsJobDialogOpen(false);
        setFormData({
          title: "", type: "", shift: "", subCategory: "", location: "",
          qualification: "", experience: "", salary: "", vacancies: "",
          skills: "", description: "", responsibilities: "", eventId: ""
        });
        fetchData(); // Refresh the list
      } else {
        toast.error(json.message || "Failed to post job.");
      }
    } catch (err) {
      toast.error("Server connection error while posting job.");
    } finally {
      setIsSubmittingJob(false);
    }
  };

  const handleCloseJob = (id: string) => {
    setJobs(jobs.map(job => job.id === id ? { ...job, status: "closed" } : job));
    toast.info("Event job has been closed locally.");
  };

  const handleRevokeJob = async (id: string) => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/employer/jobs/${id}/reactivate`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employerId: userId })
      });
      fetchData();
      toast.success("Event job reactivated!");
    } catch {
      toast.error("Failed to reactivate job");
    }
  };

  const handleDeleteJob = async (id: string) => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/employer/jobs/${id}`, { method: 'DELETE' });
      setJobs(jobs.filter(job => job.id !== id));
      toast.success("Event job deleted permanently.");
    } catch {
      toast.error("Failed to delete job");
    }
  };

  const sortedJobs = [...jobs].sort((a, b) => {
    if (a.status === b.status) {
      return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
    }
    return a.status === 'approved' ? -1 : 1;
  });

  return (
    <DashShell role="employer" nav={employerNav}>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-display font-bold text-navy flex items-center gap-2">
              <Tent className="h-6 w-6 text-saffron" /> Event Job Postings
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage jobs that are exclusively posted for approved Job Fairs and Events.
            </p>
          </div>

          {/* THE NEW POST JOB BUTTON & MODAL */}
          <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-saffron text-navy hover:bg-saffron/90 font-medium">
                <Plus className="h-4 w-4 mr-2" /> Post Event Job
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-display text-navy flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-saffron" /> Post Job for an Event
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid md:grid-cols-2 gap-4 py-4">
                <div className="md:col-span-2">
                  <Label>Select Event <span className="text-red-500">*</span></Label>
                  <Select value={formData.eventId} onValueChange={(v) => handleInputChange("eventId", v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select an approved event" />
                    </SelectTrigger>
                    <SelectContent>
                      {approvedEvents.length === 0 ? (
                        <div className="p-3 text-sm text-muted-foreground italic">No approved events available. Your stall must be approved first.</div>
                      ) : (
                        approvedEvents.map(evt => (
                          <SelectItem key={evt.id} value={evt.id.toString()}>{evt.name}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

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
        </div>

        <div className="bg-indigo-50 border border-indigo-100 text-indigo-800 px-4 py-3 rounded-lg text-sm flex items-start gap-3">
          <Tent className="h-5 w-5 shrink-0 mt-0.5" />
          <p>
            <strong>Note:</strong> Jobs listed here are attached to specific events. You can only post new event jobs if your stall allocation is approved by the BCC Admin.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-saffron" /></div>
        ) : (
          <div className="grid gap-4">
            {sortedJobs.map((job) => {
              const isClosed = job.status === "closed" || job.status === "rejected";

              return (
                <Card 
                  key={job.id} 
                  className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 ${
                    isClosed ? "bg-slate-50 border-slate-200 opacity-60 blur-[0.4px] hover:blur-none hover:opacity-100" : "bg-white border-border hover:border-navy/30 hover:shadow-md"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-display font-bold text-lg text-navy">{job.title}</h3>
                      {isClosed ? (
                        <Badge variant="secondary" className="bg-slate-200 text-slate-700">Closed</Badge>
                      ) : job.status === 'pending' ? (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200">Waiting for Approval</Badge>
                      ) : (
                        <Badge className="bg-india-green/10 text-india-green border-india-green/20">Active</Badge>
                      )}
                    </div>

                    <div className="inline-flex items-center text-xs font-semibold bg-navy/5 text-navy px-2 py-1 rounded-md border border-navy/10">
                       <Tent className="h-3.5 w-3.5 mr-1.5 text-saffron" /> {job.eventName}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground pt-1">
                      <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {job.type}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {job.shift}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {job.subCategory}</span>
                    </div>
                    
                    <div className="text-xs text-muted-foreground pt-1">
                      Posted: {new Date(job.postedDate).toLocaleDateString()} | Vacancies: {job.vacancies}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isClosed ? (
                      <>
                        <Button size="sm" variant="destructive" className="h-8" onClick={() => handleDeleteJob(job.id)}>
                          <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
                        </Button>
                        <Button size="sm" className="h-8 bg-india-green text-white hover:bg-india-green/90" onClick={() => handleRevokeJob(job.id)}>
                          <RefreshCcw className="h-3.5 w-3.5 mr-1.5" /> Reactivate
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="destructive" className="h-8" onClick={() => handleDeleteJob(job.id)}>
                          <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700" onClick={() => handleCloseJob(job.id)}>
                          <XCircle className="h-3.5 w-3.5 mr-1.5" /> Close
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              );
            })}
            
            {jobs.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed rounded-xl border-border">
                <Tent className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                <h3 className="font-medium text-navy">No Event Jobs found</h3>
                <p className="text-sm text-muted-foreground mt-1">You haven't posted any jobs for specific Job Fairs yet.</p>
                <p className="text-xs text-muted-foreground mt-2">Click 'Post Event Job' above to get started.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashShell>
  );
}
