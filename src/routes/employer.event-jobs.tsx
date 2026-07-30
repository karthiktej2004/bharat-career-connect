import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { DashShell } from '@/components/DashShell'
import { employerNav } from '@/lib/dashNav'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Briefcase, MapPin, Edit, Trash2, XCircle, RefreshCcw, Clock, Users, Tent } from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/employer/event-jobs')({
  component: EmployerEventJobsPage,
})

type JobStatus = 'open' | 'closed' | 'pending';

type EventJob = {
  id: string;
  title: string;
  type: string;
  shift: string;
  subCategory: string;
  location: string;
  vacancies: string;
  postedDate: string;
  status: JobStatus;
  eventName: string; // Specific to Event Jobs
};

function EmployerEventJobsPage() {
  // In a real scenario, you will fetch these from your backend 
  // filtering where event_id IS NOT NULL
  const [jobs, setJobs] = useState<EventJob[]>([
    {
      id: "evt-1",
      title: "Field Sales Executive",
      type: "Full-Time",
      shift: "Day Shift",
      subCategory: "Open For All",
      location: "Bengaluru",
      vacancies: "15",
      postedDate: new Date().toISOString(),
      status: "open",
      eventName: "Bengaluru Mega Udyoga Mela 2024"
    }
  ]);

  const handleCloseJob = (id: string) => {
    setJobs(jobs.map(job => job.id === id ? { ...job, status: "closed" } : job));
    toast.info("Event job has been closed.");
  };

  const handleRevokeJob = (id: string) => {
    setJobs(jobs.map(job => job.id === id ? { ...job, status: "open", postedDate: new Date().toISOString() } : job));
    toast.success("Event job reactivated!");
  };

  const handleDeleteJob = (id: string) => {
    setJobs(jobs.filter(job => job.id !== id));
    toast.success("Event job deleted permanently.");
  };

  const sortedJobs = [...jobs].sort((a, b) => {
    if (a.status === b.status) {
      return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
    }
    return a.status === 'open' ? -1 : 1;
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
        </div>

        {/* Info Banner for requirements */}
        <div className="bg-indigo-50 border border-indigo-100 text-indigo-800 px-4 py-3 rounded-lg text-sm flex items-start gap-3">
          <Tent className="h-5 w-5 shrink-0 mt-0.5" />
          <p>
            <strong>Note:</strong> Jobs listed here are attached to specific events. You can only post new event jobs directly from the <strong>Job Fairs</strong> page once your stall allocation is approved by the BCC Admin.
          </p>
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
                    {isClosed ? (
                      <Badge variant="secondary" className="bg-slate-200 text-slate-700">Closed</Badge>
                    ) : job.status === 'pending' ? (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200">Waiting for Approval</Badge>
                    ) : (
                      <Badge className="bg-india-green/10 text-india-green border-india-green/20">Active</Badge>
                    )}
                  </div>

                  {/* Event Name Tag */}
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
                      <Button size="sm" variant="outline" className="h-8">
                        <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit
                      </Button>
                      <Button size="sm" variant="destructive" className="h-8" onClick={() => handleDeleteJob(job.id)}>
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
                      </Button>
                      <Button size="sm" className="h-8 bg-india-green text-white hover:bg-india-green/90" onClick={() => handleRevokeJob(job.id)}>
                        <RefreshCcw className="h-3.5 w-3.5 mr-1.5" /> Reactivate
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
              <Tent className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
              <h3 className="font-medium text-navy">No Event Jobs found</h3>
              <p className="text-sm text-muted-foreground mt-1">You haven't posted any jobs for specific Job Fairs yet.</p>
              <p className="text-xs text-muted-foreground mt-2">Go to the Job Fairs tab to apply for stalls and post event jobs.</p>
            </div>
          )}
        </div>
      </div>
    </DashShell>
  );
}
