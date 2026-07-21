import { createFileRoute } from "@tanstack/react-router";
import { DashShell, PageHeader } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, MoreVertical, CalendarDays, MapPin, IndianRupee, Link as LinkIcon, PauseCircle, Trash2, Edit, Download, AlertTriangle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/events")({
  head: () => ({ meta: [{ title: "Events — Admin" }] }),
  component: Events,
});

function Events() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // Edit, Refund & Delete State
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [deleteEvent, setDeleteEvent] = useState<any | null>(null);
  const [hasDownloadedRefunds, setHasDownloadedRefunds] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/events");
      const json = await res.json();
      if (json.success) setEvents(json.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleHoldEvent = async (id: number) => {
    try {
      await fetch(`http://localhost:5000/api/admin/events/${id}/hold`, { method: "PUT" });
      toast.warning("Event placed on Hold. Portal registration is now closed.");
      fetchEvents();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const executeDelete = async () => {
    if (!deleteEvent) return;
    try {
      await fetch(`http://localhost:5000/api/admin/events/${deleteEvent.id}`, { method: "DELETE" });
      toast.success(`${deleteEvent.name} has been deleted. Employers notified of 24-hour refund.`);
      setDeleteEvent(null);
      setHasDownloadedRefunds(false);
      fetchEvents();
    } catch (error) {
      toast.error("Failed to delete event");
    }
  };

  return (
    <DashShell role="admin" nav={adminNav}>
      <PageHeader title="Event Management" description="Plan, configure, and manage Udyoga Mela events." action={
        <div className="flex gap-2">
          <Button className="bg-saffron text-navy hover:bg-saffron/90" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />New Event
          </Button>
        </div>
      } />
      
      <Card className="border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin mx-auto text-navy"/></TableCell></TableRow>
            ) : events.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No events found.</TableCell></TableRow>
            ) : (
              events.map((e) => (
                <TableRow key={e.id}>
                  <TableCell><p className="font-medium text-navy">{e.name}</p><p className="text-xs text-muted-foreground">{e.city}</p></TableCell>
                  <TableCell className="text-sm">{e.event_date ? new Date(e.event_date).toLocaleDateString("en-IN") : "—"}</TableCell>
                  <TableCell><Badge variant="outline">{e.event_type}</Badge></TableCell>
                  <TableCell>
                    <span className="font-medium">{e.registered_count || 0}</span>
                    <span className="text-muted-foreground">/{e.employer_capacity}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={e.status === "live" ? "bg-india-green text-white" : e.status === "upcoming" ? "bg-saffron text-navy" : e.status === "hold" ? "bg-amber-500 text-white" : "bg-muted"}>
                      {e.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingEvent(e)}>
                          <Edit className="h-4 w-4 mr-2"/> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleHoldEvent(e.id)}>
                          <PauseCircle className="h-4 w-4 mr-2"/> Put on Hold
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteEvent(e)}>
                          <Trash2 className="h-4 w-4 mr-2"/> Delete Event
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <CreateEventDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} refreshEvents={fetchEvents} />
      
      {editingEvent && (
        <EditEventDialog event={editingEvent} onClose={() => setEditingEvent(null)} refreshEvents={fetchEvents} />
      )}

      {/* --- REFUND & DELETE MODAL --- */}
      <Dialog open={!!deleteEvent} onOpenChange={(isOpen) => { if (!isOpen) { setDeleteEvent(null); setHasDownloadedRefunds(false); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2"><AlertTriangle className="h-5 w-5"/> Terminate Event</DialogTitle>
            <DialogDescription>
              You are about to permanently delete <strong>{deleteEvent?.name}</strong>. If employers have paid for stalls, you must process their refunds.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-muted p-4 rounded-md my-2">
            <h4 className="text-sm font-semibold text-navy mb-2">Required Action:</h4>
            <p className="text-xs text-muted-foreground mb-3">Download the payment ledger to process external refunds before deleting.</p>
            <Button variant="outline" className="w-full border-navy/20 text-navy" onClick={() => {
              toast.success("Downloading Refund Ledger (CSV)...");
              setHasDownloadedRefunds(true);
            }}>
              <Download className="h-4 w-4 mr-2" /> Download Refund Ledger
            </Button>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteEvent(null)}>Cancel</Button>
            <Button variant="destructive" disabled={!hasDownloadedRefunds} onClick={executeDelete}>
              Confirm Delete & Notify Employers
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashShell>
  );
}

/* EDIT EVENT DIALOG */
function EditEventDialog({ event, onClose, refreshEvents }: { event: any; onClose: () => void; refreshEvents: () => void }) {
  const formatBackendDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString().substring(0, 10);
  };

  const [f, setF] = useState({
    name: event.name || "",
    date: formatBackendDate(event.event_date),
    type: event.event_type || "Physical",
    city: event.city || "",
    venue: event.venue_address || "",
    maps_link: event.google_maps_link || "",
    capacity: String(event.employer_capacity || ""),
    price: String(event.stall_price || ""),
    desc: event.description || ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const upd = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));
  const isFormValid = Object.values(f).every(val => val.trim() !== "");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`http://localhost:5000/api/admin/events/${event.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.name, 
          event_date: f.date, 
          event_type: f.type, 
          city: f.city,
          venue_address: f.venue, 
          google_maps_link: f.maps_link,
          employer_capacity: f.capacity, 
          stall_price: f.price, 
          description: f.desc
        })
      });
      
      const json = await res.json();
      if (json.success) {
        toast.success("Event details updated successfully.");
        refreshEvents();
        onClose();
      } else {
        toast.error("Failed to update event");
      }
    } catch (err) {
      toast.error("Server connection failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Edit className="h-5 w-5 text-saffron" /> Edit Event</DialogTitle>
          <DialogDescription>Modify the configurations for this Udyoga Mela.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4 mt-4">
          <div className="sm:col-span-2"><Label>Event Name *</Label><Input required value={f.name} onChange={(e) => upd("name", e.target.value)} className="mt-1" /></div>
          
          <div><Label>Date *</Label><Input required type="date" value={f.date} onChange={(e) => upd("date", e.target.value)} className="mt-1" /></div>
          
          <div><Label>Type *</Label>
            <Select value={f.type} onValueChange={(v) => upd("type", v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Physical">Physical</SelectItem>
                <SelectItem value="Virtual">Virtual</SelectItem>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div><Label>City *</Label><Input required value={f.city} onChange={(e) => upd("city", e.target.value)} className="mt-1" /></div>
          
          <div>
            <Label>Google Maps Link *</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input required className="pl-9 mt-1" value={f.maps_link} onChange={(e) => upd("maps_link", e.target.value)} />
            </div>
          </div>
          
          <div className="sm:col-span-2">
            <Label>Venue Address *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input required className="pl-9 mt-1" value={f.venue} onChange={(e) => upd("venue", e.target.value)} />
            </div>
          </div>
          
          <div><Label>Employer Capacity (Stalls) *</Label><Input required type="number" min="1" value={f.capacity} onChange={(e) => upd("capacity", e.target.value)} className="mt-1" /></div>
          
          <div>
            <Label>Stall Price (₹) *</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input required type="number" min="0" className="pl-9 mt-1" value={f.price} onChange={(e) => upd("price", e.target.value)} />
            </div>
          </div>
          
          <div className="sm:col-span-2"><Label>Description *</Label><Textarea required rows={3} value={f.desc} onChange={(e) => upd("desc", e.target.value)} className="mt-1" /></div>
          
          <DialogFooter className="sm:col-span-2 mt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={!isFormValid || isSubmitting} className="bg-saffron text-navy hover:bg-saffron/90 disabled:opacity-50">
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* CREATE EVENT DIALOG */
function CreateEventDialog({ open, onOpenChange, refreshEvents }: { open: boolean; onOpenChange: (o: boolean) => void, refreshEvents: () => void }) {
  const [f, setF] = useState({ name: "", date: "", type: "Physical", city: "", venue: "", maps_link: "", capacity: "", price: "", desc: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const upd = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));
  const isFormValid = Object.values(f).every(val => val.trim() !== "");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f)
      });
      
      const json = await res.json();
      if (json.success) {
        toast.success(`"${f.name}" successfully created!`);
        onOpenChange(false);
        setF({ name: "", date: "", type: "Physical", city: "", venue: "", maps_link: "", capacity: "", price: "", desc: "" });
        refreshEvents();
      } else {
        toast.error(json.message || "Failed to create event");
      }
    } catch (error) {
      toast.error("Server connection failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-saffron" /> Create new event</DialogTitle>
          <DialogDescription>Set up a new Udyoga Mela. Fill all details to activate the creation process.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4 mt-4">
          <div className="sm:col-span-2"><Label>Event Name *</Label><Input required value={f.name} onChange={(e) => upd("name", e.target.value)} placeholder="Bengaluru Udyoga Mela 2026" className="mt-1" /></div>
          
          <div><Label>Date *</Label><Input required type="date" value={f.date} onChange={(e) => upd("date", e.target.value)} className="mt-1" /></div>
          
          <div><Label>Type *</Label>
            <Select value={f.type} onValueChange={(v) => upd("type", v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Physical">Physical</SelectItem>
                <SelectItem value="Virtual">Virtual</SelectItem>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div><Label>City *</Label><Input required value={f.city} onChange={(e) => upd("city", e.target.value)} placeholder="Bengaluru" className="mt-1" /></div>
          
          <div>
            <Label>Google Maps Link *</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input required className="pl-9 mt-1" value={f.maps_link} onChange={(e) => upd("maps_link", e.target.value)} placeholder="https://maps.google.com/..." />
            </div>
          </div>
          
          <div className="sm:col-span-2">
            <Label>Venue Address *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input required className="pl-9 mt-1" value={f.venue} onChange={(e) => upd("venue", e.target.value)} placeholder="Palace Grounds, Bellary Rd..." />
            </div>
          </div>
          
          <div><Label>Employer Capacity (Stalls) *</Label><Input required type="number" min="1" value={f.capacity} onChange={(e) => upd("capacity", e.target.value)} placeholder="e.g. 50" className="mt-1" /></div>
          
          <div>
            <Label>Stall Price (₹) *</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input required type="number" min="0" className="pl-9 mt-1" value={f.price} onChange={(e) => upd("price", e.target.value)} placeholder="15000" />
            </div>
          </div>
          
          <div className="sm:col-span-2"><Label>Description *</Label><Textarea required rows={3} value={f.desc} onChange={(e) => upd("desc", e.target.value)} placeholder="Highlights, sponsors, participating sectors…" className="mt-1" /></div>
          
          <DialogFooter className="sm:col-span-2 mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!isFormValid || isSubmitting} className="bg-saffron text-navy hover:bg-saffron/90 disabled:opacity-50">
              {isSubmitting ? "Creating..." : "Create event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}