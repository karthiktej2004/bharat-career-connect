import { createFileRoute } from "@tanstack/react-router";
import { DashShell, PageHeader } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Send, Mail, MessageCircle, Smartphone, Zap } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Admin" }] }),
  component: Notifications,
});

const automations = [
  { trigger: "Candidate registers", action: "Send welcome SMS + email" },
  { trigger: "Slot booked", action: "Send WhatsApp confirmation + reminder 24h before" },
  { trigger: "Job posted", action: "Notify matched candidates by email" },
  { trigger: "Interview scheduled", action: "Send SMS to candidate + employer" },
  { trigger: "Offer made", action: "Send congratulations email with next steps" },
];

function Notifications() {
  return (
    <DashShell role="admin" nav={adminNav}>
      <PageHeader title="Notifications & Communication" description="Broadcast and automate SMS, email and WhatsApp messaging." />
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 border-border/60">
          <h2 className="font-display font-bold text-navy mb-4">Compose broadcast</h2>
          <form onSubmit={(e) => { e.preventDefault(); toast.success("Broadcast queued · 12,400 recipients"); }} className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2 text-sm"><Checkbox defaultChecked /><Smartphone className="h-4 w-4" />SMS</label>
              <label className="flex items-center gap-2 text-sm"><Checkbox defaultChecked /><MessageCircle className="h-4 w-4" />WhatsApp</label>
              <label className="flex items-center gap-2 text-sm"><Checkbox /><Mail className="h-4 w-4" />Email</label>
            </div>
            <div><Label>Audience</Label><Input className="mt-1" defaultValue="All registered candidates · Bengaluru" /></div>
            <div><Label>Subject</Label><Input className="mt-1" defaultValue="Udyoga Mela starts in 24 hours" /></div>
            <div><Label>Message</Label><Textarea rows={5} className="mt-1" defaultValue="Dear candidate, your QR pass is ready. Gates open at 9 AM. Bring ID proof." /></div>
            <Button type="submit" className="w-full bg-saffron text-navy hover:bg-saffron/90"><Send className="h-4 w-4 mr-1" />Send Broadcast</Button>
          </form>
        </Card>
        <Card className="p-6 border-border/60">
          <div className="flex items-center gap-2 mb-4"><Zap className="h-5 w-5 text-saffron" /><h2 className="font-display font-bold text-navy">Automation Triggers</h2></div>
          <div className="space-y-3">
            {automations.map((a) => (
              <div key={a.trigger} className="p-3 rounded-lg border border-border/60 bg-muted/30">
                <p className="text-sm font-semibold text-navy">{a.trigger}</p>
                <p className="text-xs text-muted-foreground mt-1">→ {a.action}</p>
                <Badge className="mt-2 bg-india-green/15 text-india-green text-xs">Active</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashShell>
  );
}
