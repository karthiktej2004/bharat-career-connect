import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { DashShell, PageHeader } from "@/components/DashShell";
import { employerNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Users, CheckCircle2, Clock, AlertCircle, Loader2, Plus } from "lucide-react";
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
              <Card key={evt.id} className="p-6 border-border/60 flex flex-col justify-between shadow-sm relative overflow-hidden">
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

                <div className="pt-4 border-t border-border/40 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs text-muted-foreground font-medium">
                    Stall Fee: <strong className="text-navy">₹{evt.stall_price || 0}</strong>
                  </span>

                  {!status ? (
                    <Button 
                      disabled={applyingEventId === evt.id}
                      onClick={() => handleApplyForStall(evt.id)} 
                      className="bg-saffron text-navy hover:bg-saffron/90 font-semibold"
                    >
                      {applyingEventId === evt.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                      Apply for Stall
                    </Button>
                  ) : status === 'approved' ? (
                    <div className="flex gap-2">
                      <Button onClick={() => window.location.href = `/employer/jobs?eventId=${evt.id}`} className="bg-saffron text-navy hover:bg-saffron/90 font-semibold gap-1">
                        <Plus className="h-4 w-4" /> Post Job for this Event
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" disabled>
                      Application Under Review
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
          {events.length === 0 && (
            <div className="col-span-2 text-center py-12 text-muted-foreground">
              No active job fair events available right now.
            </div>
          )}
        </div>
      )}
    </>
  );
}
