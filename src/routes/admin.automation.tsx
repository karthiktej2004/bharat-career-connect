import { createFileRoute } from "@tanstack/react-router";
import { DashShell, PageHeader } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Plus, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/admin/automation")({
  head: () => ({ meta: [{ title: "Workflow Automation — Admin" }] }),
  component: Automation,
});

const rules = [
  { name: "Auto-approve verified candidates", desc: "Approve candidates whose Aadhaar + qualification are verified", type: "Auto-approval", active: true },
  { name: "Auto-approve GST-verified employers", desc: "Approve employer registrations with valid GST", type: "Auto-approval", active: true },
  { name: "Auto-notify on registration", desc: "Send welcome SMS + email when a candidate registers", type: "Auto-notification", active: true },
  { name: "24h event reminder", desc: "Auto-reminder to all registered candidates 24 hours before event", type: "Auto-reminder", active: true },
  { name: "Payment reminder (T-3 days)", desc: "Auto-reminder to employers with unpaid invoices", type: "Auto-reminder", active: true },
];

const eventBased = [
  { trigger: "Candidate registers", action: "Event pass (QR) generated" },
  { trigger: "Job posted", action: "Matched candidates notified" },
  { trigger: "Slot booked", action: "Confirmation SMS/WhatsApp sent" },
  { trigger: "Interview completed", action: "Feedback form triggered" },
  { trigger: "Offer generated", action: "Offer letter emailed automatically" },
];

function Automation() {
  return (
    <DashShell role="admin" nav={adminNav}>
      <PageHeader title="Workflow Automation" description="Auto-approval, auto-notifications, auto-reminders and event-based triggers." action={
        <Button className="bg-saffron text-navy hover:bg-saffron/90"><Plus className="h-4 w-4 mr-1" />New Rule</Button>
      } />
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 border-border/60">
          <div className="flex items-center gap-2 mb-4"><Zap className="h-5 w-5 text-saffron" /><h2 className="font-display font-bold text-navy">Automation Rules</h2></div>
          <div className="space-y-3">
            {rules.map((r) => (
              <div key={r.name} className="p-3 rounded-lg border border-border/60 flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2"><p className="font-medium text-navy text-sm">{r.name}</p><Badge variant="outline" className="text-[10px]">{r.type}</Badge></div>
                  <p className="text-xs text-muted-foreground mt-1">{r.desc}</p>
                </div>
                <Switch defaultChecked={r.active} />
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6 border-border/60">
          <h2 className="font-display font-bold text-navy mb-4">Event-Based Automation</h2>
          <div className="space-y-2">
            {eventBased.map((e) => (
              <div key={e.trigger} className="p-3 rounded-lg bg-muted/40 flex items-center gap-3">
                <Badge className="bg-navy text-white text-xs shrink-0">{e.trigger}</Badge>
                <ArrowRight className="h-4 w-4 text-saffron shrink-0" />
                <span className="text-sm text-navy">{e.action}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">Reduces manual effort and improves efficiency across the job fair lifecycle.</p>
        </Card>
      </div>
    </DashShell>
  );
}
