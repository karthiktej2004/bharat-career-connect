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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Briefcase, Pencil, Trash2, Clock, Loader2, CalendarDays, RefreshCw } from "lucide-react";
import { getSession } from "@/lib/mockStore";
import { toast } from "sonner";

export const Route = createFileRoute("/employer/jobs")({
  head: () => ({ meta: [{ title: "Job Postings — Bharat Career Connect" }] }),
  component: Jobs,
});

function Jobs() {
  return (
    <DashShell role="employer" nav={employerNav}>
      <JobsBody />
    </DashShell>
  );
}

export function JobsBody() {
  const user = getSession();
  const userId = user?.id; 

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleting, setDeleting] = useState<any | null>(null);
  
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-open modal if URL has ?eventId=
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("eventId")) {
      setOpen(true);
    }
  }, []);

  const fetchJobs = useCallback(() => {
    if (!userId) return;
    setIsLoading(true);
    fetch(`https://bcc-backend-0cny.onrender.com/api/employer/${userId}/jobs-list`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setJobs(json.data);
      })
      .catch((err) => console.error("Error fetching jobs:", err))
      .finally(() => setIsLoading(false));
  }, [userId]); 

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      const res = await fetch(`https://bcc-backend-0cny.onrender.com/api/employer/jobs/${deleting.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`"${deleting.title}" deleted permanently.`);
        fetchJobs(); 
      } else {
        toast.error("Failed to delete job.");
      }
    } catch (error) {
      toast.error("Server connection error.");
    } finally {
      setDeleting(null);
    }
  };

  const handleReactivate = async (job: any) => {
    if (!userId) return;
    try {
      const res = await fetch(`https://bcc-backend-0cny.onrender.com/api/employer/jobs/${job.id}/reactivate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employerId: userId })
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`"${job.title}" reactivated successfully and moved to the top of the feed!`);
        fetchJobs();
      } else {
        toast.error(json.message || "Failed to reactivate job.");
      }
    } catch (error) {
      toast.error("Server connection error during reactivation.");
    }
  };

  return (
    <>
      <PageHeader
        title="Job Postings"
        description="Manage every job you've posted. New jobs are sent to the admin for approval before candidates can see them."
        action={
          <Button className="bg-saffron text-navy hover:bg-saffron/90" onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" />Post a Job
          </Button>
        }
      />
      
      <Card className="border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Vacancies</TableHead>
              <TableHead>Posted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-saffron" />
                  Loading your jobs...
                </TableCell>
              </TableRow>
            ) : jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                  You haven't posted any jobs yet.
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((j) => {
                const approval = j.status; 
                
                return (
                  <TableRow key={j.id}>
                    <TableCell className="font-medium text-navy">
                      <div>{j.title}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{user?.name}</div>
                      {j.event_id && (
                        <Badge variant="outline" className="mt-1 bg-blue-50 text-blue-700 border-blue-200 text-[10px] py-0 leading-none">
                          <CalendarDays className="h-3 w-3 mr-1 inline" /> Event Job
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell><Badge variant="outline">{j.job_type}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{j.location}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{j.experience_required || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{j.salary_range || "—"}</TableCell>
                    <TableCell>{j.vacancies || 1}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(j.created_at).toLocaleDateString("en-IN")}</TableCell>
                    <TableCell>
                      <Badge className={`gap-1 ${approval === "approved" ? "bg-india-green/15 text-india-green" : approval === "rejected" ? "bg-destructive/15 text-destructive" : approval === "inactive" || approval === "closed" || approval === "deactivated" ? "bg-gray-100 text-gray-500" : "bg-saffron/15 text-saffron"}`}>
                        {approval === "pending" && <Clock className="h-3 w-3" />}
                        {approval === "approved" ? "Approved" : approval === "rejected" ? "Rejected" : approval === "inactive" || approval === "closed" || approval === "deactivated" ? "Inactive" : "Pending approval"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {approval !== "approved" && (
                          <Button size="sm" variant="outline" className="text-india-green border-india-green/40 hover:bg-india-green/10" onClick={() => handleReactivate(j)}>
                            <RefreshCw className="h-3.5 w-3.5 mr-1" />Reactivate
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => { setEditing(j); setOpen(true); }}>
                          <Pencil className="h-3.5 w-3.5 mr-1" />Edit
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={() => setDeleting(j)}>
                          <Trash2 className="h-3.5 w-3.5 mr-1" />Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <PostJobDialog 
        open={open} 
        onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }} 
        editJob={editing} 
        user={user}
        onSuccess={fetchJobs} 
      />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this job?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleting?.title}" will be removed permanently. Candidates who already applied will no longer see it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function PostJobDialog({ open, onOpenChange, editJob, user, onSuccess }: { open: boolean; onOpenChange: (o: boolean) => void; editJob?: any | null; user: any; onSuccess: () => void }) {
  const empty = { title: "", type: "Full-time", location: "", qualification: "", experience: "", salary: "", skills: "", openings: "1", description: "", eventId: "none" };
  const [form, setForm] = useState(empty);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableEvents, setAvailableEvents] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      fetch("https://bcc-backend-0cny.onrender.com/api/admin/events")
        .then((res) => res.json())
        .then((json) => {
          if (json.success) {
            setAvailableEvents(json.data.filter((e: any) => e.status !== "hold" && e.status !== "Deleted"));
          }
        })
        .catch((err) => console.error("Error fetching events:", err));
    }

    const params = new URLSearchParams(window.location.search);
    const urlEventId = params.get("eventId");

    if (editJob) {
      setForm({
        title: editJob.title || "",
        type: editJob.job_type || "Full-time",
        location: editJob.location || "",
        qualification: editJob.qualification_required || "",
        experience: editJob.experience_required || "",
        salary: editJob.salary_range || "",
        skills: editJob.skills_required && typeof editJob.skills_required === 'string' 
          ? JSON.parse(editJob.skills_required).join(", ") 
          : "",
        openings: editJob.vacancies ? editJob.vacancies.toString() : "1",
        description: editJob.description || "", 
        eventId: editJob.event_id ? editJob.event_id.toString() : (urlEventId || "none")
      });
    } else {
      setForm({ ...empty, eventId: urlEventId || "none" });
    }
  }, [editJob, open]);

  function upd<K extends keyof typeof form>(k: K, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.location) { toast.error("Please fill required fields"); return; }
    if (!user) return;

    setIsSubmitting(true);
    
    const payload = {
      employerId: user.id,
      title: form.title,
      jobType: form.type,
      location: form.location,
      qualification: form.qualification || "Any",
      experience: form.experience || "Fresher",
      salary: form.salary || "Negotiable",
      vacancies: parseInt(form.openings) || 1,
      skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      description: form.description,
      event_id: form.eventId !== "none" ? parseInt(form.eventId) : null,
    };

    try {
      const url = editJob 
        ? `https://bcc-backend-0cny.onrender.com/api/employer/jobs/${editJob.id}` 
        : `https://bcc-backend-0cny.onrender.com/api/employer/${user.id}/jobs`;
      const method = editJob ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const json = await res.json();
      
      if (json.success) {
        toast.success(editJob ? `"${form.title}" updated` : `"${form.title}" submitted successfully`);
        onSuccess(); 
        onOpenChange(false);
      } else {
        toast.error(json.message || "Something went wrong.");
      }
    } catch (error) {
      toast.error("Failed to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-saffron" /> {editJob ? "Edit job" : "Post a new job"}</DialogTitle>
          <DialogDescription>{editJob ? "Modify the job details." : "Fill in the details for your job posting."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
          
          <div className="sm:col-span-2 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
            <Label className="text-blue-800 font-semibold flex items-center gap-2">
              <CalendarDays className="h-4 w-4" /> Link to Udyoga Mela (Optional)
            </Label>
            <p className="text-xs text-blue-600/80 mb-2 mt-0.5">If you are hiring for an upcoming job fair, select it here so candidates can find you.</p>
            <Select value={form.eventId} onValueChange={(v) => upd("eventId", v)}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Standard Job Posting (No Event)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="font-medium">Standard Job Posting (No Event)</SelectItem>
                {availableEvents.map(evt => (
                  <SelectItem key={evt.id} value={evt.id.toString()}>
                    {evt.name} ({new Date(evt.event_date).toLocaleDateString("en-IN")})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2"><Label>Job Title *</Label><Input required value={form.title} onChange={(e) => upd("title", e.target.value)} placeholder="Junior Software Engineer" className="mt-1" /></div>
          <div><Label>Employment Type</Label>
            <Select value={form.type} onValueChange={(v) => upd("type", v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Internship">Internship</SelectItem>
                <SelectItem value="Apprenticeship">Apprenticeship</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Location *</Label><Input required value={form.location} onChange={(e) => upd("location", e.target.value)} placeholder="Bengaluru" className="mt-1" /></div>
          <div><Label>Qualification</Label><Input value={form.qualification} onChange={(e) => upd("qualification", e.target.value)} placeholder="BE/B-Tech" className="mt-1" /></div>
          <div><Label>Experience</Label><Input value={form.experience} onChange={(e) => upd("experience", e.target.value)} placeholder="0-2 yr" className="mt-1" /></div>
          <div><Label>CTC / Stipend</Label><Input value={form.salary} onChange={(e) => upd("salary", e.target.value)} placeholder="₹4.2 LPA" className="mt-1" /></div>
          <div><Label>Vacancies</Label><Input type="number" min="1" value={form.openings} onChange={(e) => upd("openings", e.target.value)} className="mt-1" /></div>
          
          <div className="sm:col-span-2"><Label>Skills (comma separated)</Label><Input value={form.skills} onChange={(e) => upd("skills", e.target.value)} placeholder="Java, SQL, REST APIs" className="mt-1" /></div>
          <div className="sm:col-span-2"><Label>Job Description</Label><Textarea rows={4} value={form.description} onChange={(e) => upd("description", e.target.value)} placeholder="Responsibilities, must-haves, benefits…" className="mt-1" /></div>
          <DialogFooter className="sm:col-span-2 mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-saffron text-navy hover:bg-saffron/90">
              {isSubmitting ? "Saving..." : (editJob ? "Save changes" : "Submit Job")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
