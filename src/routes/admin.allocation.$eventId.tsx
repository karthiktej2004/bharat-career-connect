import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { DashShell, PageHeader, StatCard } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Building2, Warehouse, LandPlot, Boxes, ChevronRight, Plus, Trash2, ArrowLeft,
  Store, Layers, LayoutGrid, CheckCircle2, XCircle, Sparkles, MapPinned, Pencil, Loader2
} from "lucide-react";
import { toast } from "sonner";

type AllocSearch = { tab?: "builder" | "company"; app?: string };

export const Route = createFileRoute("/admin/allocation/$eventId")({
  head: () => ({ meta: [{ title: "Stall Allocation — Admin" }] }),
  validateSearch: (s: Record<string, unknown>): AllocSearch => ({
    tab: s.tab === "company" ? "company" : s.tab === "builder" ? "builder" : undefined,
    app: typeof s.app === "string" ? s.app : undefined,
  }),
  component: AllocationPage,
});

const KIND_META: Record<string, { icon: typeof Building2; color: string; border: string; ring: string }> = {
  Building: { icon: Building2, color: "from-navy/15 to-navy/5", border: "border-navy/40", ring: "ring-navy/30" },
  Hall:     { icon: Warehouse, color: "from-saffron/20 to-saffron/5", border: "border-saffron/50", ring: "ring-saffron/30" },
  Ground:   { icon: LandPlot, color: "from-india-green/15 to-india-green/5", border: "border-india-green/50", ring: "ring-india-green/30" },
  Block:    { icon: Boxes, color: "from-purple-400/15 to-purple-400/5", border: "border-purple-400/50", ring: "ring-purple-400/30" },
};

function AllocationPage() {
  const { eventId } = Route.useParams();
  const search = Route.useSearch();
  const [tab, setTab] = useState<"builder" | "company">(search.tab ?? "builder");
  
  useEffect(() => { if (search.tab) setTab(search.tab); }, [search.tab]);

  const [event, setEvent] = useState<any | null>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [openBlock, setOpenBlock] = useState<string | null>(null);
  const [stats, setStats] = useState({ blocks: 0, total: 0, allocated: 0, empty: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async () => {
    try {
      const eventRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/events`);
      const eventJson = await eventRes.json();
      if (eventJson.success) {
        const currentEvent = eventJson.data.find((e: any) => e.id == eventId);
        setEvent(currentEvent);
      }

      const venueRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/events/${eventId}/venue`);
      const venueJson = await venueRes.json();
      if (venueJson.success) {
        setBlocks(venueJson.data);
        let total = 0; let allocated = 0;
        venueJson.data.forEach((b: any) => {
          b.stalls.forEach((s: any) => { total++; if (s.allocatedToAppId) allocated++; });
          b.sections.forEach((sec: any) => sec.stalls.forEach((s: any) => { total++; if (s.allocatedToAppId) allocated++; }));
        });
        setStats({ blocks: venueJson.data.length, total, allocated, empty: total - allocated });
      }
    } catch (e) {
      toast.error("Failed to load venue data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [eventId]);

  if (isLoading) {
    return <DashShell role="admin" nav={adminNav}><div className="flex h-[40vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-navy" /></div></DashShell>;
  }

  if (!event) {
    return (
      <DashShell role="admin" nav={adminNav}>
        <PageHeader title="Event not found" description="" />
        <Link to="/admin/qr" className="text-navy underline text-sm">← Back to QR & Entry</Link>
      </DashShell>
    );
  }

  const activeBlock = blocks.find((b) => b.id == openBlock) ?? null;

  return (
    <DashShell role="admin" nav={adminNav}>
      <PageHeader
        title="Stall Allocation Platform"
        description={`${event.name} · ${event.city} · ${new Date(event.event_date).toDateString()}`}
        action={
          <Link to="/admin/qr" className="text-xs text-navy underline flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Back to QR & Entry
          </Link>
        }
      />

      <div className="grid sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="Blocks / Halls" value={String(stats.blocks)} icon={Boxes} accent="saffron" />
        <StatCard label="Total Stalls" value={String(stats.total)} icon={Store} accent="navy" />
        <StatCard label="Allocated" value={String(stats.allocated)} icon={CheckCircle2} accent="india-green" />
        <StatCard label="Empty" value={String(stats.empty)} icon={LayoutGrid} />
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "builder" | "company")} className="w-full">
        <TabsList>
          <TabsTrigger value="builder"><Sparkles className="h-4 w-4 mr-1.5" /> Venue Builder</TabsTrigger>
          <TabsTrigger value="company"><MapPinned className="h-4 w-4 mr-1.5" /> Company Allocation</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="mt-5">
          {activeBlock ? (
            <BlockInterior block={activeBlock} eventId={eventId} onBack={() => setOpenBlock(null)} onChange={refresh} />
          ) : (
            <BuilderTop blocks={blocks} eventId={eventId} onOpen={setOpenBlock} onChange={refresh} />
          )}
        </TabsContent>

        <TabsContent value="company" className="mt-5">
          <CompanyAllocation eventId={eventId} blocks={blocks} autoOpenAppId={search.app} onChange={refresh} />
        </TabsContent>
      </Tabs>
    </DashShell>
  );
}

function BuilderTop({ blocks, eventId, onOpen, onChange }: { blocks: any[]; eventId: string; onOpen: (id: string) => void; onChange: () => void }) {
  const [addOpen, setAddOpen] = useState(false);
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-display font-bold text-navy text-lg">Venue structure</h2>
          <p className="text-xs text-muted-foreground">Create the big containers first — buildings, halls, grounds or blocks.</p>
        </div>
        <Button className="bg-saffron text-navy hover:bg-saffron/90 font-bold" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Block / Hall
        </Button>
      </div>

      {blocks.length === 0 ? (
        <Card className="p-10 text-center border-dashed border-2 border-border bg-white">
          <Boxes className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="font-semibold text-navy">No blocks yet</p>
          <p className="text-xs text-muted-foreground mt-1">Add your first Building, Hall, Ground or Block to start laying out the venue.</p>
          <Button className="mt-4 bg-saffron text-navy hover:bg-saffron/90 font-bold" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add first block
          </Button>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {blocks.map((b) => <BigBlockCard key={b.id} block={b} onOpen={() => onOpen(b.id)} />)}
        </div>
      )}
      <AddBlockDialog open={addOpen} onOpenChange={setAddOpen} eventId={eventId} onChange={onChange} />
    </div>
  );
}

function BigBlockCard({ block, onOpen }: { block: any; onOpen: () => void }) {
  const meta = KIND_META[block.kind] || KIND_META['Hall'];
  const Icon = meta.icon;
  const stallCount = block.stalls.length + block.sections.reduce((n: number, s: any) => n + s.stalls.length, 0);
  return (
    <button onClick={onOpen} className={`group relative text-left rounded-2xl border-2 ${meta.border} bg-gradient-to-br ${meta.color} p-5 h-52 flex flex-col justify-between transition-all hover:scale-[1.02] hover:shadow-xl hover:ring-4 ${meta.ring}`}>
      <div className="flex items-start justify-between">
        <div className="size-12 rounded-xl bg-white/80 backdrop-blur flex items-center justify-center shadow-sm">
          <Icon className="h-6 w-6 text-navy" />
        </div>
        <Badge className="bg-white/80 text-navy font-mono text-[10px]">{block.code}</Badge>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-navy/70 font-semibold">{block.kind}</p>
        <h3 className="font-display font-bold text-navy text-xl leading-tight truncate">{block.name}</h3>
        <div className="mt-2 flex items-center justify-between text-xs text-navy/80">
          <span className="flex items-center gap-1"><Layers className="h-3 w-3" /> {block.sections.length} rooms</span>
          <span className="flex items-center gap-1"><Store className="h-3 w-3" /> {stallCount} stalls</span>
          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition" />
        </div>
      </div>
    </button>
  );
}

function AddBlockDialog({ open, onOpenChange, eventId, onChange }: { open: boolean; onOpenChange: (o: boolean) => void; eventId: string; onChange: () => void }) {
  const [kind, setKind] = useState("Hall");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !code.trim()) { toast.error("Name and code are required"); return; }
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/events/${eventId}/venue/blocks`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, name: name.trim(), code: code.trim() })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(`${kind} "${name}" added successfully!`);
        setName(""); setCode(""); onOpenChange(false); onChange();
      } else {
        toast.error(json.message || "Failed to save block to database");
      }
    } catch (err) { toast.error("Server connection failed"); } finally { setIsSubmitting(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Add block</DialogTitle>
          <DialogDescription>Pick the type of container. You can add rooms and stalls inside after creating it.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label className="text-xs uppercase tracking-widest">Type</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {(Object.keys(KIND_META)).map((k) => {
                const M = KIND_META[k].icon;
                return (
                  <button type="button" key={k} onClick={() => setKind(k)}
                    className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition ${kind === k ? "border-navy bg-navy/5" : "border-border hover:border-navy/30"}`}>
                    <M className="h-5 w-5 text-navy" />
                    <span className="text-[11px] font-semibold text-navy">{k}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="IT Hall" className="mt-1" required /></div>
            <div><Label>Code *</Label><Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Block-A" className="mt-1 font-mono uppercase" required /></div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || !name.trim() || !code.trim()} className="bg-saffron text-navy hover:bg-saffron/90 font-bold">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function BlockInterior({ block, eventId, onBack, onChange }: { block: any; eventId: string; onBack: () => void; onChange: () => void }) {
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [addStallsOpen, setAddStallsOpen] = useState<{ open: boolean; sectionId: string | null }>({ open: false, sectionId: null });
  const meta = KIND_META[block.kind] || KIND_META['Hall'];
  const Icon = meta.icon;

  async function handleDeleteStall(stallId: string) {
    if (!confirm("Delete this stall?")) return;
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/stalls/${stallId}`, { method: 'DELETE' });
      toast.success("Stall deleted");
      onChange();
    } catch (e) { toast.error("Failed to delete stall"); }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button size="sm" variant="outline" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
          <div className={`size-10 rounded-xl border-2 ${meta.border} bg-gradient-to-br ${meta.color} flex items-center justify-center`}>
            <Icon className="h-5 w-5 text-navy" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{block.kind} · <span className="font-mono">{block.code}</span></p>
            <h2 className="font-display font-bold text-navy text-lg truncate">{block.name}</h2>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={() => setAddSectionOpen(true)}><Layers className="h-4 w-4 mr-1" /> Add room</Button>
          <Button size="sm" className="bg-navy text-white hover:bg-navy/90 font-bold" onClick={() => setAddStallsOpen({ open: true, sectionId: null })}>
            <Plus className="h-4 w-4 mr-1" /> Add stalls here
          </Button>
        </div>
      </div>

      {block.stalls.length > 0 && (
        <Card className="p-5 mb-5 border-border/60 bg-white">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h3 className="font-semibold text-navy text-sm uppercase tracking-widest">Stalls directly in {block.name}</h3>
            <Badge variant="outline">{block.stalls.length} stalls</Badge>
          </div>
          <StallGrid stalls={block.stalls} onDelete={handleDeleteStall} />
        </Card>
      )}

      {block.sections.length === 0 && block.stalls.length === 0 && (
        <Card className="p-10 text-center border-dashed border-2 border-border bg-white">
          <Layers className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="font-semibold text-navy">Empty {block.kind.toLowerCase()}</p>
          <p className="text-xs text-muted-foreground mt-1">Add rooms/sub-halls, or place stalls directly here.</p>
        </Card>
      )}

      {block.sections.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {block.sections.map((s: any) => (
            <Card key={s.id} className="p-4 border-border/60 border-l-4 border-l-saffron bg-white">
              <div className="flex items-start justify-between mb-3 gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">{s.code}</p>
                  <h4 className="font-display font-bold text-navy truncate">{s.name}</h4>
                </div>
                <Button size="sm" variant="outline" onClick={() => setAddStallsOpen({ open: true, sectionId: s.id })}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Stalls
                </Button>
              </div>
              {s.stalls.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No stalls yet.</p>
              ) : (
                <StallGrid stalls={s.stalls} compact onDelete={handleDeleteStall} />
              )}
            </Card>
          ))}
        </div>
      )}

      <AddSectionDialog open={addSectionOpen} onOpenChange={setAddSectionOpen} block={block} eventId={eventId} onChange={onChange} />
      <AddStallsDialog open={addStallsOpen.open} onOpenChange={(o) => setAddStallsOpen({ open: o, sectionId: o ? addStallsOpen.sectionId : null })} block={block} sectionId={addStallsOpen.sectionId} eventId={eventId} onChange={onChange} />
    </div>
  );
}

function StallGrid({ stalls, compact, onDelete }: { stalls: any[]; compact?: boolean; onDelete: (id: string) => void }) {
  return (
    <div className={`grid gap-2 ${compact ? "grid-cols-4" : "grid-cols-5 md:grid-cols-8"}`}>
      {stalls.map((s) => (
        <div key={s.id} className={`group relative aspect-square rounded-lg border-2 flex flex-col items-center justify-center text-center p-1 ${s.allocatedToAppId ? "border-india-green bg-india-green/10" : "border-dashed border-border bg-muted/30"}`} title={s.allocatedName ?? "Empty"}>
          <span className="font-mono text-[10px] font-bold text-navy leading-tight">{s.code}</span>
          {s.allocatedName ? (
            <span className="text-[9px] text-india-green line-clamp-2 leading-tight mt-0.5">{s.allocatedName}</span>
          ) : (
            <span className="text-[9px] text-muted-foreground">Empty</span>
          )}
          <button onClick={() => onDelete(s.id)} className="absolute -top-1.5 -right-1.5 size-4 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition text-[10px] flex items-center justify-center">×</button>
        </div>
      ))}
    </div>
  );
}

function AddSectionDialog({ open, onOpenChange, block, eventId, onChange }: { open: boolean; onOpenChange: (o: boolean) => void; block: any; eventId: string; onChange: () => void }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return toast.error("Required fields missing");
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/events/${eventId}/venue/rooms`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockId: block.id, name: name.trim(), code: code.trim() })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(`Room added successfully!`);
        setName(""); setCode(""); onOpenChange(false); onChange();
      } else toast.error(json.message || "Failed to add room");
    } catch (err) { toast.error("Server connection failed"); } finally { setIsSubmitting(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm bg-white">
        <DialogHeader>
          <DialogTitle>Add room in {block.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div><Label>Name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
          <div><Label>Code *</Label><Input value={code} onChange={(e) => setCode(e.target.value)} required /></div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-saffron text-navy font-bold">Add</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddStallsDialog({ open, onOpenChange, block, sectionId, eventId, onChange }: { open: boolean; onOpenChange: (o: boolean) => void; block: any; sectionId: string | null; eventId: string; onChange: () => void }) {
  const [count, setCount] = useState(6);
  const [prefix, setPrefix] = useState("Stall");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const target = sectionId ? block.sections.find((s: any) => s.id == sectionId)?.name : block.name;
  
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (count < 1 || count > 200) return toast.error("Enter 1 to 200 stalls");
    
    setIsSubmitting(true);
    try {
      // FE FIX: Fire parallel requests to simulate bulk generation since backend expects single 'code'
      const promises = Array.from({ length: count }).map((_, i) => {
        const stallCode = `${prefix.trim()}-${(i + 1).toString().padStart(2, '0')}`;
        return fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/events/${eventId}/venue/stalls`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ blockId: block.id, roomId: sectionId, code: stallCode })
        });
      });

      await Promise.all(promises);
      toast.success(`${count} stalls added to ${target}!`);
      onOpenChange(false); onChange();
    } catch (err) {
      toast.error("Server connection failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm bg-white">
        <DialogHeader>
          <DialogTitle>Add stalls to {target}</DialogTitle>
          <DialogDescription>Auto-generates e.g. {prefix}-01, {prefix}-02…</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div><Label>How many stalls?</Label><Input type="number" min={1} max={200} value={count} onChange={(e) => setCount(Number(e.target.value))} required /></div>
          <div><Label>Code prefix</Label><Input value={prefix} onChange={(e) => setPrefix(e.target.value)} required /></div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-navy text-white font-bold">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Create {count} stalls
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------- Company allocation ------------------------- */
function CompanyAllocation({ eventId, blocks, autoOpenAppId, onChange }: { eventId: string; blocks: any[]; autoOpenAppId?: string; onChange: () => void }) {
  const [apps, setApps] = useState<any[]>([]);
  const [assigning, setAssigning] = useState<any | null>(null);

  const fetchApps = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/stall-applications`);
      const json = await res.json();
      if (json.success) setApps(json.data.filter((a: any) => a.eventId == eventId));
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchApps(); }, [eventId]);

  const allStalls = useMemo(() => {
    const rows: { stall: any; blockName: string; blockCode: string; sectionName?: string; sectionCode?: string }[] = [];
    for (const b of blocks) {
      for (const s of b.stalls) rows.push({ stall: s, blockName: b.name, blockCode: b.code });
      for (const sec of b.sections) for (const s of sec.stalls) rows.push({ stall: s, blockName: b.name, blockCode: b.code, sectionName: sec.name, sectionCode: sec.code });
    }
    return rows;
  }, [blocks]);

  useEffect(() => {
    if (!autoOpenAppId) return;
    const target = apps.find((a) => a.id.toString() == autoOpenAppId);
    if (target) setAssigning(target);
  }, [autoOpenAppId, apps]);

  if (blocks.length === 0) {
    return (
      <Card className="p-10 text-center border-dashed border-2 border-border bg-white">
        <Boxes className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
        <p className="font-semibold text-navy">Build the venue first</p>
        <p className="text-xs text-muted-foreground mt-1">Go to the Venue Builder tab and add blocks & stalls before allocating companies.</p>
      </Card>
    );
  }

  const pending = apps.filter((a) => a.status === "pending");
  const approved = apps.filter((a) => a.status === "approved" || a.status === "live");

  const renderRow = (a: any) => {
    const currentStall = allStalls.find((x) => x.stall.allocatedToAppId == (a.employer_id || a.employerId));
    const isPending = a.status === "pending";
    return (
      <div key={a.id} className={`p-3 rounded-lg border flex items-start justify-between gap-2 bg-white ${isPending ? "border-saffron/50 bg-saffron/5" : "border-border"}`}>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-navy text-sm truncate">{a.employerName}</p>
            {isPending && <Badge className="bg-saffron/20 text-saffron">Pending approval</Badge>}
          </div>
          <p className="text-xs text-muted-foreground truncate">{a.rolesToHire} · {a.vacanciesCount} vacancies</p>
          <p className="text-[11px] text-muted-foreground">{a.contactEmail}</p>
          {currentStall ? (
            <Badge className="bg-india-green/15 text-india-green mt-1">
              <CheckCircle2 className="h-3 w-3 mr-1" /> {currentStall.blockCode}{currentStall.sectionCode ? ` · ${currentStall.sectionCode}` : ""} · {currentStall.stall.code}
            </Badge>
          ) : (
            <Badge className="bg-saffron/15 text-saffron mt-1"><XCircle className="h-3 w-3 mr-1" /> Not allocated</Badge>
          )}
        </div>
        <div className="flex flex-col gap-1 items-end">
          <Button size="sm" className="bg-navy text-white hover:bg-navy/90 font-bold" onClick={() => setAssigning(a)}>
            {isPending ? "Approve & allocate" : currentStall ? "Change stall" : "Allocate"}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="grid lg:grid-cols-5 gap-5">
      <Card className="p-4 border-border/60 lg:col-span-2 space-y-4 bg-white">
        {pending.length > 0 && (
          <div>
            <h3 className="font-display font-bold text-navy mb-2 text-sm uppercase tracking-widest text-saffron">Pending Applications ({pending.length})</h3>
            <div className="space-y-2">{pending.map(renderRow)}</div>
          </div>
        )}
        <div>
          <h3 className="font-display font-bold text-navy mb-2">Approved Companies ({approved.length})</h3>
          {approved.length === 0 && <p className="text-xs text-muted-foreground">No approved stall applications yet.</p>}
          <div className="space-y-2">{approved.map(renderRow)}</div>
        </div>
      </Card>

      <Card className="p-4 border-border/60 lg:col-span-3 bg-white">
        <h3 className="font-display font-bold text-navy mb-3">Venue overview</h3>
        <div className="space-y-4">
          {blocks.map((b) => (
            <div key={b.id} className="border border-border rounded-lg p-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{b.kind} · <span className="font-mono">{b.code}</span></p>
              <p className="font-semibold text-navy">{b.name}</p>
              {b.stalls.length > 0 && <div className="mt-2"><StallGrid stalls={b.stalls} compact onDelete={() => {}} /></div>}
              {b.sections.map((s: any) => (
                <div key={s.id} className="mt-3">
                  <p className="text-[11px] font-semibold text-navy"><span className="font-mono">{s.code}</span> · {s.name}</p>
                  {s.stalls.length > 0 && <div className="mt-1"><StallGrid stalls={s.stalls} compact onDelete={() => {}} /></div>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>

      <AssignStallDialog
        app={assigning}
        eventId={eventId}
        onClose={() => setAssigning(null)}
        allStalls={allStalls}
        blocks={blocks}
        onChange={() => { onChange(); fetchApps(); }}
      />
    </div>
  );
}

function AssignStallDialog({ app, eventId, onClose, allStalls, blocks, onChange }: {
  app: any | null; eventId: string; onClose: () => void;
  allStalls: any[]; blocks: any[]; onChange: () => void;
}) {
  const [isAssigning, setIsAssigning] = useState(false);
  if (!app) return null;
  const isPending = app.status === "pending";
  
  // FE FIX: Ensure we have the Employer ID from the application
  const targetEmployerId = app.employer_id || app.employerId;

  async function pick(stallId: string) {
    if (!targetEmployerId) {
      toast.error("Database mismatch: Backend must return 'e.id as employer_id' in stall-applications route.");
      return;
    }

    setIsAssigning(true);
    try {
      // Unified backend endpoint that handles both stall assigning and application approving!
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/stalls/${stallId}/allocate`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employerId: targetEmployerId, eventId })
      });
      const json = await res.json();
      if (json.success) {
        toast.success(isPending ? `${app.employerName} approved & stall allocated!` : `Stall reassigned successfully!`);
        onClose(); onChange();
      } else {
        toast.error(json.message || "Failed to allocate stall");
      }
    } catch (e) {
      toast.error("Failed to connect to server");
    } finally {
      setIsAssigning(false);
    }
  }

  async function release() {
    const current = allStalls.find((x) => x.stall.allocatedToAppId == targetEmployerId);
    if (current) {
      setIsAssigning(true);
      try {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/stalls/${current.stall.id}/allocate`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employerId: null, eventId }) // Pass null to release it
        });
        toast.success(`Released stall from ${app.employerName}`);
        onClose(); onChange();
      } catch (e) {
        toast.error("Failed to release stall");
      } finally {
        setIsAssigning(false);
      }
    }
  }

  return (
    <Dialog open={!!app} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>{isPending ? "Approve & allocate stall" : "Change stall"} — {app.employerName}</DialogTitle>
          <DialogDescription>
            {isPending
              ? "Pick a stall to approve this application and allocate the stall in one step."
              : "Pick another empty stall to reassign, or release the current one."}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs grid sm:grid-cols-2 gap-y-1">
          <div><span className="font-semibold text-navy">Company:</span> {app.employerName}</div>
          <div><span className="font-semibold text-navy">Email:</span> {app.contactEmail}</div>
        </div>

        {allStalls.length === 0 ? (
          <p className="text-xs text-muted-foreground py-6 text-center">No stalls created yet. Build the venue first.</p>
        ) : (
          <div className="space-y-3">
            {blocks.map((b) => {
              const rows = allStalls.filter((x) => x.blockCode === b.code);
              if (rows.length === 0) return null;
              return (
                <div key={b.id}>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">{b.kind} · <span className="font-mono">{b.code}</span></p>
                  <div className="grid sm:grid-cols-4 gap-2">
                    {rows.map(({ stall, blockCode, sectionCode }) => {
                      const taken = !!stall.allocatedToAppId && stall.allocatedToAppId != targetEmployerId;
                      const mine = stall.allocatedToAppId == targetEmployerId;
                      return (
                        <button
                          key={stall.id}
                          disabled={taken || isAssigning}
                          onClick={() => pick(stall.id)}
                          className={`p-2 rounded-lg border-2 text-left transition ${
                            mine ? "border-india-green bg-india-green/10" :
                            taken ? "border-border bg-muted/50 opacity-50 cursor-not-allowed" :
                            "border-dashed border-navy/40 hover:border-navy hover:bg-navy/5"
                          }`}
                        >
                          <p className="font-mono text-xs text-navy font-bold">{stall.code}</p>
                          <p className="text-[10px] text-muted-foreground">{blockCode}{sectionCode ? ` · ${sectionCode}` : ""}</p>
                          {taken && <p className="text-[10px] text-red-600 truncate">{stall.allocatedName}</p>}
                          {mine && <p className="text-[10px] text-india-green font-semibold">Current</p>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <DialogFooter>
          {!isPending && <Button variant="outline" className="text-red-600" onClick={release} disabled={isAssigning}>Release current</Button>}
          <Button variant="outline" onClick={onClose} disabled={isAssigning}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
