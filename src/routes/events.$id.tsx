import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { TricolorBar } from "@/components/Brand";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Building2, Users, QrCode, Briefcase } from "lucide-react";
import { SEED_EVENTS, SEED_JOBS } from "@/lib/mockStore";
import { QrPassDialog } from "@/components/QrPassDialog";

export const Route = createFileRoute("/events/$id")({
  loader: ({ params }) => {
    const event = SEED_EVENTS.find((e) => e.id === params.id);
    if (!event) throw notFound();
    return { event };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.event.title ?? "Event"} — Bharat Career Connect` },
      { name: "description", content: loaderData?.event.description ?? "" },
      { property: "og:title", content: loaderData?.event.title ?? "Event" },
      { property: "og:description", content: loaderData?.event.description ?? "" },
    ],
  }),
  notFoundComponent: () => (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-4 py-32 text-center">
        <h1 className="text-3xl font-bold text-navy">Event not found</h1>
        <Button asChild className="mt-6"><Link to="/events">Back to events</Link></Button>
      </div>
      <SiteFooter />
    </>
  ),
  errorComponent: ({ reset }) => (
    <div className="mx-auto max-w-2xl px-4 py-32 text-center">
      <h1 className="text-2xl font-bold text-navy">Couldn't load this event</h1>
      <Button onClick={reset} className="mt-4">Try again</Button>
    </div>
  ),
  component: EventDetail,
});

function EventDetail() {
  const { event } = Route.useLoaderData();
  const jobs = SEED_JOBS.filter((j) => j.eventId === event.id);
  const fill = Math.round((event.registered / event.capacity) * 100);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="gov-gradient text-white">
          <div className="mx-auto max-w-[1440px] px-4 py-14">
            <Badge className="bg-saffron text-navy mb-3">{event.type}</Badge>
            <h1 className="text-3xl lg:text-5xl font-bold">{event.title}</h1>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-white/85 text-sm">
              <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {new Date(event.date).toLocaleDateString("en-IN", { dateStyle: "full" })}</span>
              <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {event.venue}, {event.district}, {event.state}</span>
              <span className="flex items-center gap-2"><Building2 className="h-4 w-4" /> {event.employers} employers</span>
            </div>
          </div>
          <TricolorBar />
        </section>

        <section className="mx-auto max-w-[1440px] px-4 py-12 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 border-border/60">
              <h2 className="font-display font-bold text-navy text-xl mb-2">About this event</h2>
              <p className="text-muted-foreground">{event.description}</p>
            </Card>

            <Card className="p-6 border-border/60">
              <h2 className="font-display font-bold text-navy text-xl mb-4">Jobs at this event ({jobs.length})</h2>
              <div className="space-y-3">
                {jobs.map((j) => (
                  <div key={j.id} className="rounded-lg border border-border/60 p-4 flex items-start justify-between gap-4 hover:bg-muted/40 transition">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-navy">{j.title}</h3>
                        <Badge variant="outline" className="text-xs">Stall {j.stallNo}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{j.company} · {j.location} · {j.type}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {j.skills.map((s) => <span key={s} className="text-xs bg-muted px-2 py-0.5 rounded">{s}</span>)}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-india-green">{j.salary}</p>
                      <Button asChild size="sm" className="mt-2"><Link to="/auth/login">Apply</Link></Button>
                    </div>
                  </div>
                ))}
                {jobs.length === 0 && <p className="text-sm text-muted-foreground">Jobs will be published shortly.</p>}
              </div>
            </Card>
          </div>

          <aside className="space-y-4">
            <Card className="p-6 border-border/60">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Capacity</p>
              <p className="font-display font-bold text-3xl text-navy mt-1">{event.registered.toLocaleString("en-IN")}<span className="text-base text-muted-foreground">/{event.capacity.toLocaleString("en-IN")}</span></p>
              <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-saffron to-india-green" style={{ width: `${fill}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">{fill}% filled · {(event.capacity - event.registered).toLocaleString("en-IN")} seats left</p>
              <Button asChild className="w-full mt-4 bg-saffron text-navy hover:bg-saffron/90"><Link to="/auth/signup">Register Now</Link></Button>
              <QrPassDialog
                passId={`BCC-${event.id}-08412`}
                eventTitle={event.title}
                eventDate={new Date(event.date).toLocaleDateString("en-IN", { dateStyle: "long" })}
                venue={event.venue}
                candidateName="Demo Candidate"
                trigger={<Button variant="outline" className="w-full mt-2"><QrCode className="h-4 w-4 mr-1" /> View my entry pass</Button>}
              />
            </Card>
            <Card className="p-6 border-border/60">
              <h3 className="font-display font-bold text-navy mb-3">What you'll get</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><QrCode className="h-4 w-4 text-saffron mt-0.5" /> QR-based entry pass</li>
                <li className="flex items-start gap-2"><Briefcase className="h-4 w-4 text-saffron mt-0.5" /> Walk-in interviews</li>
                <li className="flex items-start gap-2"><Users className="h-4 w-4 text-saffron mt-0.5" /> AI-matched stall list</li>
                <li className="flex items-start gap-2"><Calendar className="h-4 w-4 text-saffron mt-0.5" /> Slot booking</li>
              </ul>
            </Card>
          </aside>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
