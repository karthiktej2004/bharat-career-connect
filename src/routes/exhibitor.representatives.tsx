import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DashShell, PageHeader } from "@/components/DashShell";
import { exhibitorNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getSession } from "@/lib/mockStore";
import { UsersRound, Loader2, Calendar, Trash2, Plus, X } from "lucide-react";

export const Route = createFileRoute("/exhibitor/representatives")({
  head: () => ({ meta: [{ title: "Representatives — Exhibitor Panel" }] }),
  component: ExhibitorReps,
});

function ExhibitorReps() {
  const user = getSession();
  const [reps, setReps] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [fName, setFName] = useState("");
  const [fEmail, setFEmail] = useState("");
  const [fPhone, setFPhone] = useState("");
  const [fRole, setFRole] = useState("Staff");
  const [fEvents, setFEvents] = useState<any[]>([]); // Array of event objects {id, name}

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch Reps
      const repsRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/exhibitor/${user?.id}/representatives`);
      const repsJson = await repsRes.json();
      if (repsJson.success) setReps(repsJson.data);

      // Fetch Approved Events
      const eventsRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/exhibitor/${user?.id}/approved-events`);
      const eventsJson = await eventsRes.json();
      if (eventsJson.success) setEvents(eventsJson.data);
    } catch (error) {
      toast.error("Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEventSelection = (event: any) => {
    setFEvents(prev => {
      const exists = prev.find(e => e.id === event.id);
      if (exists) return prev.filter(e => e.id !== event.id);
      return [...prev, event];
    });
  };

  const handleAddRep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fName || !fRole) return toast.error("Name and Role are required.");
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/exhibitor/${user?.id}/representatives`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fName, email: fEmail, phone: fPhone, role: fRole, assigned_events: fEvents
        })
      });
      const json = await res.json();
      
      if (json.success) {
        toast.success(json.message);
        setReps([json.data, ...reps]);
        // Reset form
        setFName(""); setFEmail(""); setFPhone(""); setFRole("Staff"); setFEvents([]);
        setShowForm(false);
      } else {
        toast.error(json.message);
      }
    } catch (error) {
      toast.error("Server connection failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this representative?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/exhibitor/representatives/${id}`, { method: "DELETE" });
      if ((await res.json()).success) {
        toast.success("Representative removed.");
        setReps(reps.filter(r => r.id !== id));
      }
    } catch (error) {
      toast.error("Failed to delete.");
    }
  };

  if (isLoading) return <DashShell role="exhibitor" nav={exhibitorNav}><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div></DashShell>;

  return (
    <DashShell role="exhibitor" nav={exhibitorNav}>
      <PageHeader 
        title="Representative Management" 
        description="Manage staff members and assign them to your upcoming job fairs." 
        action={
          !showForm && (
            <Button className="bg-purple-600 text-white hover:bg-purple-700" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Staff Member
            </Button>
          )
        }
      />

      {/* NEW STAFF DETAILS FORM */}
      {showForm && (
        <Card className="mb-8 border-border/60 overflow-hidden">
          <div className="bg-muted/30 px-6 py-4 flex items-center justify-between border-b border-border/60">
            <h3 className="font-bold text-navy uppercase text-sm tracking-wider">New Staff Details</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-destructive">
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
          </div>
          
          <form onSubmit={handleAddRep} className="p-6 space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label>Full Name *</Label>
                <Input required value={fName} onChange={e => setFName(e.target.value)} placeholder="John Doe" className="mt-1" />
              </div>
              <div>
                <Label>Email Address</Label>
                <Input type="email" value={fEmail} onChange={e => setFEmail(e.target.value)} placeholder="john@company.com" className="mt-1" />
              </div>
              <div>
                <Label>Mobile Number</Label>
                <Input type="tel" value={fPhone} onChange={e => setFPhone(e.target.value)} placeholder="10-digit number" className="mt-1" />
              </div>
              <div>
                <Label>Role *</Label>
                <Select value={fRole} onValueChange={setFRole}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Staff">Staff</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Recruiter">Recruiter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-1.5 mb-2 text-saffron uppercase text-xs font-bold tracking-wider">
                <Calendar className="h-4 w-4" /> Assign to Events (Select Multiple)
              </Label>
              {events.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">You must have an approved stall at an event before assigning staff to it.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {events.map(ev => {
                    const isSelected = fEvents.some(e => e.id === ev.id);
                    return (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => toggleEventSelection(ev)}
                        className={`px-3 py-1.5 rounded-full border text-sm transition-all ${
                          isSelected 
                            ? "bg-purple-100 border-purple-300 text-purple-700 font-medium" 
                            : "bg-white border-border text-muted-foreground hover:border-purple-300 hover:text-purple-600"
                        }`}
                      >
                        {ev.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isSubmitting} className="bg-navy text-white hover:bg-navy/90 px-8">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Staff Member
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* REPRESENTATIVES TABLE */}
      <Card className="border-border/60">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="text-xs uppercase tracking-wider font-bold">Representative</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-bold">Contact</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-bold">Assigned Events</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-bold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-16">
                  <UsersRound className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-navy">No representatives added yet.</h3>
                  <p className="text-sm text-muted-foreground mt-1">Click the button above to assign your staff to events.</p>
                </TableCell>
              </TableRow>
            ) : (
              reps.map((rep) => (
                <TableRow key={rep.id}>
                  <TableCell>
                    <p className="font-medium text-navy">{rep.full_name}</p>
                    <Badge variant="outline" className="mt-1 text-[10px] font-semibold tracking-wide text-purple-600 border-purple-200 bg-purple-50">
                      {rep.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{rep.email || "—"}</div>
                    <div className="text-xs text-muted-foreground">{rep.phone || "—"}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {rep.assigned_events && Array.isArray(rep.assigned_events) && rep.assigned_events.length > 0 ? (
                        rep.assigned_events.map((ev: any, idx: number) => (
                          <Badge key={idx} variant="secondary" className="bg-muted text-xs font-normal text-slate-600">
                            {ev.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground italic">None assigned</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(rep.id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </DashShell>
  );
}
