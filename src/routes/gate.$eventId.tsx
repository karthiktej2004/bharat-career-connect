import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { TricolorBar } from "@/components/Brand";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  QrCode, User, Building2, Search, Phone, ShieldCheck, CheckCircle2,
  Calendar, MapPin, Store, ArrowRight,
} from "lucide-react";
import {
  SEED_EVENTS, listStallApplications, markStallAttendance,
  type StallApplication,
} from "@/lib/mockStore";
import { toast } from "sonner";

export const Route = createFileRoute("/gate/$eventId")({
  head: () => ({ meta: [{ title: "Event Gate — Bharat Career Connect" }] }),
  component: GatePage,
});

type Step = "role" | "company" | "otp" | "preview" | "success";

function GatePage() {
  const { eventId } = Route.useParams();
  const navigate = useNavigate();
  const event = SEED_EVENTS.find((e) => e.id === eventId) ?? SEED_EVENTS[0];

  const approvedStalls = useMemo<StallApplication[]>(
    () => listStallApplications().filter((s) => s.eventId === event.id && s.status === "approved"),
    [event.id],
  );

  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<"candidate" | "employer" | null>(null);
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState<StallApplication | null>(null);
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState<string | null>(null);

  const filtered = approvedStalls.filter((s) =>
    s.employerName.toLowerCase().includes(search.toLowerCase()),
  );

  function sendOtp() {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setSent(code);
    toast.success(`OTP sent to ${picked?.contactPhone ?? "your registered mobile"}`, {
      description: `Demo OTP: ${code}`,
    });
    setStep("otp");
  }

  function verifyOtp() {
    if (otp.trim() !== sent) { toast.error("Incorrect OTP"); return; }
    setStep("preview");
  }

  function markPresent() {
    if (!picked) return;
    const res = markStallAttendance(picked.id, picked.attendanceCode ?? "");
    if (!res.ok) { toast.error(res.reason ?? "Could not mark attendance"); return; }
    toast.success("Attendance marked. Workspace unlocked ✓");
    setStep("success");
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-xl px-4 py-8">
        <Badge variant="outline" className="mb-3 gap-1"><QrCode className="h-3 w-3" /> Event Gate Check-in</Badge>
        <h1 className="text-2xl font-bold text-navy font-display">{event.title}</h1>
        <p className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-1">
          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(event.date).toLocaleDateString("en-IN", { dateStyle: "medium" })}</span>
          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{event.venue}</span>
        </p>

        <Card className="mt-6 border-border/60 overflow-hidden">
          <TricolorBar />
          <div className="p-6">
            {step === "role" && (
              <>
                <h2 className="font-display font-bold text-navy mb-1">Who are you?</h2>
                <p className="text-xs text-muted-foreground mb-4">Pick your role to continue check-in.</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => { setRole("candidate"); navigate({ to: "/candidate/events" }); }}
                    className="rounded-xl border-2 border-border hover:border-saffron p-5 text-left transition"
                  >
                    <User className="h-6 w-6 text-saffron mb-2" />
                    <p className="font-display font-semibold text-navy">I am a Candidate</p>
                    <p className="text-xs text-muted-foreground mt-1">Open your pass and get in-line.</p>
                  </button>
                  <button
                    onClick={() => { setRole("employer"); setStep("company"); }}
                    className="rounded-xl border-2 border-border hover:border-india-green p-5 text-left transition"
                  >
                    <Building2 className="h-6 w-6 text-india-green mb-2" />
                    <p className="font-display font-semibold text-navy">I am an Employer</p>
                    <p className="text-xs text-muted-foreground mt-1">Find your company and mark your stall present.</p>
                  </button>
                </div>
              </>
            )}

            {step === "company" && (
              <>
                <h2 className="font-display font-bold text-navy mb-1">Find your company</h2>
                <p className="text-xs text-muted-foreground mb-3">Only approved stalls for this event are listed.</p>
                <div className="relative mb-3">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search company name…" className="pl-9" />
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No approved stalls match.</p>}
                  {filtered.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => { setPicked(s); sendOtp(); }}
                      className="w-full flex items-center justify-between gap-3 rounded-lg border border-border hover:border-india-green p-3 text-left transition"
                    >
                      <div>
                        <p className="font-semibold text-navy text-sm">{s.employerName}</p>
                        <p className="text-xs text-muted-foreground">Stall {s.stallNo} · {s.hall}</p>
                      </div>
                      {s.attended ? <Badge className="bg-india-green text-white">Present</Badge> : <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === "otp" && picked && (
              <>
                <h2 className="font-display font-bold text-navy mb-1 flex items-center gap-2"><Phone className="h-4 w-4 text-saffron" /> Verify mobile</h2>
                <p className="text-xs text-muted-foreground mb-4">OTP sent to <span className="font-semibold text-navy">{picked.contactPhone}</span> registered for <span className="font-semibold text-navy">{picked.employerName}</span>.</p>
                <Label>6-digit OTP</Label>
                <Input value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} inputMode="numeric" placeholder="••••••" className="mt-1 font-mono text-center text-lg tracking-widest" />
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" className="flex-1" onClick={sendOtp}>Resend OTP</Button>
                  <Button className="flex-1 bg-india-green text-white hover:bg-india-green/90" onClick={verifyOtp}>Verify</Button>
                </div>
              </>
            )}

            {step === "preview" && picked && (
              <>
                <h2 className="font-display font-bold text-navy mb-3">Confirm & mark present</h2>
                <div className="rounded-lg bg-muted/40 p-4 space-y-2 text-sm">
                  <p className="flex items-center gap-2 text-navy font-semibold"><Building2 className="h-4 w-4" /> {picked.employerName}</p>
                  <p className="text-xs text-muted-foreground">Contact: {picked.contactName} · {picked.contactPhone}</p>
                  <p className="text-xs text-muted-foreground">Roles to hire: {picked.rolesToHire}</p>
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div><p className="text-[10px] uppercase text-muted-foreground">Stall</p><p className="font-display font-bold text-navy">{picked.stallNo}</p></div>
                    <div><p className="text-[10px] uppercase text-muted-foreground">Hall</p><p className="font-medium text-navy">{picked.hall}</p></div>
                    <div><p className="text-[10px] uppercase text-muted-foreground">Code</p><p className="font-mono font-bold text-navy text-xs">{picked.attendanceCode}</p></div>
                  </div>
                </div>
                <Button className="w-full mt-4 bg-india-green text-white hover:bg-india-green/90" onClick={markPresent}>
                  <ShieldCheck className="h-4 w-4 mr-1" /> Mark as Present
                </Button>
              </>
            )}

            {step === "success" && picked && (
              <div className="text-center">
                <div className="mx-auto size-14 rounded-full bg-india-green/15 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-india-green" />
                </div>
                <h2 className="mt-3 font-display font-bold text-india-green text-lg">Entry Successful</h2>
                <p className="text-xs text-muted-foreground mt-1">{new Date().toLocaleString("en-IN")}</p>
                <div className="mt-4 rounded-xl border-2 border-india-green/40 bg-india-green/5 p-4 grid grid-cols-3 gap-2 text-sm">
                  <div><p className="text-[10px] uppercase text-muted-foreground">Stall</p><p className="font-display font-bold text-navy">{picked.stallNo}</p></div>
                  <div><p className="text-[10px] uppercase text-muted-foreground">Hall</p><p className="font-medium text-navy">{picked.hall}</p></div>
                  <div><p className="text-[10px] uppercase text-muted-foreground">Code</p><p className="font-mono font-bold text-navy text-xs">{picked.attendanceCode}</p></div>
                </div>
                {picked.gateInstructions && (
                  <p className="text-xs text-muted-foreground mt-3 flex items-start gap-1.5 text-left"><Store className="h-3.5 w-3.5 mt-0.5 text-saffron shrink-0" /> {picked.gateInstructions}</p>
                )}
                <Button asChild className="w-full mt-5 bg-navy text-white hover:bg-navy/90">
                  <Link to="/employer/events">Back to Job Fair panel</Link>
                </Button>
              </div>
            )}
          </div>
        </Card>

        <p className="text-[11px] text-muted-foreground text-center mt-4">Demo gate flow — normally opens after scanning the event QR at the venue.</p>
      </main>
      <SiteFooter />
    </>
  );
}
