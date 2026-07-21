import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from "lucide-react";
import type { StallApplication, JobEvent } from "@/lib/mockStore";

export function StallMapDialog({ event, application, open, onOpenChange }: {
  event: JobEvent | null;
  application: StallApplication | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const lat = application?.mapLat ?? 12.9716;
  const lng = application?.mapLng ?? 77.5946;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  // OpenStreetMap embed (no key needed)
  const embed = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.008},${lng + 0.01},${lat + 0.008}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-saffron" /> Your stall location</DialogTitle>
          <DialogDescription>{event?.title} · {event?.venue}</DialogDescription>
        </DialogHeader>

        <div className="grid sm:grid-cols-3 gap-3 text-sm">
          <div className="p-3 rounded-lg bg-muted/40"><p className="text-[10px] uppercase text-muted-foreground">Stall no</p><p className="font-display font-bold text-navy text-lg">{application?.stallNo ?? "—"}</p></div>
          <div className="p-3 rounded-lg bg-muted/40"><p className="text-[10px] uppercase text-muted-foreground">Hall / Zone</p><p className="font-medium text-navy">{application?.hall ?? "—"}</p></div>
          <div className="p-3 rounded-lg bg-muted/40"><p className="text-[10px] uppercase text-muted-foreground">Attendance code</p><p className="font-mono font-bold text-navy">{application?.attendanceCode ?? "—"}</p></div>
        </div>

        <div className="rounded-xl overflow-hidden border border-border">
          <iframe
            title="Stall location map"
            src={embed}
            className="w-full h-72 border-0"
            loading="lazy"
          />
        </div>

        {application?.gateInstructions && (
          <div className="rounded-lg bg-saffron/10 border border-saffron/30 p-3 text-sm text-navy">
            <p className="font-semibold mb-1">Gate instructions</p>
            <p className="text-muted-foreground">{application.gateInstructions}</p>
          </div>
        )}

        <div className="flex justify-end">
          <Button asChild className="bg-navy text-white hover:bg-navy/90">
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer"><Navigation className="h-4 w-4 mr-1" /> Open in Google Maps</a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
