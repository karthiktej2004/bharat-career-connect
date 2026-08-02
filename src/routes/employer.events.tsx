import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { DashShell, PageHeader } from "@/components/DashShell";
import { employerNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays, 
  MapPin, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Loader2, 
  Plus, 
  Map, 
  Store 
} from "lucide-react";
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
            const isAllocated = Boolean(userApp?.allocatedStall || userApp?.stallNo);
            const stallCode = userApp?.allocatedStall || userApp?.stallNo;
            const hallName = userApp?.hall || "Main IT Hall";
            const floorName = userApp?.floor || "1st Floor";
            const blockName = userApp?.block || "Block-A";

            const mapsUrl = evt.google_maps_link || 
              `https://maps.google.com/?q=${encodeURIComponent(`${evt.venue_address || ""}, ${evt.city || "Hubballi"}`)}`;

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

                    {/* STATUS BADGES */}
                    {status === 'approved' && isAllocated && (
                      <Badge className="bg-india-green/15 text-india-green gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Stall Allocated
                      </Badge>
                    )}
                    {status === 'approved' && !isAllocated && (
                      <Badge className="bg-blue-500/15 text-blue-700 gap-1 font-medium">
                        <Clock className="h-3.5 w-3.5" /> Event approved - Waiting for stall allocation
                      </Badge>
                    )}
                    {status === 'pending' && (
                      <Badge className="bg-saffron/20 text-amber-800 gap-1 font-medium">
                        <Clock className="h-3.5 w-3.5" /> Waiting for BCC approval
                      </Badge>
                    )}
                    {status === 'rejected' && (
                      <Badge className="bg-destructive/15 text-destructive gap-1">
                        <AlertCircle className="h-3.5 w-3.5" /> Rejected
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
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

                  {/* 3.1 & 3.2: ALLOCATED STALL & GOOGLE MAPS VENUE DETAIL CARD */}
                  {status === 'approved' && isAllocated && (
                    <div className="p-3 my-3 rounded-lg bg-emerald-50/70 border border-emerald-200/80 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 font-semibold text-emerald-900">
                        <Store className="h-4 w-4 text-emerald-700" />
                        <span>Allocated Stall: {stallCode} ({hallName}, {floorName}, {blockName})</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground pt-1 border-t border-emerald-200/60">
                        <span className="truncate max-w-[200px]">{evt.venue_address || `${evt.city} Job Fair Ground`}</span>
                        <a 
                          href={mapsUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-navy font-semibold hover:underline shrink-0"
                        >
                          <Map className="h-3.5 w-3.5 text-saffron" />
                          View on Google Maps
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-4 border-t border-border/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">
                      Stall Fee: <strong className="text-navy">₹{evt.stall_price || 0}</strong>
                    </span>
                  </div>

                  {/* DYNAMIC ACTION BUTTON FLOW */}
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
                      <Button 
                        onClick={() => window.location.href = `/employer/event-jobs?action=openModal&eventId=${evt.id}`} 
                        className="bg-saffron text-navy hover:bg-saffron/90 font-semibold w-full gap-1"
                      >
                        <Plus className="h-4 w-4" /> Post Job for this Event
                      </Button>
                    ) : status === 'pending' ? (
                      <Button disabled className="w-full bg-saffron/80 text-navy font-semibold opacity-90">
                        Waiting for BCC approval
                      </Button>
                    ) : (
                      <Button variant="outline" disabled className="w-full">
                        Application {status}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
