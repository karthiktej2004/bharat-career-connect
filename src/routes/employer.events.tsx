import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { DashShell, PageHeader } from "@/components/DashShell";
import { employerNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
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
  Store,
  PartyPopper,
  Ticket,
  CalendarOff,
  Building2,
  Sparkles
} from "lucide-react";
import { getSession } from "@/lib/mockStore";
import { toast } from "sonner";

export const Route = createFileRoute("/employer/events")({
  head: () => ({ meta: [{ title: "Job Fair Participation — Bharat Career Connect" }] }),
  component: EmployerEvents,
});

// --- HELPER: TIME COUNTDOWN LOGIC ---
function getEventTiming(eventDateStr: string, eventStatus: string) {
  if (eventStatus === 'completed' || eventStatus === 'closed') return { text: 'Event Completed', type: 'past' };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eDate = new Date(eventDateStr);
  eDate.setHours(0, 0, 0, 0);
  
  const diffTime = eDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { text: 'Event Completed', type: 'past' };
  if (diffDays === 0) return { text: 'Happening Today!', type: 'urgent' };
  if (diffDays === 1) return { text: 'Tomorrow', type: 'soon' };
  if (diffDays <= 7) return { text: `${diffDays} days to go`, type: 'upcoming' };
  return { text: `${diffDays} days to go`, type: 'future' };
}

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
  
  // Modal States
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Application Form State
  const [vacancies, setVacancies] = useState("");
  const [expectedCount, setExpectedCount] = useState("");

  // Success Modal State
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successEventId, setSuccessEventId] = useState("");

  const fetchEventsData = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const [eventsRes, appsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/events`),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/employer/${userId}/event-stalls`)
      ]);
      const eventsJson = await eventsRes.json();
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

  const openApplyModal = (evt: any) => {
    setSelectedEvent(evt);
    setVacancies("");
    setExpectedCount("");
    setIsApplyModalOpen(true);
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !selectedEvent) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/employer/event-stalls/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          employerId: userId, 
          eventId: selectedEvent.id,
          vacancies,
          expectedCandidates: expectedCount
        })
      });
      const json = await res.json();
      if (json.success) {
        setIsApplyModalOpen(false);
        setSuccessEventId(`EVT-${selectedEvent.id.toString().padStart(6, '0')}`);
        setIsSuccessModalOpen(true); // Open Celebration Modal
        fetchEventsData();
      } else {
        toast.error(json.message || "Failed to submit stall application.");
      }
    } catch (err) {
      toast.error("Server connection error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter events into Active/Upcoming and Past/Completed (FIXED THIS LOGIC)
  const todayDate = new Date();
  todayDate.setHours(0,0,0,0);
  
  const activeEvents = events.filter(e => {
    const eDate = new Date(e.event_date);
    eDate.setHours(0,0,0,0);
    return e.status !== 'completed' && e.status !== 'closed' && eDate >= todayDate;
  });

  const pastEvents = events.filter(e => {
    const eDate = new Date(e.event_date);
    eDate.setHours(0,0,0,0);
    return e.status === 'completed' || e.status === 'closed' || eDate < todayDate;
  });

  return (
    <>
      <PageHeader
        title="Job Fair Participation"
        description="Apply for physical stalls, secure venue allocation, and manage your on-ground hiring presence."
      />

      {/* --- EVENT APPLICATION MODAL --- */}
      <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-navy">Apply for Event Stall</DialogTitle>
            <DialogDescription>
              Provide hiring estimates to secure your physical space at <strong className="text-navy">{selectedEvent?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleApplySubmit} className="space-y-4 py-3">
            <div>
              <Label className="text-navy font-semibold">Total Job Vacancies</Label>
              <Input 
                type="number" 
                required 
                placeholder="e.g. 15" 
                className="mt-1.5"
                value={vacancies}
                onChange={(e) => setVacancies(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1.5">How many open roles are you looking to fill at this event?</p>
            </div>
            <div>
              <Label className="text-navy font-semibold">Expected Candidate Walk-ins</Label>
              <Input 
                type="number" 
                required 
                placeholder="e.g. 150" 
                className="mt-1.5"
                value={expectedCount}
                onChange={(e) => setExpectedCount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1.5">Helps admin allocate the right stall size based on foot traffic.</p>
            </div>
            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 flex items-start gap-2 mt-2">
              <Store className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
              <p className="text-xs text-indigo-800 leading-relaxed">
                Upon submission, this will be sent for BCC Admin approval. Payment processing will be required before final stall allocation.
              </p>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsApplyModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-saffron text-navy hover:bg-saffron/90 font-bold">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Submit Application
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- SUCCESS CELEBRATION MODAL --- */}
      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent className="sm:max-w-md overflow-hidden bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-saffron/20 via-transparent to-india-green/10 -z-10" />
          <div className="text-center py-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-saffron to-india-green rounded-full flex items-center justify-center mb-4 shadow-lg animate-bounce">
              <PartyPopper className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-display font-bold text-navy mb-2">Application Successful!</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Your request for a physical stall has been sent to the BCC Admin. Once approved, you can proceed with the stall fee payment.
            </p>
            <div className="bg-white/80 backdrop-blur-sm border border-border/50 rounded-xl p-4 inline-block mx-auto shadow-sm">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-1">Official Event ID</p>
              <p className="text-xl font-mono font-bold text-navy flex items-center gap-2">
                <Ticket className="h-5 w-5 text-saffron" /> {successEventId}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsSuccessModalOpen(false)} className="w-full bg-navy text-white hover:bg-navy/90 font-bold">
              Got it, thanks!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {isLoading ? (
        <div className="flex justify-center p-16">
          <Loader2 className="h-8 w-8 animate-spin text-saffron" />
        </div>
      ) : (
        <div className="space-y-10 mt-6">
          
          {/* ACTIVE & UPCOMING EVENTS */}
          <div>
            <h2 className="text-lg font-display font-bold text-navy mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-saffron" /> Upcoming Job Fairs
            </h2>
            {activeEvents.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground border-dashed bg-slate-50">No upcoming events scheduled right now.</Card>
            ) : (
              <div className="grid lg:grid-cols-2 gap-6">
                {activeEvents.map((evt) => (
                  <EventCard 
                    key={evt.id} 
                    evt={evt} 
                    myApplications={myApplications} 
                    onApply={openApplyModal} 
                  />
                ))}
              </div>
            )}
          </div>

          {/* PAST & COMPLETED EVENTS */}
          {pastEvents.length > 0 && (
            <div>
              <Separator className="mb-8" />
              <h2 className="text-lg font-display font-bold text-slate-400 mb-4 flex items-center gap-2">
                <CalendarOff className="h-5 w-5" /> Past Event History
              </h2>
              <div className="grid lg:grid-cols-2 gap-6 opacity-75 grayscale-[0.3] hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                {pastEvents.map((evt) => (
                  <EventCard 
                    key={evt.id} 
                    evt={evt} 
                    myApplications={myApplications} 
                    onApply={openApplyModal} 
                    isPast={true}
                  />
                ))}
              </div>
            </div>
          )}
          
        </div>
      )}
    </>
  );
}

// --- REUSABLE EVENT CARD COMPONENT ---
function EventCard({ evt, myApplications, onApply, isPast = false }: { evt: any, myApplications: any[], onApply: (evt: any) => void, isPast?: boolean }) {
  const userApp = myApplications.find(a => a.eventId === evt.id);
  const status = userApp ? userApp.status : null;
  const isAllocated = Boolean(userApp?.allocatedStall || userApp?.stallNo);
  
  // Physical Stall Details
  const stallCode = userApp?.allocatedStall || userApp?.stallNo || "TBD";
  const hallName = userApp?.hall || "Main IT Hall";
  const floorName = userApp?.floor || "Ground Floor";
  const blockName = userApp?.block || "Block-A";

  const mapsUrl = evt.google_maps_link || `https://maps.google.com/?q=${encodeURIComponent(`${evt.venue_address || ""}, ${evt.city || ""}`)}`;
  const timing = getEventTiming(evt.event_date, evt.status);

  // Dynamic Tailwind colors based on timing urgency
  const timingStyles: Record<string, string> = {
    urgent: "bg-red-100 text-red-700 animate-pulse border-red-200",
    soon: "bg-orange-100 text-orange-800 border-orange-200",
    upcoming: "bg-blue-100 text-blue-700 border-blue-200",
    future: "bg-slate-100 text-slate-700 border-slate-200",
    past: "bg-slate-100 text-slate-500 border-slate-200"
  };

  return (
    <Card className={`p-6 border-border/60 flex flex-col justify-between shadow-sm relative overflow-hidden bg-white hover:border-saffron/40 transition-colors ${isPast ? 'bg-slate-50' : ''}`}>
      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="uppercase text-[10px] tracking-widest bg-slate-100 text-navy font-semibold border-slate-200">
                {evt.event_type || "Physical"}
              </Badge>
              <Badge className={`uppercase text-[10px] font-bold ${timingStyles[timing.type]}`}>
                {timing.text}
              </Badge>
            </div>
            <h3 className={`font-display font-bold text-xl ${isPast ? 'text-slate-600' : 'text-navy'}`}>{evt.name}</h3>
          </div>

          {/* RIGHT SIDE BADGES */}
          {status === 'approved' && isAllocated && !isPast && (
            <Badge className="bg-india-green/15 text-india-green gap-1 shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5" /> Stall Allocated
            </Badge>
          )}
          {status === 'approved' && !isAllocated && !isPast && (
            <Badge className="bg-blue-50/80 border border-blue-200 text-blue-700 gap-1 font-medium shrink-0">
              <Clock className="h-3.5 w-3.5" /> Waiting for Allocation
            </Badge>
          )}
          {status === 'pending' && !isPast && (
            <Badge className="bg-saffron/10 border border-saffron/30 text-amber-800 gap-1 font-medium shrink-0">
              <Clock className="h-3.5 w-3.5" /> Pending BCC Approval
            </Badge>
          )}
        </div>

        <div className="space-y-2.5 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <CalendarDays className={`h-4 w-4 shrink-0 ${isPast ? 'text-slate-400' : 'text-saffron'}`} />
            <span className="font-medium">{new Date(evt.event_date).toLocaleDateString("en-IN", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className={`h-4 w-4 shrink-0 ${isPast ? 'text-slate-400' : 'text-saffron'}`} />
            <span className="font-medium">{evt.city || "Venue TBD"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className={`h-4 w-4 shrink-0 ${isPast ? 'text-slate-400' : 'text-saffron'}`} />
            <span className="font-medium">Capacity: {evt.employer_capacity || 50} Employer Stalls</span>
          </div>
        </div>

        {/* --- ALLOCATED PHYSICAL STALL TICKET --- */}
        {status === 'approved' && isAllocated && !isPast && (
          <div className="relative p-4 my-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 overflow-hidden shadow-inner">
            <div className="absolute top-0 right-0 p-8 bg-white/40 rounded-bl-full -mr-4 -mt-4" />
            
            <div className="flex items-center gap-2 mb-3">
              <Store className="h-5 w-5 text-emerald-600" />
              <h4 className="font-bold text-emerald-900">Your Physical Stall</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
              <div>
                <p className="text-[10px] text-emerald-600/80 uppercase font-bold tracking-wider mb-0.5">Stall ID</p>
                <p className="font-mono font-bold text-emerald-950 text-base">{stallCode}</p>
              </div>
              <div>
                <p className="text-[10px] text-emerald-600/80 uppercase font-bold tracking-wider mb-0.5">Location</p>
                <p className="font-semibold text-emerald-950">{blockName} • {floorName}</p>
                <p className="text-xs text-emerald-700">{hallName}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-emerald-200/60 mt-1">
              <div className="text-xs font-medium text-emerald-800">
                <p className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> {evt.venue_address || `${evt.city} Job Fair Ground`}</p>
              </div>
              <a 
                href={mapsUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-md font-bold transition-colors shadow-sm shrink-0"
              >
                <Map className="h-3.5 w-3.5" /> Open Maps
              </a>
            </div>
            
            {/* Future Placeholder for Attendance System */}
            <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/80 px-2 py-1 rounded text-[10px] font-bold text-emerald-700 border border-emerald-200/50 backdrop-blur-sm">
              <Clock className="h-3 w-3" /> Awaiting Check-In
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3 pt-4 border-t border-border/40 mt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium">
            Stall Fee: <strong className="text-navy text-sm">₹{evt.stall_price || 0}</strong>
          </span>
        </div>

        {/* DYNAMIC ACTION BUTTON FLOW */}
        <div className="flex items-center justify-end gap-2">
          {isPast ? (
            <Button variant="outline" disabled className="w-full bg-slate-100 text-slate-400 border-slate-200">
              Event Concluded
            </Button>
          ) : !status ? (
            <Button 
              onClick={() => onApply(evt)} 
              className="bg-saffron text-navy hover:bg-saffron/90 font-bold w-full shadow-sm"
            >
              Apply for Stall
            </Button>
          ) : status === 'approved' ? (
            <Button 
              onClick={() => window.location.href = `/employer/event-jobs?action=openModal&eventId=${evt.id}`} 
              className="bg-navy text-white hover:bg-navy/90 font-semibold w-full gap-1.5 shadow-sm"
            >
              <Plus className="h-4 w-4" /> Post Job for this Event
            </Button>
          ) : status === 'pending' ? (
            <Button disabled className="w-full bg-slate-100 text-slate-500 font-semibold border border-slate-200">
              Application Under Review
            </Button>
          ) : (
            <Button variant="outline" disabled className="w-full border-red-200 text-red-500 bg-red-50">
              Application {status}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
