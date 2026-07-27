import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { DashShell, PageHeader } from "@/components/DashShell";
import { employerNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Users, CheckCircle2, Clock, AlertCircle, Loader2, Plus, Briefcase, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getSession } from "@/lib/mockStore";
import { toast } from "sonner";

export const Route = createFileRoute("/employer/events")({
  head: () => ({ meta: [{ title: "Job Fair Participation — Bharat Career Connect" }] }),
  component: EmployerEvents,
});

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

  // Modal state for viewing participating companies and roles irrespective of application
  const [viewingEvent, setViewingEvent] = useState<any | null>(null);
  const [eventJobs, setEventJobs] = useState<any[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);

  const fetchEventsData = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const eventsRes = await fetch("https://bcc-backend-0cny.onrender.com/api/admin/events");
      const eventsJson = await eventsRes.json();

      const appsRes = await fetch(`https://bcc-backend-0cny.onrender.com/api/employer/${userId}/event-stalls`);
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
      const res = await fetch(`https://bcc-backend-0cny.onrender.com/api/employer/event-stalls/apply`, {
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

  const handleViewParticipatingRoles = async (evt: any) => {
    setViewingEvent(evt);
    setIsLoadingJobs(true);
    try {
      const res = await fetch(`https://bcc-backend-0cny.onrender.com/api/events/${evt.id}/jobs`);
      const json = await res.json();
      if (json.success) setEventJobs(json.data);
    } catch (err) {
      toast.error("Failed to load event roles.");
    } finally {
      setIsLoadingJobs(false);
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
                        <CheckCircle2 className="h-3.5 w-3.5" /> Stall Approved
                      </Badge>
                    )}
                    {status === 'pending' && (
                      <Badge className="bg-saffron/15 text-saffron gap-1">
                        <Clock className="h-3.5 w-3.5" /> Pending Approval
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

                <div className="space-y-3 pt-4 border-t border-border/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">
                      Stall Fee: <strong className="text-navy">₹{evt.stall_price || 0}</strong>
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => handleViewParticipatingRoles(evt)} className="text-navy hover:bg-slate-100 text-xs">
                      <Eye className="h-3.5 w-3.5 mr-1" /> View Hiring Companies
                    </Button>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    {!status ? (
                      <Button 
                        disabled={applyingEventId === evt.id}
                        onClick={() => handleApplyForStall(evt.id)} 
                        className="bg-saffron text-navy hover:bg-saffron/90 font-semibold w-full"
                      >
                        {applyingEventId === evt.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                        Apply for Stall
                      </Button>
                    ) : status === 'approved' ? (
                      <Button onClick={() => window.location.href = `/employer/jobs?eventId=${evt.id}`} className="bg-saffron text-navy hover:bg-saffron/90 font-semibold w-full gap-1">
                        <Plus className="h-4 w-4" /> Post Job for this Event
                      </Button>
                    ) : (
                      <Button variant="outline" disabled className="w-full">
                        Application Under Review
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* MODAL TO VIEW PARTICIPATING COMPANIES AND ROLES FOR AN EVENT */}
      <Dialog open={!!viewingEvent} onOpenChange={(o) => !o && setViewingEvent(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-navy">
              <Briefcase className="h-5 w-5 text-saffron" /> Companies Hiring at {viewingEvent?.name}
            </DialogTitle>
            <DialogDescription>
              Explore all active open roles published by participating companies for this job fair.
            </DialogDescription>
          </DialogHeader>

          {isLoadingJobs ? (
            <div className="py-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-saffron" /></div>
          ) : eventJobs.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No companies have published approved jobs for this event yet.
            </div>
          ) : (
            <div className="space-y-3 mt-3">
              {eventJobs.map((j) => (
                <Card key={j.id} className="p-4 border-border/60 bg-slate-50 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-navy text-base">{j.title}</h4>
                      <Badge variant="outline" className="bg-white text-xs">{j.job_type}</Badge>
                    </div>
                    <p className="text-sm font-semibold text-saffron">{j.company_name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {j.location} · CTC: {j.salary_range || "Negotiable"}
                    </p>
                    {j.skills_required && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(typeof j.skills_required === 'string' ? JSON.parse(j.skills_required) : j.skills_required).map((s: string) => (
                          <span key={s} className="text-[10px] bg-white border px-2 py-0.5 rounded text-navy">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
