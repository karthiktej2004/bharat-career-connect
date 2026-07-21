import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DashShell, PageHeader, StatCard } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QrCode, CheckCircle2, Users, Building2, User as UserIcon, Download, Calendar, MapPin, FileDown, MapPinned, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/qr")({
  head: () => ({ meta: [{ title: "QR & Entry — Admin" }] }),
  component: QR,
});

function QR() {
  const [events, setEvents] = useState<any[]>([]);
  const [scans, setScans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, candidate: 0, employer: 0 });
  const [roleAsk, setRoleAsk] = useState<{ open: boolean; code: string; event: any | null }>({ open: false, code: "", event: null });

  // Fetch Live and Upcoming Events from PostgreSQL
  useEffect(() => {
    const fetchQRData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/events");
        const json = await res.json();
        if (json.success) {
          // Filter out completed events for the scanner dashboard
          setEvents(json.data.filter((e: any) => e.status !== "completed"));
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
        toast.error("Failed to load events");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQRData();
  }, []);

  // Placeholder function for the actual scan endpoint we will build
  function verify(event: any, code: string) {
    if (!code.trim()) { toast.error("Enter or scan an ID"); return; }
    setRoleAsk({ open: true, code: code.trim(), event });
  }

  // Placeholder for real backend verification
  async function confirmRole(role: "candidate" | "employer") {
    const { code, event } = roleAsk;
    if (!event) return;
    
    // We will wire this to a real endpoint in the next sprint
    toast.success(`✓ ${code} checked in via simulation`, { description: `${event.name} · ${role}` });
    
    // Simulate updating local stats
    setStats(prev => ({
      total: prev.total + 1,
      candidate: role === 'candidate' ? prev.candidate + 1 : prev.candidate,
      employer: role === 'employer' ? prev.employer + 1 : prev.employer
    }));
    
    setRoleAsk({ open: false, code: "", event: null });
  }

  return (
    <DashShell role="admin" nav={adminNav}>
      <PageHeader title="QR & Entry Management" description="One scanner per event. Track today's check-ins and allocate venue stalls." />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Today's Total Check-ins" value={String(stats.total)} icon={CheckCircle2} accent="india-green" />
        <StatCard label="Candidate Check-ins" value={String(stats.candidate)} icon={Users} accent="india-green" />
        <StatCard label="Employer Check-ins" value={String(stats.employer)} icon={Building2} accent="navy" />
      </div>

      <h2 className="font-display font-bold text-navy text-lg mb-3">Event entry scanners</h2>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
        {isLoading ? (
          <div className="col-span-full py-10 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-navy" /></div>
        ) : events.length === 0 ? (
          <div className="col-span-full py-10 text-center text-muted-foreground bg-white rounded-xl border border-border">No upcoming or live events found.</div>
        ) : (
          events.map((e) => (
            <EventScannerCard key={e.id} event={e} onVerify={verify} todayCount={0} />
          ))
        )}
      </div>

      <ScanHistory scans={scans} />

      <Dialog open={roleAsk.open} onOpenChange={(o) => !o && setRoleAsk({ open: false, code: "", event: null })}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm the role</DialogTitle>
            <DialogDescription>
              Scanned ID: <span className="font-mono">{roleAsk.code}</span>
              {roleAsk.event && <span className="block mt-1 text-xs">{roleAsk.event.name}</span>}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => confirmRole("candidate")} className="p-4 rounded-lg border-2 border-border hover:border-india-green hover:bg-india-green/5 transition text-center">
              <UserIcon className="h-8 w-8 mx-auto text-india-green mb-2" />
              <p className="font-semibold text-navy">Candidate</p>
            </button>
            <button onClick={() => confirmRole("employer")} className="p-4 rounded-lg border-2 border-border hover:border-navy hover:bg-navy/5 transition text-center">
              <Building2 className="h-8 w-8 mx-auto text-navy mb-2" />
              <p className="font-semibold text-navy">Employer</p>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </DashShell>
  );
}

function EventScannerCard({ event, onVerify: _onVerify, todayCount }: { event: any; onVerify: (e: any, code: string) => void; todayCount: number }) {
  const navigate = useNavigate();
  // We use the secure QR code string generated by the Postgres database
  const qrValue = event.qr_code_string;

  function downloadPoster() {
    const svg = document.getElementById(`qr-${event.id}`);
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${event.name} — Gate QR</title>
      <style>body{font-family:system-ui,sans-serif;text-align:center;padding:40px;color:#0B2A5B}
      h1{margin:0 0 4px}h2{margin:0 0 20px;color:#666;font-weight:400}
      .qr{display:inline-block;padding:24px;border:3px solid #FF9933;border-radius:16px;background:#fff}
      .foot{margin-top:24px;font-size:14px;color:#333}</style></head>
      <body><h1>${event.name}</h1><h2>${event.venue_address} · ${new Date(event.event_date).toDateString()}</h2>
      <div class="qr">${svgStr}</div>
      <p class="foot"><strong>Scan at the entry gate</strong><br/>Code: ${qrValue}</p>
      <script>window.onload=()=>window.print()</script></body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  const isEventDay = event.status === "live";

  return (
    <Card className="p-5 border-border/60 flex flex-col">
      <div className="flex items-start justify-between mb-2 gap-2">
        <div className="min-w-0">
          <h3 className="font-display font-bold text-navy truncate">{event.name}</h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Calendar className="h-3 w-3" />{new Date(event.event_date).toDateString()}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 truncate"><MapPin className="h-3 w-3 shrink-0" />{event.venue_address}</p>
        </div>
        <Badge className={event.status === "live" ? "bg-india-green/15 text-india-green uppercase" : "bg-saffron/15 text-saffron uppercase"}>{event.status}</Badge>
      </div>

      <div className="flex items-center gap-4 my-3">
        <div className="bg-white p-2 rounded-lg border-2 border-saffron/40 shrink-0">
          <QRCodeSVG id={`qr-${event.id}`} value={qrValue || "BCC-QR"} size={110} bgColor="#ffffff" fgColor="#0B2A5B" />
        </div>
        <div className="min-w-0 flex-1">
          {isEventDay ? (
            <>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Today's check-ins</p>
              <p className="text-2xl font-bold text-india-green">{todayCount}</p>
            </>
          ) : (
            <>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Check-ins open on</p>
              <p className="text-sm font-semibold text-navy">{new Date(event.event_date).toDateString()}</p>
            </>
          )}
          <Button size="sm" variant="outline" onClick={downloadPoster} className="mt-2 w-full">
            <Download className="h-3.5 w-3.5 mr-1" /> Print / Download
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-border/60">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Event ID</p>
          <p className="font-mono text-xs text-navy truncate">EVT-{event.id}</p>
        </div>
        <Button
          onClick={() => navigate({ to: "/admin/allocation/$eventId", params: { eventId: event.id.toString() } })}
          className="bg-navy text-white hover:bg-navy/90" size="sm"
        >
          <MapPinned className="h-4 w-4 mr-1" /> Stall Allocation
        </Button>
      </div>
    </Card>
  );
}

function ScanHistory({ scans }: { scans: any[] }) {
  const [filter, setFilter] = useState<"all" | "candidate" | "employer">("all");
  const filtered = filter === "all" ? scans : scans.filter((s) => s.role === filter);

  function downloadWord(role: "candidate" | "employer") {
    toast.success(`${role === 'candidate' ? 'Candidate' : 'Employer'} Attendance document downloaded`);
  }

  return (
    <Card className="p-5 border-border/60">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="font-display font-bold text-navy text-lg flex items-center gap-2"><QrCode className="h-5 w-5" /> Attendance history</h2>
          <p className="text-xs text-muted-foreground">All scans across all events. Download as Word for records.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "candidate", "employer"] as const).map((f) => (
            <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)} className={filter === f ? "bg-navy text-white" : ""}>
              {f === "all" ? "All" : f === "candidate" ? "Candidates" : "Employers"}
            </Button>
          ))}
          <Button size="sm" variant="outline" onClick={() => downloadWord("candidate")}>
            <FileDown className="h-4 w-4 mr-1" /> Candidates .doc
          </Button>
          <Button size="sm" variant="outline" onClick={() => downloadWord("employer")}>
            <FileDown className="h-4 w-4 mr-1" /> Employers .doc
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-widest text-muted-foreground border-b">
              <th className="py-2 pr-3">Time</th>
              <th className="py-2 pr-3">ID</th>
              <th className="py-2 pr-3">Name</th>
              <th className="py-2 pr-3">Event</th>
              <th className="py-2 pr-3">Role</th>
              <th className="py-2 pr-3">Gate</th>
              <th className="py-2 pr-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="py-6 text-center text-muted-foreground">Live tracking disabled pending database sync.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}