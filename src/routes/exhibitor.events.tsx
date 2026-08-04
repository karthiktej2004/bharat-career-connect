import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DashShell, PageHeader } from "@/components/DashShell";
import { exhibitorNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getSession } from "@/lib/mockStore";
import { Calendar, MapPin, IndianRupee, Loader2, Store, CheckCircle2, Clock, Image as ImageIcon } from "lucide-react";

export const Route = createFileRoute("/exhibitor/events")({
  head: () => ({ meta: [{ title: "Events — Exhibitor Panel" }] }),
  component: ExhibitorEvents,
});

function ExhibitorEvents() {
  const user = getSession();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchEvents = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/exhibitor/${user.id}/events`);
      const json = await res.json();
      if (json.success) setEvents(json.data);
    } catch (error) {
      toast.error("Failed to load events.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user?.id]);

  const handleApplyStall = async (eventId: number) => {
    if (!confirm("Do you want to apply for a stall at this event?")) return;
    setProcessingId(eventId);
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/exhibitor/${user?.id}/events/${eventId}/register`, {
        method: "POST"
      });
      const json = await res.json();
      
      if (json.success) {
        toast.success(json.message);
        fetchEvents(); // Refresh data to show pending status
      } else {
        toast.error(json.message);
      }
    } catch (error) {
      toast.error("Network error applying for stall.");
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <DashShell role="exhibitor" nav={exhibitorNav}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </DashShell>
    );
  }

  const registeredEvents = events.filter(e => e.registration_status);
  const upcomingEvents = events.filter(e => !e.registration_status && e.event_status !== 'completed');

  return (
    <DashShell role="exhibitor" nav={exhibitorNav}>
      <PageHeader 
        title="Event Opportunities" 
        description="Browse upcoming Udyoga Melas and book stalls to showcase your brand." 
      />

      {registeredEvents.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-purple-600" /> My Registered Events
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {registeredEvents.map((e) => (
              <EventCard key={e.id} event={e} isRegistered={true} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
          <Store className="h-5 w-5 text-purple-600" /> Available Job Fairs
        </h2>
        
        {upcomingEvents.length === 0 ? (
          <Card className="p-10 text-center border-border/60 bg-muted/30">
            <Calendar className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="font-semibold text-navy">No new events available</h3>
            <p className="text-sm text-muted-foreground">Check back later for upcoming Udyoga Melas.</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((e) => (
              <EventCard 
                key={e.id} 
                event={e} 
                isRegistered={false} 
                onApply={() => handleApplyStall(e.id)}
                isProcessing={processingId === e.id}
              />
            ))}
          </div>
        )}
      </div>
    </DashShell>
  );
}

// Sub-component for clean mapping
function EventCard({ event, isRegistered, onApply, isProcessing }: { event: any, isRegistered: boolean, onApply?: () => void, isProcessing?: boolean }) {
  return (
    <Card className="overflow-hidden border-border/60 card-hover flex flex-col">
      <div className="h-32 bg-muted relative">
        {event.poster ? (
          <img src={event.poster} alt={event.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-purple-900/10 flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-purple-900/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        
        <Badge className="absolute top-3 right-3 bg-white/90 text-navy hover:bg-white">{event.event_type}</Badge>
        
        {isRegistered && (
          <Badge className={`absolute top-3 left-3 ${
            event.registration_status === 'approved' ? 'bg-india-green text-white' :
            event.registration_status === 'rejected' ? 'bg-red-500 text-white' :
            'bg-amber-500 text-white'
          }`}>
            {event.registration_status.toUpperCase()}
          </Badge>
        )}
        
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="font-bold text-lg leading-tight truncate">{event.name}</h3>
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 text-purple-600" />
            <span className="truncate">{new Date(event.event_date).toLocaleDateString("en-IN", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-purple-600" />
            <span className="truncate">{event.event_time || "Time TBD"}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-purple-600" />
            <span className="truncate">{event.city}</span>
          </div>
          <div className="flex items-center gap-2">
            <IndianRupee className="h-4 w-4 shrink-0 text-purple-600" />
            <span>Stall Price: <strong className="text-navy">₹{event.stall_price || 0}</strong></span>
          </div>
        </div>

        <div className="mt-auto">
          {isRegistered ? (
             <Button variant="outline" className="w-full border-purple-600/30 text-purple-700 bg-purple-50" disabled>
               Application {event.registration_status}
             </Button>
          ) : (
             <Button 
               onClick={onApply} 
               disabled={isProcessing} 
               className="w-full bg-purple-600 text-white hover:bg-purple-700"
             >
               {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply for Stall Space"}
             </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
