import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { DashShell, PageHeader } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, Eye, Inbox, ShieldCheck } from "lucide-react";
import { listCompanyRequests, reviewCompanyRequest, type CompanyRequest } from "@/lib/mockStore";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/company-requests")({
  head: () => ({ meta: [{ title: "Company Requests — Admin" }] }),
  component: CompanyRequests,
});

function CompanyRequests() {
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [items, setItems] = useState<CompanyRequest[]>([]);
  const [view, setView] = useState<CompanyRequest | null>(null);
  const [rejecting, setRejecting] = useState<CompanyRequest | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    const sync = () => setItems(listCompanyRequests());
    sync();
    window.addEventListener("bcc-company-requests", sync);
    return () => window.removeEventListener("bcc-company-requests", sync);
  }, []);

  const filtered = useMemo(() => items.filter((i) => i.status === tab), [items, tab]);
  const counts = useMemo(() => ({
    pending: items.filter((i) => i.status === "pending").length,
    approved: items.filter((i) => i.status === "approved").length,
    rejected: items.filter((i) => i.status === "rejected").length,
  }), [items]);

  function approve(r: CompanyRequest) {
    reviewCompanyRequest(r.id, "approved");
    toast.success(`${r.name} approved — employer sign-in unlocked for @${r.domain}`);
    setView(null);
  }
  function reject() {
    if (!rejecting) return;
    reviewCompanyRequest(rejecting.id, "rejected", note);
    toast.success(`${rejecting.name} rejected`);
    setRejecting(null); setNote(""); setView(null);
  }

  return (
    <DashShell role="admin" nav={adminNav}>
      <PageHeader
        title="Admin — Company Registration Requests"
        description="Bharat Career Connect platform team reviews and approves companies. Approval unlocks Employer and Company Admin login for the company's work-email domain."
      />

      <div className="grid gap-3 sm:grid-cols-3 mb-6">
        <StatMini label="Pending review" value={counts.pending} icon={<Inbox className="h-4 w-4" />} tone="saffron" />
        <StatMini label="Approved" value={counts.approved} icon={<CheckCircle2 className="h-4 w-4" />} tone="green" />
        <StatMini label="Rejected" value={counts.rejected} icon={<XCircle className="h-4 w-4" />} tone="red" />
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="mb-4">
        <TabsList>
          <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({counts.approved})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({counts.rejected})</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request ID</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Domain</TableHead>
              <TableHead>GST</TableHead>
              <TableHead>HR Contact</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-10">No {tab} requests.</TableCell></TableRow>
            )}
            {filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-xs">{r.id}</TableCell>
                <TableCell><p className="font-medium text-navy">{r.name}</p><p className="text-xs text-muted-foreground">{r.industry} · {r.city}</p></TableCell>
                <TableCell><Badge variant="outline">@{r.domain}</Badge></TableCell>
                <TableCell className="text-xs font-mono">{r.gst}</TableCell>
                <TableCell><p className="text-sm">{r.hrName}</p><p className="text-xs text-muted-foreground">{r.hrEmail}</p></TableCell>
                <TableCell className="text-sm text-muted-foreground">{r.createdAt}</TableCell>
                <TableCell>
                  <div className="flex gap-1 justify-end">
                    <Button size="sm" variant="outline" onClick={() => setView(r)}><Eye className="h-4 w-4 mr-1" />View</Button>
                    {r.status === "pending" && (
                      <>
                        <Button size="sm" className="bg-india-green text-white hover:bg-india-green/90" onClick={() => approve(r)}><CheckCircle2 className="h-4 w-4 mr-1" />Approve</Button>
                        <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => setRejecting(r)}><XCircle className="h-4 w-4 mr-1" />Reject</Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* View dialog */}
      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="max-w-2xl">
          {view && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-navy" /> {view.name}</DialogTitle>
                <DialogDescription>Request {view.id} · submitted {view.createdAt}</DialogDescription>
              </DialogHeader>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <Field label="Email domain" value={`@${view.domain}`} />
                <Field label="GST / CIN" value={view.gst} />
                <Field label="Industry" value={view.industry || "—"} />
                <Field label="Size" value={view.size || "—"} />
                <Field label="Website" value={view.website || "—"} />
                <Field label="City" value={view.city || "—"} />
                <Field label="HR Name" value={view.hrName} />
                <Field label="HR Phone" value={view.hrPhone} />
                <Field label="HR Email" value={view.hrEmail} className="sm:col-span-2" />
                <Field label="About" value={view.about || "—"} className="sm:col-span-2" />
                {view.reviewNote && <Field label="Review note" value={view.reviewNote} className="sm:col-span-2" />}
              </div>
              <DialogFooter>
                {view.status === "pending" ? (
                  <>
                    <Button variant="outline" className="text-destructive" onClick={() => setRejecting(view)}>Reject</Button>
                    <Button className="bg-india-green text-white hover:bg-india-green/90" onClick={() => approve(view)}>Approve company</Button>
                  </>
                ) : (
                  <Badge className={view.status === "approved" ? "bg-india-green/15 text-india-green" : "bg-destructive/15 text-destructive"}>{view.status.toUpperCase()}</Badge>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={!!rejecting} onOpenChange={(o) => { if (!o) { setRejecting(null); setNote(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {rejecting?.name}?</DialogTitle>
            <DialogDescription>Share a brief reason. This is stored with the request.</DialogDescription>
          </DialogHeader>
          <Textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. GST could not be verified" />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejecting(null); setNote(""); }}>Cancel</Button>
            <Button className="bg-destructive text-white hover:bg-destructive/90" onClick={reject}>Confirm reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashShell>
  );
}

function StatMini({ label, value, icon, tone }: { label: string; value: number; icon: React.ReactNode; tone: "saffron" | "green" | "red" }) {
  const cls = tone === "saffron" ? "bg-saffron/15 text-saffron" : tone === "green" ? "bg-india-green/15 text-india-green" : "bg-destructive/15 text-destructive";
  return (
    <Card className="p-4 border-border/60 flex items-center gap-3">
      <div className={`size-10 rounded-lg flex items-center justify-center ${cls}`}>{icon}</div>
      <div><p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p><p className="font-display font-bold text-2xl text-navy">{value}</p></div>
    </Card>
  );
}

function Field({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-sm text-navy font-medium mt-0.5 break-words">{value}</p>
    </div>
  );
}
