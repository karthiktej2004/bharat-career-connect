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
  Store, Layers, LayoutGrid, CheckCircle2, XCircle, Sparkles, MapPinned, Pencil, Hash, Loader2
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

  // Real data state
  const [event, setEvent] = useState<any | null>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [openBlock, setOpenBlock] = useState<string | null>(null);
  const [stats, setStats] = useState({ blocks: 0, total: 0, allocated: 0, empty: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async () => {
    try {
      // Fetch Event details
      const eventRes = await fetch("http://localhost:5000/api/admin/events");
      const eventJson = await eventRes.json();
      if (eventJson.success) {
        // Using loose equality (==) in case eventId string mismatches integer DB ID
        const currentEvent = eventJson.data.find((e: any) => e.id == eventId);
        setEvent(currentEvent);
      }

      // Fetch Blocks and Venue structure
      const venueRes = await fetch(`http://localhost:5000/api/admin/events/${eventId}/venue`);
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

  useEffect(() => {
    refresh();
  }, [eventId]);

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

  // FIX: Using loose equality (==) to solve the click-to-open bug!
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
            <BlockInterior
              block={activeBlock}
              eventId={eventId}
              onBack={() => setOpenBlock(null)}
              onChange={refresh}
            />
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

/* ------------------------- Builder — top level ------------------------- */
function BuilderTop({ blocks, eventId, onOpen, onChange }: { blocks: any[]; eventId: string; onOpen: (id: string) => void; onChange: () => void }) {
  const [addOpen, setAddOpen] = useState(false);
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-display font-bold text-navy text-lg">Venue structure</h2>
          <p className="text-xs text-muted-foreground">Create the big containers first — buildings, halls, grounds or blocks. Click one to add rooms and stalls inside.</p>
        </div>
        <Button className="bg-saffron text-navy hover:bg-saffron/90" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Block / Hall
        </Button>
      </div>

      {blocks.length === 0 ? (
        <Card className="p-10 text-center border-dashed border-2 border-border">
          <Boxes className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="font-semibold text-navy">No blocks yet</p>
          <p className="text-xs text-muted-foreground mt-1">Add your first Building, Hall, Ground or Block to start laying out the venue.</p>
          <Button className="mt-4 bg-saffron text-navy hover:bg-saffron/90" onClick={() => setAddOpen(true)}>
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
    <button
      onClick={onOpen}
      className={`group relative text-left rounded-2xl border-2 ${meta.border} bg-gradient-to-br ${meta.color} p-5 h-52 flex flex-col justify-between transition-all hover:scale-[1.02] hover:shadow-xl hover:ring-4 ${meta.ring}`}
    >
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
  
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !code.trim()) { toast.error("Name and code are required"); return; }
    
    try {
      const res = await fetch(`http://localhost:5000/api/admin/events/${eventId}/blocks`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, name: name.trim(), code: code.trim() })
      });
      if (res.ok) {
        toast.success(`${kind} "${name}" added`);
        setName(""); setCode(""); onOpenChange(false); onChange();
      } else {
        toast.error("Failed to save block to database");
      }
    } catch (err) { toast.error("Server connection failed"); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
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
                const active = kind === k;
                return (
                  <button type="button" key={k} onClick={() => setKind(k)}
                    className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition ${active ? "border-navy bg-navy/5" : "border-border hover:border-navy/30"}`}>
                    <M className="h-5 w-5 text-navy" />
                    <span className="text-[11px] font-semibold text-navy">{k}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="IT Hall" className="mt-1" />
            </div>
            <div>
              <Label>Code *</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Block-A" className="mt-1 font-mono" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-saffron text-navy hover:bg-saffron/90">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------- Builder — inside a block ------------------------- */
function BlockInterior({ block, eventId, onBack, onChange }: { block: any; eventId: string; onBack: () => void; onChange: () => void }) {
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [addStallsOpen, setAddStallsOpen] = useState<{ open: boolean; sectionId: string | null }>({ open: false, sectionId: null });
  const [editBlockOpen, setEditBlockOpen] = useState(false);
  const [editSection, setEditSection] = useState<{ id: string; name: string; code: string } | null>(null);
  const meta = KIND_META[block.kind] || KIND_META['Hall'];
  const Icon = meta.icon;

  async function editStall(stallId: string, currentCode: string, sectionId?: string) {
    const v = prompt("Edit stall code", currentCode);
    if (v == null) return;
    const trimmed = v.trim();
    if (!trimmed) return toast.error("Code cannot be empty");
    toast.success(`Backend update required for rename. Current Value: ${trimmed}`);
  }

  function renumber(sectionId?: string) {
    const prefix = prompt("New prefix for all stalls (e.g. Stall, A, H)", "Stall");
    if (!prefix) return;
    toast.success(`Backend bulk renumber required`);
  }

  async function handleDeleteBlock() {
    if (!confirm(`Delete "${block.name}"? This removes all its stalls.`)) return;
    await fetch(`http://localhost:5000/api/admin/blocks/${block.id}`, { method: 'DELETE' });
    toast.success("Block deleted");
    onChange(); onBack();
  }

  async function handleDeleteStall(stallId: string) {
    if (!confirm("Delete this stall?")) return;
    await fetch(`http://localhost:5000/api/admin/stalls/${stallId}`, { method: 'DELETE' });
    onChange();
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
          <Button size="sm" variant="ghost" onClick={() => setEditBlockOpen(true)} className="text-navy">
            <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
          </Button>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={() => setAddSectionOpen(true)}><Layers className="h-4 w-4 mr-1" /> Add room / sub-hall</Button>
          <Button size="sm" className="bg-navy text-white hover:bg-navy/90" onClick={() => setAddStallsOpen({ open: true, sectionId: null })}>
            <Plus className="h-4 w-4 mr-1" /> Add stalls here
          </Button>
          <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={handleDeleteBlock}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {block.stalls.length > 0 && (
        <Card className="p-5 mb-5 border-border/60">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h3 className="font-semibold text-navy text-sm uppercase tracking-widest">Stalls directly in {block.name}</h3>
            <div className="flex gap-2 items-center">
              <Button size="sm" variant="outline" onClick={() => renumber()}><Hash className="h-3.5 w-3.5 mr-1" /> Renumber all</Button>
              <Badge variant="outline">{block.stalls.length} stalls</Badge>
            </div>
          </div>
          <StallGrid stalls={block.stalls} onDelete={handleDeleteStall} onEdit={(sid, code) => editStall(sid, code)} />
        </Card>
      )}

      {block.sections.length === 0 && block.stalls.length === 0 && (
        <Card className="p-10 text-center border-dashed border-2 border-border">
          <Layers className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="font-semibold text-navy">Empty {block.kind.toLowerCase()}</p>
          <p className="text-xs text-muted-foreground mt-1">Add rooms/sub-halls, or place stalls directly here.</p>
        </Card>
      )}

      {block.sections.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {block.sections.map((s: any) => (
            <Card key={s.id} className="p-4 border-border/60 border-l-4 border-l-saffron">
              <div className="flex items-start justify-between mb-3 gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">{s.code}</p>
                  <h4 className="font-display font-bold text-navy truncate">{s.name}</h4>
                  <p className="text-xs text-muted-foreground">{s.stalls.length} stalls</p>
                </div>
                <div className="flex gap-1 flex-wrap justify-end">
                  <Button size="sm" variant="ghost" className="text-navy" onClick={() => setEditSection({ id: s.id, name: s.name, code: s.code })}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => renumber(s.id)} title="Renumber stalls">
                    <Hash className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setAddStallsOpen({ open: true, sectionId: s.id })}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Stalls
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => { if(confirm("Delete room?")) { toast.success("Backend required"); } }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              {s.stalls.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No stalls yet in this room.</p>
              ) : (
                <StallGrid stalls={s.stalls} compact onDelete={handleDeleteStall} onEdit={(sid, code) => editStall(sid, code, s.id)} />
              )}
            </Card>
          ))}
        </div>
      )}

      <AddSectionDialog open={addSectionOpen} onOpenChange={setAddSectionOpen} block={block} onChange={onChange} />
      <AddStallsDialog
        open={addStallsOpen.open}
        onOpenChange={(o) => setAddStallsOpen({ open: o, sectionId: o ? addStallsOpen.sectionId : null })}
        block={block}
        sectionId={addStallsOpen.sectionId}
        eventId={eventId}
        onChange={onChange}
      />
      <EditBlockDialog open={editBlockOpen} onOpenChange={setEditBlockOpen} block={block} />
      <EditSectionDialog section={editSection} blockId={block.id} onClose={() => setEditSection(null)} />
    </div>
  );
}

function EditBlockDialog({ open, onOpenChange, block }: { open: boolean; onOpenChange: (o: boolean) => void; block: any }) {
  const [kind, setKind] = useState(block.kind);
  const [name, setName] = useState(block.name);
  const [code, setCode] = useState(block.code);
  useEffect(() => { if (open) { setKind(block.kind); setName(block.name); setCode(block.code); } }, [open, block]);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return toast.error("Name and code required");
    toast.success("Backend block update required");
    onOpenChange(false);
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit block</DialogTitle>
          <DialogDescription>Update the type, name and code. Existing rooms and stalls stay in place.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label className="text-xs uppercase tracking-widest">Type</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {(Object.keys(KIND_META)).map((k) => {
                const M = KIND_META[k].icon;
                const active = kind === k;
                return (
                  <button type="button" key={k} onClick={() => setKind(k)}
                    className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition ${active ? "border-navy bg-navy/5" : "border-border hover:border-navy/30"}`}>
                    <M className="h-5 w-5 text-navy" />
                    <span className="text-[11px] font-semibold text-navy">{k}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" /></div>
            <div><Label>Code *</Label><Input value={code} onChange={(e) => setCode(e.target.value)} className="mt-1 font-mono" /></div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-navy text-white hover:bg-navy/90">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditSectionDialog({ section, blockId, onClose }: { section: { id: string; name: string; code: string } | null; blockId: string; onClose: () => void }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  useEffect(() => { if (section) { setName(section.name); setCode(section.code); } }, [section]);
  if (!section) return null;
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return toast.error("Name and code required");
    toast.success("Backend room update required");
    onClose();
  }
  return (
    <Dialog open={!!section} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit room / sub-hall</DialogTitle>
          <DialogDescription>Existing stalls inside stay unchanged.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div><Label>Name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" /></div>
          <div><Label>Code *</Label><Input value={code} onChange={(e) => setCode(e.target.value)} className="mt-1 font-mono" /></div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-navy text-white hover:bg-navy/90">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function StallGrid({ stalls, compact, onDelete, onEdit }: { stalls: any[]; compact?: boolean; onDelete: (id: string) => void; onEdit?: (id: string, code: string) => void }) {
  return (
    <div className={`grid gap-2 ${compact ? "grid-cols-4" : "grid-cols-5 md:grid-cols-8"}`}>
      {stalls.map((s) => (
        <div
          key={s.id}
          className={`group relative aspect-square rounded-lg border-2 flex flex-col items-center justify-center text-center p-1 ${
            s.allocatedToAppId ? "border-india-green bg-india-green/10" : "border-dashed border-border bg-muted/30"
          }`}
          title={s.allocatedName ?? "Empty"}
        >
          <span className="font-mono text-[10px] font-bold text-navy leading-tight">{s.code}</span>
          {s.allocatedName ? (
            <span className="text-[9px] text-india-green line-clamp-2 leading-tight mt-0.5">{s.allocatedName}</span>
          ) : (
            <span className="text-[9px] text-muted-foreground">Empty</span>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(s.id, s.code)}
              className="absolute -top-1.5 -left-1.5 size-4 rounded-full bg-navy text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
              title="Edit code"
            ><Pencil className="h-2.5 w-2.5" /></button>
          )}
          <button
            onClick={() => onDelete(s.id)}
            className="absolute -top-1.5 -right-1.5 size-4 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition text-[10px] flex items-center justify-center"
          >×</button>
        </div>
      ))}
    </div>
  );
}

function AddSectionDialog({ open, onOpenChange, block, onChange }: { open: boolean; onOpenChange: (o: boolean) => void; block: any, onChange: () => void }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return toast.error("Name and code required");
    
    await fetch(`http://localhost:5000/api/admin/blocks/${block.id}/rooms`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), code: code.trim() })
    });
    
    toast.success(`Added ${name} in ${block.name}`);
    setName(""); setCode(""); onOpenChange(false); onChange();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add room / sub-hall in {block.name}</DialogTitle>
          <DialogDescription>Optional intermediate layer between the block and its stalls.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div><Label>Name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Interview Room 1" className="mt-1" /></div>
          <div><Label>Code *</Label><Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Room-01" className="mt-1 font-mono" /></div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-saffron text-navy hover:bg-saffron/90">Add</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddStallsDialog({ open, onOpenChange, block, sectionId, eventId, onChange }: { open: boolean; onOpenChange: (o: boolean) => void; block: any; sectionId: string | null; eventId: string; onChange: () => void }) {
  const [count, setCount] = useState(6);
  const [prefix, setPrefix] = useState("Stall");
  const target = sectionId ? block.sections.find((s: any) => s.id == sectionId)?.name : block.name;
  
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (count < 1 || count > 200) return toast.error("Enter 1 to 200");
    
    await fetch(`http://localhost:5000/api/admin/events/${eventId}/stalls`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockId: block.id, roomId: sectionId, count, prefix: prefix.trim() || "Stall" })
    });
    
    toast.success(`${count} stalls added to ${target}`);
    onOpenChange(false); onChange();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add stalls to {target}</DialogTitle>
          <DialogDescription>Stalls will be auto-numbered like {prefix}-01, {prefix}-02…</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label>How many stalls?</Label>
            <Input type="number" min={1} max={200} value={count} onChange={(e) => setCount(Number(e.target.value))} className="mt-1" />
          </div>
          <div>
            <Label>Code prefix</Label>
            <Input value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="Stall" className="mt-1 font-mono" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-navy text-white hover:bg-navy/90">Create {count} stalls</Button>
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
      const res = await fetch(`http://localhost:5000/api/admin/events/${eventId}/applications`);
      const json = await res.json();
      if (json.success) setApps(json.data);
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
      <Card className="p-10 text-center border-dashed border-2 border-border">
        <Boxes className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
        <p className="font-semibold text-navy">Build the venue first</p>
        <p className="text-xs text-muted-foreground mt-1">Go to the Venue Builder tab and add blocks & stalls before allocating companies.</p>
      </Card>
    );
  }

  const pending = apps.filter((a) => a.status === "pending");
  const approved = apps.filter((a) => a.status === "approved" || a.status === "live");

  function reject(a: any) {
    if (!confirm(`Reject ${a.employerName}?`)) return;
    toast.success("Application rejected (Backend required)");
  }

  const renderRow = (a: any) => {
    const currentStall = allStalls.find((x) => x.stall.allocatedToAppId == a.employer_id);
    const isPending = a.status === "pending";
    return (
      <div key={a.id} className={`p-3 rounded-lg border flex items-start justify-between gap-2 ${isPending ? "border-saffron/50 bg-saffron/5" : "border-border"}`}>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-navy text-sm truncate">{a.employerName}</p>
            {isPending && <Badge className="bg-saffron/20 text-saffron">Pending approval</Badge>}
          </div>
          <p className="text-xs text-muted-foreground truncate">{a.rolesToHire} · needs {a.candidatesNeeded}</p>
          <p className="text-[11px] text-muted-foreground">{a.contactName} · {a.contactPhone}</p>
          {currentStall ? (
            <Badge className="bg-india-green/15 text-india-green mt-1">
              <CheckCircle2 className="h-3 w-3 mr-1" /> {currentStall.blockCode}{currentStall.sectionCode ? ` · ${currentStall.sectionCode}` : ""} · {currentStall.stall.code}
            </Badge>
          ) : (
            <Badge className="bg-saffron/15 text-saffron mt-1"><XCircle className="h-3 w-3 mr-1" /> Not allocated</Badge>
          )}
        </div>
        <div className="flex flex-col gap-1 items-end">
          <Button size="sm" className="bg-navy text-white hover:bg-navy/90" onClick={() => setAssigning(a)}>
            {isPending ? "Approve & allocate" : currentStall ? "Change stall" : "Allocate"}
          </Button>
          {isPending && (
            <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => reject(a)}>
              Reject
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="grid lg:grid-cols-5 gap-5">
      <Card className="p-4 border-border/60 lg:col-span-2 space-y-4">
        {pending.length > 0 && (
          <div>
            <h3 className="font-display font-bold text-navy mb-2 text-sm uppercase tracking-widest text-saffron">Pending ({pending.length})</h3>
            <div className="space-y-2">{pending.map(renderRow)}</div>
          </div>
        )}
        <div>
          <h3 className="font-display font-bold text-navy mb-2">Approved companies ({approved.length})</h3>
          {approved.length === 0 && <p className="text-xs text-muted-foreground">No approved stall applications yet.</p>}
          <div className="space-y-2">{approved.map(renderRow)}</div>
        </div>
      </Card>

      <Card className="p-4 border-border/60 lg:col-span-3">
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
        onClose={() => setAssigning(null)}
        allStalls={allStalls}
        blocks={blocks}
        onChange={() => { onChange(); fetchApps(); }}
      />
    </div>
  );
}

function AssignStallDialog({ app, onClose, allStalls, blocks, onChange }: {
  app: any | null;
  onClose: () => void;
  allStalls: { stall: any; blockName: string; blockCode: string; sectionName?: string; sectionCode?: string }[];
  blocks: any[];
  onChange: () => void;
}) {
  if (!app) return null;
  const isPending = app.status === "pending";

  async function pick(stallId: string) {
    const row = allStalls.find((x) => x.stall.id === stallId);
    
    await fetch(`http://localhost:5000/api/admin/stalls/${stallId}/allocate`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employerId: app.employer_id })
    });

    toast.success(isPending ? `${app.employerName} approved · ${row?.stall.code ?? ""}` : `Stall changed for ${app.employerName}`);
    onClose(); onChange();
  }

  async function release() {
    const current = allStalls.find((x) => x.stall.allocatedToAppId == app.employer_id);
    if (current) {
      await fetch(`http://localhost:5000/api/admin/stalls/${current.stall.id}/allocate`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employerId: null })
      });
      toast.message(`Released ${app.employerName}`);
    }
    onClose(); onChange();
  }

  return (
    <Dialog open={!!app} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isPending ? "Approve & allocate stall" : "Change stall"} — {app.employerName}</DialogTitle>
          <DialogDescription>
            {isPending
              ? "Pick a stall to approve this application and allocate the stall in one step."
              : "Pick another empty stall to reassign, or release the current one."}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs grid sm:grid-cols-2 gap-y-1">
          <div><span className="font-semibold text-navy">Contact:</span> {app.contactName}</div>
          <div><span className="font-semibold text-navy">Phone:</span> {app.contactPhone}</div>
          <div className="sm:col-span-2"><span className="font-semibold text-navy">Roles:</span> {app.rolesToHire}</div>
          <div><span className="font-semibold text-navy">Candidates to hire:</span> {app.candidatesNeeded}</div>
          {app.preferredZone && <div><span className="font-semibold text-navy">Preferred zone:</span> {app.preferredZone}</div>}
        </div>

        {allStalls.length === 0 ? (
          <p className="text-xs text-muted-foreground py-6 text-center">No stalls created yet. Build the venue in the Venue Builder tab first.</p>
        ) : (
          <div className="space-y-3">
            {blocks.map((b) => {
              const rows = allStalls.filter((x) => x.blockCode === b.code);
              if (rows.length === 0) return null;
              return (
                <div key={b.id}>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">{b.kind} · <span className="font-mono">{b.code}</span> · {b.name}</p>
                  <div className="grid sm:grid-cols-4 gap-2">
                    {rows.map(({ stall, blockCode, sectionCode }) => {
                      const taken = !!stall.allocatedToAppId && stall.allocatedToAppId != app.employer_id;
                      const mine = stall.allocatedToAppId == app.employer_id;
                      return (
                        <button
                          key={stall.id}
                          disabled={taken}
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
                          {mine && <p className="text-[10px] text-india-green">Current</p>}
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
          {!isPending && <Button variant="outline" className="text-red-600" onClick={release}>Release current</Button>}
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}