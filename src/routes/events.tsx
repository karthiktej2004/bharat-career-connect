import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { TricolorBar } from "@/components/Brand";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Building2, Search } from "lucide-react";
import { SEED_EVENTS } from "@/lib/mockStore";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Udyoga Mela Events — Bharat Career Connect" },
      { name: "description", content: "Browse upcoming, live and completed Udyoga Mela job fairs across India." },
      { property: "og:title", content: "Udyoga Mela Events — Bharat Career Connect" },
      { property: "og:description", content: "Browse upcoming, live and completed Udyoga Mela job fairs across India." },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");

  const list = useMemo(() => {
    return SEED_EVENTS.filter((e) => {
      if (status !== "all" && e.status.toLowerCase() !== status) return false;
      if (type !== "all" && e.type.toLowerCase() !== type) return false;
      if (q && !`${e.title} ${e.district} ${e.state}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [q, status, type]);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero-gradient py-16">
          <div className="mx-auto max-w-[1440px] px-4">
            <Badge variant="outline" className="mb-3">Events</Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-navy">Udyoga Mela Job Fairs</h1>
            <p className="mt-3 text-muted-foreground max-w-2xl">Find an event near you — register for free and attend in person, virtually or in hybrid mode.</p>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-4 -mt-6 mb-10">
          <Card className="p-4 shadow-elegant flex flex-col md:flex-row gap-3 border-border/60">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search by city, district, event…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="md:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="md:w-40"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="physical">Physical</SelectItem>
                <SelectItem value="virtual">Virtual</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </Card>
        </section>

        <section className="mx-auto max-w-[1440px] px-4 pb-20">
          {list.length === 0 ? (
            <p className="text-center text-muted-foreground py-20">No events match your filters.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {list.map((e) => (
                <Card key={e.id} className="overflow-hidden card-hover border-border/60">
                  <div className="h-32 gov-gradient relative">
                    <TricolorBar className="absolute bottom-0" />
                    <Badge className="absolute top-3 right-3 bg-white text-navy">{e.type}</Badge>
                    {e.status === "Live" && <Badge className="absolute top-3 left-3 bg-india-green text-white animate-pulse">LIVE</Badge>}
                    {e.status === "Completed" && <Badge className="absolute top-3 left-3 bg-muted text-foreground">Completed</Badge>}
                  </div>
                  <div className="p-5">
                    <h3 className="font-display font-bold text-navy text-lg">{e.title}</h3>
                    <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {new Date(e.date).toLocaleDateString("en-IN", { dateStyle: "medium" })}</p>
                      <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {e.venue}, {e.district}</p>
                      <p className="flex items-center gap-2"><Building2 className="h-4 w-4" /> {e.employers} employers · {e.registered.toLocaleString("en-IN")} registered</p>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button asChild size="sm" className="flex-1 bg-navy text-white hover:bg-navy/90">
                        <Link to="/events/$id" params={{ id: e.id }}>Details</Link>
                      </Button>
                      {e.status !== "Completed" && (
                        <Button asChild size="sm" variant="outline" className="flex-1"><Link to="/auth/signup">Register</Link></Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
