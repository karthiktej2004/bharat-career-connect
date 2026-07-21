import { createFileRoute } from "@tanstack/react-router";
import { DashShell, PageHeader, StatCard } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessagesSquare, LifeBuoy, ClipboardList, Bell, Send } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/collaboration")({
  head: () => ({ meta: [{ title: "Admin Collaboration — Admin" }] }),
  component: Collab,
});

const messages = [
  { from: "S. Reddy (Admin)", text: "Stall A-12 needs reassignment — Infosys team requested extra panel.", time: "5 min ago" },
  { from: "P. Nair (Coordinator)", text: "QR scanner at Gate 2 is offline. Requesting backup device.", time: "18 min ago" },
  { from: "K. Singh (Admin)", text: "Approved 42 pending employer registrations for Mysuru event.", time: "1 hr ago" },
];

const tickets = [
  { id: "HD-2041", title: "Candidate cannot download QR pass", priority: "High", assignee: "M. Khan", status: "In progress" },
  { id: "HD-2040", title: "Employer login OTP not received", priority: "Medium", assignee: "P. Nair", status: "Open" },
  { id: "HD-2039", title: "Interview slot double-booked", priority: "High", assignee: "S. Reddy", status: "Resolved" },
];

const tasks = [
  { title: "Verify Mysuru venue readiness", assignee: "K. Singh", due: "Today" },
  { title: "Publish press note — Bengaluru Aug 2026", assignee: "P. Nair", due: "Tomorrow" },
  { title: "Coordinate volunteer briefing", assignee: "M. Khan", due: "In 2 days" },
];

function Collab() {
  return (
    <DashShell role="admin" nav={adminNav}>
      <PageHeader title="Admin Collaboration & Support" description="Internal communication, helpdesk and task assignment for the admin team." />
      <div className="grid sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="Open Tickets" value="14" icon={LifeBuoy} accent="saffron" />
        <StatCard label="Assigned Tasks" value="28" icon={ClipboardList} accent="navy" />
        <StatCard label="Approvals Pending" value="9" icon={Bell} />
        <StatCard label="Admin Online" value="12" icon={MessagesSquare} accent="india-green" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-6 border-border/60 lg:col-span-1">
          <div className="flex items-center gap-2 mb-4"><MessagesSquare className="h-5 w-5 text-saffron" /><h2 className="font-display font-bold text-navy">Internal Admin Chat</h2></div>
          <div className="space-y-3 max-h-72 overflow-y-auto mb-3">
            {messages.map((m, i) => (
              <div key={i} className="text-sm border-l-2 border-saffron pl-3">
                <p className="font-medium text-navy text-xs">{m.from}</p>
                <p className="text-sm">{m.text}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{m.time}</p>
              </div>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); toast.success("Message sent to admin team"); }} className="flex gap-2">
            <Input placeholder="Message team…" />
            <Button type="submit" size="icon" className="bg-saffron text-navy hover:bg-saffron/90"><Send className="h-4 w-4" /></Button>
          </form>
        </Card>

        <Card className="p-6 border-border/60 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4"><LifeBuoy className="h-5 w-5 text-india-green" /><h2 className="font-display font-bold text-navy">Helpdesk Tickets</h2></div>
          <div className="space-y-2">
            {tickets.map((t) => (
              <div key={t.id} className="p-3 rounded-lg border border-border/60 flex items-center gap-3 flex-wrap">
                <span className="font-mono text-xs text-muted-foreground">{t.id}</span>
                <p className="text-sm font-medium text-navy flex-1 min-w-[200px]">{t.title}</p>
                <Badge className={t.priority === "High" ? "bg-destructive/15 text-destructive" : "bg-saffron/15 text-saffron"}>{t.priority}</Badge>
                <span className="text-xs text-muted-foreground">→ {t.assignee}</span>
                <Badge className={t.status === "Resolved" ? "bg-india-green/15 text-india-green" : t.status === "Open" ? "bg-muted" : "bg-navy/10 text-navy"}>{t.status}</Badge>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-6 mb-3"><ClipboardList className="h-5 w-5 text-navy" /><h3 className="font-display font-bold text-navy">Task Assignment</h3></div>
          <div className="space-y-2 mb-4">
            {tasks.map((t) => (
              <div key={t.title} className="p-3 rounded-lg bg-muted/30 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-navy">{t.title}</p>
                  <p className="text-xs text-muted-foreground">Assigned to {t.assignee} · Due {t.due}</p>
                </div>
                <Button size="sm" variant="outline">Mark done</Button>
              </div>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); toast.success("Task assigned"); }} className="grid sm:grid-cols-3 gap-2">
            <Input placeholder="New task" className="sm:col-span-2" />
            <Button type="submit" className="bg-navy text-white hover:bg-navy/90">Assign</Button>
          </form>
        </Card>
      </div>
    </DashShell>
  );
}
