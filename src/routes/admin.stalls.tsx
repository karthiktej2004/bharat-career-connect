import { createFileRoute } from "@tanstack/react-router";
import { DashShell, PageHeader } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/stalls")({
  head: () => ({ meta: [{ title: "Stalls & Venue — Admin" }] }),
  component: Stalls,
});

const zones = [
  { name: "Hall A — IT & Software", color: "bg-saffron/20 border-saffron", stalls: ["A-01", "A-02", "A-03", "A-04", "A-05", "A-06", "A-07", "A-08", "A-09", "A-10", "A-11", "A-12"] },
  { name: "Hall B — Retail & Services", color: "bg-india-green/20 border-india-green", stalls: ["B-01", "B-02", "B-03", "B-04", "B-05", "B-06", "B-07", "B-08"] },
  { name: "Hall C — Manufacturing & ITI", color: "bg-navy/15 border-navy", stalls: ["C-01", "C-02", "C-03", "C-04", "C-05", "C-06", "C-07", "C-08", "C-09", "C-10"] },
];

function Stalls() {
  return (
    <DashShell role="admin" nav={adminNav}>
      <PageHeader title="Stalls & Venue Layout" description="Udyoga Mela Bengaluru · Palace Grounds, Halls 1-3" action={<Button className="bg-saffron text-navy hover:bg-saffron/90">Auto-assign stalls</Button>} />
      <div className="grid lg:grid-cols-3 gap-6">
        {zones.map((z) => (
          <Card key={z.name} className="p-5 border-border/60">
            <h3 className="font-display font-bold text-navy mb-3">{z.name}</h3>
            <div className="grid grid-cols-4 gap-2">
              {z.stalls.map((s, i) => {
                const assigned = i % 3 !== 2;
                return (
                  <div key={s} className={`aspect-square rounded-lg border-2 ${assigned ? z.color : "border-dashed border-border bg-muted/30"} flex flex-col items-center justify-center text-xs cursor-pointer hover:scale-105 transition`}>
                    <span className="font-bold text-navy">{s}</span>
                    {assigned ? <Badge className="mt-1 text-[9px] py-0 px-1.5 bg-white">Assigned</Badge> : <span className="text-muted-foreground text-[10px] mt-1">Empty</span>}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
      <Card className="p-6 border-border/60 mt-6 grid sm:grid-cols-4 gap-4 text-center">
        {[{ k: "Total Stalls", v: 30 }, { k: "Assigned", v: 22 }, { k: "Open", v: 8 }, { k: "Utilisation", v: "73%" }].map((s) => (
          <div key={s.k}><p className="text-xs uppercase tracking-widest text-muted-foreground">{s.k}</p><p className="font-display font-bold text-2xl text-navy">{s.v}</p></div>
        ))}
      </Card>
    </DashShell>
  );
}
