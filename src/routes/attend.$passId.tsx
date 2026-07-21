import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { TricolorBar } from "@/components/Brand";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ShieldCheck, User, Calendar, MapPin, QrCode } from "lucide-react";
import { SEED_EVENTS } from "@/lib/mockStore";

export const Route = createFileRoute("/attend/$passId")({
  head: () => ({ meta: [{ title: "Entry Verification — Bharat Career Connect" }] }),
  component: AttendPage,
});

function AttendPage() {
  const { passId } = Route.useParams();
  const [entered, setEntered] = useState(false);

  // Mock: derive event from pass id pattern (BCC-<eventId>-XXXX). Fall back to first live event.
  const eventId = passId.split("-").slice(1, -1).join("-");
  const event = SEED_EVENTS.find((e) => e.id.includes(eventId)) ?? SEED_EVENTS.find((e) => e.status === "Live") ?? SEED_EVENTS[0];
  const candidate = { name: "Ramesh Kumar", id: "CAND-2026-8412", phone: "+91 98863 •••••", qual: "BE / B-Tech", location: "Bengaluru" };

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <Badge variant="outline" className="mb-3">Staff · Entry Verification</Badge>
        <h1 className="text-3xl font-bold text-navy font-display">Verify & Grant Entry</h1>
        <p className="text-muted-foreground text-sm mt-1">Scanned pass <span className="font-mono text-navy font-semibold">{passId}</span></p>

        <Card className="mt-6 border-border/60 overflow-hidden">
          <TricolorBar />
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="size-14 rounded-full bg-gradient-to-br from-saffron to-india-green flex items-center justify-center text-white font-bold">
                {candidate.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h2 className="font-display font-bold text-lg text-navy flex items-center gap-2"><User className="h-4 w-4" />{candidate.name}</h2>
                <p className="text-xs font-mono text-muted-foreground">{candidate.id}</p>
                <p className="text-sm text-muted-foreground mt-1">{candidate.qual} · {candidate.location}</p>
              </div>
              <Badge className="bg-india-green text-white">Verified</Badge>
            </div>

            <div className="mt-5 rounded-lg bg-muted/40 p-4 text-sm space-y-2">
              <p className="flex items-center gap-2 text-navy font-semibold"><QrCode className="h-4 w-4" /> {event.title}</p>
              <p className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" /> {new Date(event.date).toLocaleDateString("en-IN", { dateStyle: "full" })}</p>
              <p className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /> {event.venue}</p>
            </div>

            {entered ? (
              <div className="mt-6 rounded-xl border-2 border-india-green bg-india-green/10 p-5 text-center">
                <CheckCircle2 className="h-10 w-10 text-india-green mx-auto" />
                <p className="mt-2 font-display font-bold text-india-green text-lg">Entry Granted</p>
                <p className="text-xs text-muted-foreground mt-1">Time-stamped {new Date().toLocaleTimeString("en-IN")} · Gate 1</p>
                <p className="mt-2 text-sm text-navy">Queue Token: <span className="font-mono font-bold">A-{Math.floor(Math.random() * 200 + 100)}</span></p>
              </div>
            ) : (
              <div className="mt-6 grid sm:grid-cols-2 gap-3">
                <Button onClick={() => setEntered(true)} className="bg-india-green text-white hover:bg-india-green/90">
                  <ShieldCheck className="h-4 w-4 mr-1" /> Grant Entry
                </Button>
                <Button variant="outline">Report Issue</Button>
              </div>
            )}

            <p className="mt-6 text-xs text-muted-foreground text-center">
              Not staff? <Link to="/candidate/events" className="text-navy underline">View my pass instead</Link>
            </p>
          </div>
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
