import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Briefcase, MapPin, Edit, Trash2, XCircle, RefreshCcw, Plus, Clock, Users } from 'lucide-react'
import { DashShell } from '@/components/DashShell'
import { employerNav } from '@/lib/dashNav'

export const Route = createFileRoute('/employer/jobs')({
  component: EmployerJobsPage,
})

const EMPLOYMENT_TYPES = [
  "Trainee", "Intern", "Apprentice", "Full-Time", "Part-Time", 
  "Contractor", "Freelancer", "Volunteer", "Consultant", "Vendor", "Contracter"
];

const PREFERRED_SHIFTS = [
  "Day Shift", "Night shift", "Remote", "Hybrid", "On-Site", "Rotational"
];

const SUB_CATEGORIES = [
  "Open For All", "Male Only", "Female Only", "PWD", 
  "Widow", "LGBTQ", "Senior Citizens", "Veterans"
];

type JobStatus = 'open' | 'closed';

type Job = {
  id: string;
  title: string;
  type: string;
  shift: string;
  subCategory: string;
  location: string;
  vacancies: string;
  postedDate: string;
  status: JobStatus;
};

function EmployerJobsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: "1",
      title: "Senior Full Stack Developer",
      type: "Full-Time",
      shift: "Day Shift",
      subCategory: "Open For All",
      location: "Bengaluru",
      vacancies: "2",
      postedDate: new Date().toISOString(),
      status: "open"
    },
    {
      id: "2",
      title: "UI UX Designer",
      type: "Contractor",
      shift: "Hybrid",
      subCategory: "Open For All",
      location: "Bengaluru",
      vacancies: "1",
      postedDate: new Date(Date.now() - 86400000).toISOString(),
      status: "closed"
    }
  ]);

  const [formData, setFormData] = useState({
    title: "",
    type: "",
    shift: "",
    subCategory: "",
    location: "",
    qualification: "",
    experience: "",
    salary: "",
    vacancies: "",
    skills: "",
    description: "",
    responsibilities: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleJobSubmit = () => {
    if (!formData.title || !formData.type || !formData.location) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const newJob: Job = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.title,
      type: formData.type,
      shift: formData.shift || "Day Shift",
      subCategory: formData.subCategory || "Open For All",
      location: formData.location,
      vacancies: formData.vacancies || "1",
      postedDate: new Date().toISOString(),
      status: "open"
    };

    setJobs([newJob, ...jobs]);
    setIsDialogOpen(false);
    toast.success("Job posted successfully!");
    setFormData({
      title: "", type: "", shift: "", subCategory: "", location: "",
      qualification: "", experience: "", salary: "", vacancies: "",
      skills: "", description: "", responsibilities: ""
    });
  };

  const handleCloseJob = (id: string) => {
    setJobs(jobs.map(job => job.id === id ? { ...job, status: "closed" } : job));
    toast.info("Job has been closed.");
  };

  const handleRevokeJob = (id: string) => {
    setJobs(jobs.map(job => job.id === id ? { ...job, status: "open", postedDate: new Date().toISOString() } : job));
    toast.success("Job reactivated with updated posting date!");
  };

  const handleDeleteJob = (id: string) => {
    setJobs(jobs.filter(job => job.id !== id));
    toast.success("Job deleted permanently.");
  };

  // Sort jobs: Open jobs first, closed jobs at the bottom
  const sortedJobs = [...jobs].sort((a, b) => {
    if (a.status === b.status) {
      return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
    }
    return a.status === 'open' ? -1 : 1;
  });

return (
    <DashShell role="employer" nav={employerNav}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-display font-bold text-navy">Job Postings</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your regular job listings and applicants.</p>
          </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-saffron text-navy hover:bg-saffron/90 font-medium">
              <Plus className="h-4 w-4 mr-2" /> Post a new job
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-display text-navy flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-saffron" /> Post a new job
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
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleJobSubmit} className="bg-saffron text-navy hover:bg-saffron/90">Submit Job</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {sortedJobs.map((job) => {
          const isClosed = job.status === "closed";

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
                  {isClosed && <Badge variant="secondary" className="bg-slate-200 text-slate-700">Closed</Badge>}
                  {!isClosed && <Badge className="bg-india-green/10 text-india-green border-india-green/20">Active</Badge>}
                </div>
                
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {job.type}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {job.shift}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {job.subCategory}</span>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Posted: {new Date(job.postedDate).toLocaleDateString()} | Vacancies: {job.vacancies}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isClosed ? (
                  <>
                    <Button size="sm" variant="outline" className="h-8">
                      <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit
                    </Button>
                    <Button size="sm" variant="destructive" className="h-8" onClick={() => handleDeleteJob(job.id)}>
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
                    </Button>
                    <Button size="sm" className="h-8 bg-india-green text-white hover:bg-india-green/90" onClick={() => handleRevokeJob(job.id)}>
                      <RefreshCcw className="h-3.5 w-3.5 mr-1.5" /> Revoke
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="outline" className="h-8">
                      <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit
                    </Button>
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
            <Briefcase className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
            <h3 className="font-medium text-navy">No jobs posted yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Click the button above to create your first job posting.</p>
          </div>
        )}
      </div>
    </div>
  );
}
