import { createFileRoute } from "@tanstack/react-router";
import { DashShell, PageHeader } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Database, FileLock2, Languages } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Security & Compliance — Admin" }] }),
  component: Settings,
});

function Settings() {
  return (
    <DashShell role="admin" nav={adminNav}>
      <PageHeader title="Security & Compliance" description="2FA, audit trail, DPDP Act compliance, data encryption and platform-level controls." />
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 border-border/60">
          <div className="flex items-center gap-2 mb-4"><ShieldCheck className="h-5 w-5 text-india-green" /><h2 className="font-display font-bold text-navy">Security</h2></div>
          {[
            { label: "Two-Factor Authentication (2FA)", desc: "Require OTP for all admin logins", checked: true },
            { label: "Session timeout", desc: "Auto sign-out after 30 minutes idle", checked: true },
            { label: "IP allowlist", desc: "Restrict admin access to office IPs", checked: false },
            { label: "Audit trail tracking", desc: "Log every approve/edit/export action", checked: true },
          ].map((s) => (
            <div key={s.label} className="py-3 flex items-center justify-between border-b border-border last:border-0">
              <div><p className="font-medium text-navy text-sm">{s.label}</p><p className="text-xs text-muted-foreground">{s.desc}</p></div>
              <Switch defaultChecked={s.checked} />
            </div>
          ))}
        </Card>
        <Card className="p-6 border-border/60">
          <div className="flex items-center gap-2 mb-4"><FileLock2 className="h-5 w-5 text-saffron" /><h2 className="font-display font-bold text-navy">Compliance</h2></div>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-india-green/10 border border-india-green/30 flex items-center justify-between"><div><p className="font-medium text-navy text-sm">DPDP Act 2023</p><p className="text-xs text-muted-foreground">Digital Personal Data Protection</p></div><Badge className="bg-india-green text-white">Compliant</Badge></div>
            <div className="p-3 rounded-lg bg-india-green/10 border border-india-green/30 flex items-center justify-between"><div><p className="font-medium text-navy text-sm">Data encryption at rest</p><p className="text-xs text-muted-foreground">AES-256</p></div><Badge className="bg-india-green text-white">Active</Badge></div>
            <div className="p-3 rounded-lg bg-saffron/10 border border-saffron/30 flex items-center justify-between"><div><p className="font-medium text-navy text-sm">Consent logs</p><p className="text-xs text-muted-foreground">12,400 records this month</p></div><Button size="sm" variant="outline">View</Button></div>
          </div>
        </Card>
        <Card className="p-6 border-border/60">
          <div className="flex items-center gap-2 mb-4"><Database className="h-5 w-5 text-navy" /><h2 className="font-display font-bold text-navy">Data Management</h2></div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between"><span>Last backup</span><span className="text-muted-foreground">2 hours ago · Healthy</span></div>
            <div className="flex items-center justify-between"><span>Storage used</span><span className="text-muted-foreground">128 GB / 1 TB</span></div>
            <div className="flex items-center justify-between"><span>Version control</span><Badge className="bg-india-green/15 text-india-green">Enabled</Badge></div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button size="sm" variant="outline">Backup now</Button>
              <Button size="sm" variant="outline">Restore</Button>
            </div>
          </div>
        </Card>
        <Card className="p-6 border-border/60">
          <div className="flex items-center gap-2 mb-4"><Languages className="h-5 w-5 text-saffron" /><h2 className="font-display font-bold text-navy">Localisation</h2></div>
          <Label className="text-sm">Enabled languages</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {["English", "हिन्दी", "ಕನ್ನಡ", "తెలుగు", "தமிழ்"].map((l) => <Badge key={l} className="bg-saffron/15 text-saffron">{l}</Badge>)}
          </div>
          <Label className="text-sm mt-4 block">Default time zone</Label>
          <p className="text-sm text-muted-foreground mt-1">Asia/Kolkata (IST · UTC +5:30)</p>
        </Card>
      </div>
    </DashShell>
  );
}
