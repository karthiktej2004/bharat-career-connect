import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { DashShell, PageHeader } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { 
  Building2, 
  Plus, 
  Store, 
  Loader2, 
  CheckCircle2, 
  Trash2, 
  Calendar 
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/stalls")({
  head: () => ({ meta: [{ title: "Stall Allocation & Venue — Bharat Career Connect" }] }),
  component: AdminStallsPage,
});

function AdminStallsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [venue, setVenue] = useState<any[]>([]);
  const [employers, setEmployers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [addRoomTargetBlockId, setAddRoomTargetBlockId] = useState<string | null>(null);
  const [addStallTarget, setAddStallTarget] = useState<{ blockId: string; roomId?: string } | null>(null);

  // 1. Fetch Events & Employers on Mount
  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://15.207.249.155:5000";
    Promise.all([
      fetch(`${baseUrl}/api/admin/events`).then((r) => r.json()),
      fetch(`${baseUrl}/api/admin/employers`).then((r) => r.json()),
    ])
      .then(([eventsJson, empJson]) => {
        if (eventsJson.success && eventsJson.data.length > 0) {
          setEvents(eventsJson.data);
          setSelectedEventId(eventsJson.data[0].id.toString());
        }
        if (empJson.success) setEmployers(empJson.data);
      })
      .catch(() => toast.error("Failed to load initial event data."));
  }, []);

  // 2. Fetch Venue Structure whenever selected event changes
  const fetchVenue = useCallback(async () => {
    if (!selectedEventId) return;
    setIsLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://15.207.249.155:5000";
      const res = await fetch(`${baseUrl}/api/admin/events/${selectedEventId}/venue`);
      const json = await res.json();
      if (json.success) setVenue(json.data || []);
    } catch (err) {
      toast.error("Failed to load venue layout.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedEventId]);

  useEffect(() => {
    fetchVenue();
  }, [fetchVenue]);

  // 3. Handle Allocate Stall
  const handleAllocate = async (stallId: string, employerId: string, stallCode: string) => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://15.207.249.155:5000";
      const res = await fetch(`${baseUrl}/api/admin/stalls/${stallId}/allocate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: Number(selectedEventId),
          employerId: employerId ? Number(employerId) : null,
          stallCode,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Stall allocated successfully!");
        fetchVenue();
      } else {
        toast.error(json.message || "Allocation failed.");
      }
    } catch (e) {
      toast.error("Network error during allocation.");
    }
  };

  // 4. Handle Delete Stall
  const handleDeleteStall = async (stallId: string) => {
    if (!confirm("Are you sure you want to delete this stall?")) return;
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://15.207.249.155:5000";
      const res = await fetch(`${baseUrl}/api/admin/stalls/${stallId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Stall deleted successfully!");
        fetchVenue();
      }
    } catch (e) {
      toast.error("Error deleting stall.");
    }
  };

  return (
    <DashShell role="admin" nav={adminNav}>
      <PageHeader
        title="Stall Allocation & Venue Control"
        description="Create venue blocks, exhibition halls, and assign physical stalls to approved employers."
        action={
          <Button
            onClick={() => setShowAddBlock(true)}
            disabled={!selectedEventId}
            className="bg-saffron text-navy font-bold hover:bg-saffron/90"
          >
            <Plus className="h-4 w-4 mr-1.5" /> Add Venue Block
          </Button>
        }
      />

      {/* TARGET EVENT SELECTOR */}
      <Card className="p-4 border-border/60 mt-6 bg-slate-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-display font-bold text-navy">
          <Calendar className="h-4 w-4 text-saffron" />
          <span>Active Event Venue Layout:</span>
        </div>
        <Select value={selectedEventId} onValueChange={setSelectedEventId}>
          <SelectTrigger className="w-72 bg-white font-medium">
            <SelectValue placeholder="Select Event..." />
          </SelectTrigger>
          <SelectContent>
            {events.map((e) => (
              <SelectItem key={e.id} value={e.id.toString()}>
                {e.name} ({e.city || "Hubballi"})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      {/* VENUE STRUCTURE DISPLAY */}
      {isLoading ? (
        <div className="flex justify-center p-16">
          <Loader2 className="h-8 w-8 animate-spin text-saffron" />
        </div>
      ) : venue.length === 0 ? (
        <div className="text-center py-12 border rounded-xl bg-white mt-6 text-muted-foreground space-y-3">
          <p>No venue blocks exist for this event yet.</p>
          <Button onClick={() => setShowAddBlock(true)} className="bg-saffron text-navy font-semibold">
            <Plus className="h-4 w-4 mr-1" /> Create First Block / Hall
          </Button>
        </div>
      ) : (
        <div className="space-y-6 mt-6">
          {venue.map((block) => (
            <Card key={block.id} className="p-5 border-border/80 bg-white shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-slate-100 text-navy uppercase text-[10px]">
                    {block.kind || "Block"}
                  </Badge>
                  <h3 className="font-display font-bold text-lg text-navy">
                    {block.name} <span className="text-muted-foreground font-normal">({block.code})</span>
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setAddRoomTargetBlockId(block.id)}
                    className="text-xs"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Room / Section
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setAddStallTarget({ blockId: block.id })}
                    className="bg-navy text-white hover:bg-navy/90 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Stall
                  </Button>
                </div>
              </div>

              {/* SECTIONS / ROOMS */}
              {block.sections && block.sections.length > 0 && (
                <div className="space-y-4">
                  {block.sections.map((room: any) => (
                    <div key={room.id} className="p-4 rounded-lg bg-slate-50 border border-border/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-navy">
                          {room.name} ({room.code})
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setAddStallTarget({ blockId: block.id, roomId: room.id })}
                          className="h-7 text-xs text-navy hover:bg-slate-200"
                        >
                          <Plus className="h-3 w-3 mr-1" /> Add Stall to {room.code}
                        </Button>
                      </div>

                      {/* STALLS GRID INSIDE ROOM */}
                      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {room.stalls?.map((stall: any) => (
                          <StallCard
                            key={stall.id}
                            stall={stall}
                            employers={employers}
                            onAllocate={handleAllocate}
                            onDelete={() => handleDeleteStall(stall.id)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* STALLS DIRECTLY IN BLOCK */}
              {block.stalls && block.stalls.length > 0 && (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                  {block.stalls.map((stall: any) => (
                    <StallCard
                      key={stall.id}
                      stall={stall}
                      employers={employers}
                      onAllocate={handleAllocate}
                      onDelete={() => handleDeleteStall(stall.id)}
                    />
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* ADD BLOCK MODAL */}
      <Dialog open={showAddBlock} onOpenChange={setShowAddBlock}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-white">
          <AddBlockModal
            eventId={Number(selectedEventId)}
            onClose={() => setShowAddBlock(false)}
            onSuccess={fetchVenue}
          />
        </DialogContent>
      </Dialog>

      {/* ADD ROOM MODAL */}
      <Dialog open={!!addRoomTargetBlockId} onOpenChange={(o) => !o && setAddRoomTargetBlockId(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-white">
          {addRoomTargetBlockId && (
            <AddRoomModal
              eventId={Number(selectedEventId)}
              blockId={addRoomTargetBlockId}
              onClose={() => setAddRoomTargetBlockId(null)}
              onSuccess={fetchVenue}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ADD STALL MODAL */}
      <Dialog open={!!addStallTarget} onOpenChange={(o) => !o && setAddStallTarget(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-white">
          {addStallTarget && (
            <AddStallModal
              eventId={Number(selectedEventId)}
              blockId={addStallTarget.blockId}
              roomId={addStallTarget.roomId}
              onClose={() => setAddStallTarget(null)}
              onSuccess={fetchVenue}
            />
          )}
        </DialogContent>
      </Dialog>
    </DashShell>
  );
}

/* ----------------- STALL ITEM CARD WITH ALLOCATION SELECTOR ----------------- */
function StallCard({
  stall,
  employers,
  onAllocate,
  onDelete,
}: {
  stall: any;
  employers: any[];
  onAllocate: (stallId: string, employerId: string, stallCode: string) => void;
  onDelete: () => void;
}) {
  const isAllocated = Boolean(stall.allocatedToAppId);

  return (
    <div
      className={`p-3.5 rounded-lg border flex flex-col justify-between gap-2.5 transition-all ${
        isAllocated
          ? "bg-emerald-50/80 border-emerald-300 text-emerald-950"
          : "bg-white border-border/80 text-navy"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-bold text-sm font-mono flex items-center gap-1.5">
          <Store className="h-4 w-4 text-saffron" />
          {stall.code}
        </span>
        <div className="flex items-center gap-1">
          {isAllocated ? (
            <Badge className="bg-emerald-600 text-white text-[10px] h-5 gap-1">
              <CheckCircle2 className="h-3 w-3" /> Assigned
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] text-muted-foreground h-5">
              Available
            </Badge>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            className="h-6 w-6 p-0 text-red-500 hover:bg-red-100 hover:text-red-700 rounded-full"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div>
        <Select
          value={stall.allocatedToAppId || "none"}
          onValueChange={(val) => onAllocate(stall.id, val === "none" ? "" : val, stall.code)}
        >
          <SelectTrigger className="w-full h-8 text-xs bg-white font-medium">
            <SelectValue placeholder="Assign to employer..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">-- Unallocated / Vacant --</SelectItem>
            {employers.map((emp) => (
              <SelectItem key={emp.dbId || emp.id} value={emp.dbId?.toString() || emp.id?.toString()}>
                {emp.name || emp.companyName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

/* ----------------- ADD BLOCK MODAL ----------------- */
export function AddBlockModal({
  eventId,
  onClose,
  onSuccess,
}: {
  eventId: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [kind, setKind] = useState("Building");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      toast.error("Please fill in both Name and Code.");
      return;
    }

    setIsSubmitting(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://15.207.249.155:5000";
      const res = await fetch(`${baseUrl}/api/admin/events/${eventId}/venue/blocks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, name: name.trim(), code: code.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Venue block created successfully!");
        onSuccess();
        onClose();
      } else {
        toast.error(json.message || "Failed to create block.");
      }
    } catch (err) {
      toast.error("Server connection error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleCreateBlock} className="space-y-4 p-6 bg-white rounded-xl shadow-lg border">
      <div>
        <h3 className="font-bold text-navy text-lg">Add Block / Hall</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Pick the type of container. You can add rooms and physical stalls inside after creating it.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-navy block mb-1">Type</label>
          <select
            className="w-full border border-border rounded-lg px-3 py-2 bg-white text-navy text-sm font-medium"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
          >
            <option value="Building">Building</option>
            <option value="Hall">Hall</option>
            <option value="Ground">Ground</option>
            <option value="Block">Block</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-navy block mb-1">Name *</label>
          <input
            type="text"
            placeholder="e.g. Main Exhibition Hall"
            className="w-full border border-border rounded-lg px-3 py-2 text-sm text-navy"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-navy block mb-1">Code *</label>
          <input
            type="text"
            placeholder="e.g. HALL-A"
            className="w-full border border-border rounded-lg px-3 py-2 text-sm text-navy uppercase"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-3">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !name.trim() || !code.trim()}
          className="bg-saffron text-navy hover:bg-saffron/90 font-bold"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Create
        </Button>
      </div>
    </form>
  );
}

/* ----------------- ADD ROOM / SECTION MODAL ----------------- */
export function AddRoomModal({
  eventId,
  blockId,
  onClose,
  onSuccess,
}: {
  eventId: number;
  blockId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      toast.error("Please fill in Room Name and Code.");
      return;
    }

    setIsSubmitting(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://15.207.249.155:5000";
      const res = await fetch(`${baseUrl}/api/admin/events/${eventId}/venue/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockId, name: name.trim(), code: code.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Venue section created successfully!");
        onSuccess();
        onClose();
      } else {
        toast.error(json.message || "Failed to create room.");
      }
    } catch (err) {
      toast.error("Server connection error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleCreateRoom} className="space-y-4 p-6 bg-white rounded-xl shadow-lg border">
      <div>
        <h3 className="font-bold text-navy text-lg">Add Section / Room</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Create a sub-section inside this block to organize stalls (e.g. IT Wing, Core Engineering Hall).
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-navy block mb-1">Section Name *</label>
          <input
            type="text"
            placeholder="e.g. IT Software Wing"
            className="w-full border border-border rounded-lg px-3 py-2 text-sm text-navy"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-navy block mb-1">Section Code *</label>
          <input
            type="text"
            placeholder="e.g. WING-A"
            className="w-full border border-border rounded-lg px-3 py-2 text-sm text-navy uppercase"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-3">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !name.trim() || !code.trim()}
          className="bg-saffron text-navy hover:bg-saffron/90 font-bold"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Create Section
        </Button>
      </div>
    </form>
  );
}

/* ----------------- ADD STALL MODAL (FIXED) ----------------- */
export function AddStallModal({
  eventId,
  blockId,
  roomId,
  onClose,
  onSuccess,
}: {
  eventId: number;
  blockId: string;
  roomId?: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateStall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Please enter a Stall Code.");
      return;
    }

    setIsSubmitting(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://15.207.249.155:5000";
      const res = await fetch(`${baseUrl}/api/admin/events/${eventId}/venue/stalls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockId, roomId: roomId || null, code: code.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Stall created successfully!");
        onSuccess();
        onClose();
      } else {
        toast.error(json.message || "Failed to create stall.");
      }
    } catch (err) {
      toast.error("Server connection error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleCreateStall} className="space-y-4 p-6 bg-white rounded-xl shadow-lg border">
      <div>
        <h3 className="font-bold text-navy text-lg">Add Physical Stall</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Create a physical booth code that employers can be allocated to.
        </p>
      </div>

      <div>
        <label className="text-xs font-semibold text-navy block mb-1">Stall Code *</label>
        <input
          type="text"
          placeholder="e.g. STALL-A101"
          className="w-full border border-border rounded-lg px-3 py-2 text-sm text-navy uppercase font-mono"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoFocus
        />
      </div>

      <div className="flex justify-end gap-2 pt-3">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !code.trim()}
          className="bg-saffron text-navy hover:bg-saffron/90 font-bold"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Add Stall
        </Button>
      </div>
    </form>
  );
}
