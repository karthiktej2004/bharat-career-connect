import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Store, Building2 } from "lucide-react";
import { applyForStall, getSession, MY_COMPANY_PROFILE, type JobEvent } from "@/lib/mockStore";
import { toast } from "sonner";

export function StallApplyDialog({ event, open, onOpenChange, onApplied }: {
  event: JobEvent | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onApplied?: () => void;
}) {
  const user = typeof window !== "undefined" ? getSession() : null;
  const p = MY_COMPANY_PROFILE;
  const empty = { candidatesNeeded: 10, rolesToHire: "", preferredZone: "", notes: "" };
  const [f, setF] = useState(empty);

  useEffect(() => { if (open) setF(empty); /* eslint-disable-next-line */ }, [open]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!event) return;
    if (!f.rolesToHire || !f.candidatesNeeded || f.candidatesNeeded < 1) {
      toast.error("Enter the roles and how many candidates you plan to hire");
      return;
    }
    applyForStall({
      eventId: event.id,
      employerId: user?.id ?? "demo-employer",
      employerName: p.name,
      contactName: p.hrName,
      contactPhone: p.hrPhone,
      candidatesNeeded: Number(f.candidatesNeeded),
      rolesToHire: f.rolesToHire,
      preferredZone: f.preferredZone || undefined,
      notes: f.notes || undefined,
    });
    toast.success("Stall application sent to admin", { description: "You'll be notified once approved." });
    onApplied?.();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Store className="h-5 w-5 text-saffron" /> Apply for a stall</DialogTitle>
          <DialogDescription>{event?.title} · {event ? new Date(event.date).toLocaleDateString("en-IN", { dateStyle: "medium" }) : ""}</DialogDescription>
        </DialogHeader>

        {/* Auto-filled company profile preview */}
        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2 text-sm">
          <p className="flex items-center gap-2 font-display font-semibold text-navy"><Building2 className="h-4 w-4 text-india-green" /> {p.name}</p>
          <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <p><span className="text-navy font-medium">Industry:</span> {p.industry}</p>
            <p><span className="text-navy font-medium">Team size:</span> {p.size}</p>
            <p><span className="text-navy font-medium">HQ:</span> {p.city}</p>
            <p><span className="text-navy font-medium">Website:</span> {p.website}</p>
            <p><span className="text-navy font-medium">Contact:</span> {p.hrName}</p>
            <p><span className="text-navy font-medium">Phone:</span> {p.hrPhone}</p>
            <p className="sm:col-span-2"><span className="text-navy font-medium">Email:</span> {p.hrEmail}</p>
          </div>
          <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/60">
            Auto-filled from your company profile. Update it under <span className="text-navy font-medium">Employer → Company</span>.
          </p>
        </div>

        <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Candidates to hire *</Label>
            <Input required type="number" min={1} value={f.candidatesNeeded} onChange={(e) => setF({ ...f, candidatesNeeded: Number(e.target.value) })} className="mt-1" />
          </div>
          <div>
            <Label>Preferred zone / hall</Label>
            <Input value={f.preferredZone} onChange={(e) => setF({ ...f, preferredZone: e.target.value })} placeholder="IT Hall, Manufacturing…" className="mt-1" />
          </div>
          <div className="sm:col-span-2">
            <Label>Roles you plan to hire *</Label>
            <Input required value={f.rolesToHire} onChange={(e) => setF({ ...f, rolesToHire: e.target.value })} placeholder="Frontend Developer, QA Engineer" className="mt-1" />
          </div>
          <div className="sm:col-span-2">
            <Label>Additional notes</Label>
            <Textarea rows={3} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} placeholder="Power / display / branding needs…" className="mt-1" />
          </div>
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-saffron text-navy hover:bg-saffron/90">Send application</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
