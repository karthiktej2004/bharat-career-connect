import { createFileRoute } from "@tanstack/react-router";
import { DashShell, PageHeader } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listCompanyRequests, type CompanyRequest, PLANS, type PlanTier } from "@/lib/mockStore";
import { GRANTABLE_MODULES, getGrantsForDomain, setGrantsForDomain, planMeets } from "@/lib/moduleAccess";
import { getSubscription, updateSubscription, type CompanySubscription } from "@/lib/companySubscriptions";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { KeyRound, Search, Save, Wallet, Crown, CalendarClock, CheckCircle2, XCircle, IndianRupee, Lock } from "lucide-react";

export const Route = createFileRoute("/admin/access")({
  head: () => ({ meta: [{ title: "Module Access & Subscriptions — Admin" }] }),
  component: ModuleAccess,
});

const PLAN_BADGE: Record<PlanTier, string> = {
  free: "bg-muted text-navy",
  gold: "bg-saffron text-navy",
  premium: "bg-navy text-white",
};

function ModuleAccess() {
  const [companies, setCompanies] = useState<CompanyRequest[]>([]);
  const [subsTick, setSubsTick] = useState(0);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [draft, setDraft] = useState<string[]>([]);
  const [sub, setSub] = useState<CompanySubscription | null>(null);

  useEffect(() => {
    const load = () => setCompanies(listCompanyRequests().filter((c) => c.status === "approved"));
    load();
    window.addEventListener("bcc-company-requests", load);
    const bump = () => setSubsTick((n) => n + 1);
    window.addEventListener("bcc-company-subs", bump);
    return () => {
      window.removeEventListener("bcc-company-requests", load);
      window.removeEventListener("bcc-company-subs", bump);
    };
  }, []);

  useEffect(() => {
    if (selected) {
      setDraft(getGrantsForDomain(selected));
      setSub(getSubscription(selected));
    }
  }, [selected, subsTick]);

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return companies.filter((c) => c.name.toLowerCase().includes(s) || c.domain.toLowerCase().includes(s) || c.hrEmail.toLowerCase().includes(s));
  }, [companies, q]);

  const current = companies.find((c) => c.domain.toLowerCase() === selected);

  function toggle(key: string) {
    setDraft((d) => (d.includes(key) ? d.filter((k) => k !== key) : [...d, key]));
  }

  function save() {
    if (!selected) return;
    setGrantsForDomain(selected, draft);
    toast.success(`Access updated for ${current?.name ?? selected}`);
  }

  function patchSub(patch: Partial<CompanySubscription>) {
    if (!selected) return;
    updateSubscription(selected, patch);
  }

  return (
    <DashShell role="admin" nav={adminNav}>
      <PageHeader
        title="Module Access & Subscriptions"
        description="Grant Company Admin panels access to premium modules, and manage each company's subscription, billing and collaboration."
      />
      <div className="grid lg:grid-cols-[360px_1fr] gap-6">
        <Card className="border-border/60 overflow-hidden">
          <div className="p-3 border-b border-border relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search companies…" className="pl-9 h-9" />
          </div>
          <div className="max-h-[640px] overflow-y-auto divide-y">
            {filtered.length === 0 && <p className="p-4 text-sm text-muted-foreground">No approved companies.</p>}
            {filtered.map((c) => {
              const active = selected === c.domain.toLowerCase();
              const grants = getGrantsForDomain(c.domain);
              const s = getSubscription(c.domain);
              return (
                <button
                  key={c.id}
                  onClick={() => setSelected(c.domain.toLowerCase())}
                  className={`w-full text-left px-4 py-3 transition ${active ? "bg-navy text-white" : "hover:bg-muted"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className={`font-medium text-sm ${active ? "text-white" : "text-navy"}`}>{c.name}</p>
                    <Badge className={`text-[10px] ${active ? "bg-white/20 text-white" : PLAN_BADGE[s.plan]}`}>{PLANS[s.plan].name}</Badge>
                  </div>
                  <p className={`text-xs ${active ? "text-white/70" : "text-muted-foreground"}`}>@{c.domain}</p>
                  <div className="mt-1 flex gap-1 flex-wrap items-center">
                    <Badge variant="outline" className={`text-[10px] ${active ? "border-white/40 text-white" : ""}`}>
                      {s.status === "active" ? "Active" : s.status === "trial" ? "Trial" : "Expired"}
                    </Badge>
                    {!s.paidThisMonth && s.plan !== "free" && (
                      <Badge className="text-[10px] bg-danger text-white">Unpaid</Badge>
                    )}
                    <span className={`text-[10px] ${active ? "text-white/70" : "text-muted-foreground"}`}>{grants.length} module{grants.length === 1 ? "" : "s"}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <div className="space-y-6">
          {!current || !sub ? (
            <Card className="p-6 border-border/60">
              <div className="flex flex-col items-center justify-center min-h-[420px] text-center">
                <KeyRound className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="font-display font-bold text-navy">Select a company</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">Pick a company on the left to manage its subscription, billing, and premium module access for the Company Admin panel.</p>
              </div>
            </Card>
          ) : (
            <>
              {/* Company header */}
              <Card className="p-6 border-border/60">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display font-bold text-navy text-lg">{current.name}</h2>
                    <p className="text-xs text-muted-foreground">@{current.domain} · Admin: {current.hrEmail} · {current.city}</p>
                  </div>
                  <Badge className="bg-india-green text-white">Approved</Badge>
                </div>
              </Card>

              {/* Subscription & billing */}
              <Card className="p-6 border-border/60">
                <div className="flex items-center gap-2 mb-4">
                  <Wallet className="h-5 w-5 text-saffron" />
                  <h3 className="font-display font-bold text-navy">Subscription & Billing</h3>
                </div>

                <div className="grid md:grid-cols-4 gap-3 mb-5">
                  <div className="p-3 rounded-lg bg-muted/40">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1"><Crown className="h-3 w-3" />Current plan</p>
                    <p className="font-display font-bold text-navy mt-1">{PLANS[sub.plan].name}</p>
                    <p className="text-xs text-muted-foreground">₹{PLANS[sub.plan].priceInr.toLocaleString("en-IN")}/mo</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/40">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Status</p>
                    <p className="font-display font-bold mt-1 flex items-center gap-1">
                      {sub.status === "active" ? <><CheckCircle2 className="h-4 w-4 text-india-green" /><span className="text-india-green">Active</span></>
                        : sub.status === "trial" ? <span className="text-navy">Trial</span>
                        : <><XCircle className="h-4 w-4 text-danger" /><span className="text-danger">Expired</span></>}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/40">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1"><IndianRupee className="h-3 w-3" />This month</p>
                    <p className="font-display font-bold mt-1">{sub.paidThisMonth ? <span className="text-india-green">Paid ₹{sub.amountPaidInr.toLocaleString("en-IN")}</span> : <span className="text-danger">Unpaid</span>}</p>
                    <p className="text-xs text-muted-foreground">{sub.lastPaymentDate ? `Last: ${sub.lastPaymentDate}` : "No payments yet"}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/40">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1"><CalendarClock className="h-3 w-3" />Next bill</p>
                    <p className="font-display font-bold text-navy mt-1">{sub.nextBillDate}</p>
                    <p className="text-xs text-muted-foreground">{sub.invoiceNo ?? "—"}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-3 items-end">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Change plan</p>
                    <Select value={sub.plan} onValueChange={(v: PlanTier) => { patchSub({ plan: v, amountPaidInr: PLANS[v].priceInr }); toast.success(`Plan set to ${PLANS[v].name}`); }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(Object.keys(PLANS) as PlanTier[]).map((p) => (
                          <SelectItem key={p} value={p}>{PLANS[p].name} · ₹{PLANS[p].priceInr.toLocaleString("en-IN")}/mo</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Subscription status</p>
                    <Select value={sub.status} onValueChange={(v: CompanySubscription["status"]) => { patchSub({ status: v }); toast.success(`Status: ${v}`); }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="trial">Trial</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                    <div>
                      <p className="text-sm font-medium text-navy">Marked paid this month</p>
                      <p className="text-xs text-muted-foreground">Toggle when payment is confirmed</p>
                    </div>
                    <Switch checked={sub.paidThisMonth} onCheckedChange={(v) => {
                      patchSub({ paidThisMonth: v, lastPaymentDate: v ? new Date().toISOString().slice(0, 10) : sub.lastPaymentDate });
                      toast.success(v ? "Marked as paid" : "Marked as unpaid");
                    }} />
                  </div>
                </div>
              </Card>

              {/* Module access */}
              <Card className="p-6 border-border/60">
                <div className="flex items-center gap-2 mb-1">
                  <KeyRound className="h-5 w-5 text-saffron" />
                  <h3 className="font-display font-bold text-navy">Premium Module Access</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Tick modules to enable them inside <span className="font-medium text-navy">{current.name}</span>'s Company Admin sidebar.
                  Modules that exceed the current plan are locked — upgrade the plan first.
                </p>
                <div className="space-y-3">
                  {GRANTABLE_MODULES.map((m) => {
                    const on = draft.includes(m.key);
                    const allowed = planMeets(sub.plan, m.requiredPlan);
                    return (
                      <label key={m.key} className={`flex items-start gap-3 p-3 rounded-lg border transition ${!allowed ? "opacity-60 cursor-not-allowed border-border/60" : on ? "border-saffron bg-saffron/5 cursor-pointer" : "border-border/60 hover:bg-muted/40 cursor-pointer"}`}>
                        <Checkbox checked={on} disabled={!allowed} onCheckedChange={() => allowed && toggle(m.key)} className="mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <m.icon className="h-4 w-4 text-navy" />
                            <p className="font-medium text-navy text-sm">{m.label}</p>
                            <Badge className={`text-[10px] ${PLAN_BADGE[m.requiredPlan]}`}>Requires {PLANS[m.requiredPlan].name}</Badge>
                            {!allowed && <Badge variant="outline" className="text-[10px]"><Lock className="h-3 w-3 mr-1" />Upgrade plan</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{m.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDraft(getGrantsForDomain(selected!))}>Reset</Button>
                  <Button className="bg-navy text-white hover:bg-navy/90" onClick={save}><Save className="h-4 w-4 mr-1" />Save access</Button>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </DashShell>
  );
}
