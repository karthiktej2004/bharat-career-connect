import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashShell, PageHeader, StatCard } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UsersRound, MapPinned, Store, Check, X, Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/jobfair")({
  head: () => ({ meta: [{ title: "Event Approvals — Admin" }] }),
  component: EventApprovals,
});

function EventApprovals() {
  const [apps, setApps] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [appsRes, eventsRes] = await Promise.all([
        fetch("https://bcc-backend-0cny.onrender.com/api/admin/stall-applications"),
        fetch("https://bcc-backend-0cny.onrender.com/api/admin/events")
      ]);
      const appsJson = await appsRes.json();
      const eventsJson = await eventsRes.json();

      if (appsJson.success) setApps(appsJson.data);
      if (eventsJson.success) setEvents(eventsJson.data);
    } catch (error) {
      toast.error("Failed to load approval data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id: number, employerName: string) => {
    try {
      const res = await fetch(`https://bcc-backend-0cny.onrender.com/api/admin/stall-applications/${id}/approve`, { method: "PUT" });
      if (res.ok) {
        toast.success(`${employerName} approved successfully.`);
        fetchData();
      }
    } catch (e) {
      toast.error("Approval transition failed");
    }
  };

  const handleReject = async (id: number, employerName: string) => {
    if (!confirm(`Reject ${employerName}?`)) return;
    try {
      const res = await fetch(`https://bcc-backend-0cny.onrender.com/api/admin/stall-applications/${id}/reject`, { method: "PUT" });
      if (res.ok) {
        toast.success(`${employerName} application marked as rejected`);
        fetchData();
      }
    } catch (e) {
      toast.error("Rejection step failed");
    }
  };

  const pending = apps.filter((a) => a.status === "pending");
  const approved = apps.filter((a) => a.status === "approved" || a.status === "live");

  return (
    <DashShell role="admin" nav={adminNav}>
      <PageHeader title="Event Approvals" description="Review employer registrations, process payments, and track active requests." />

      {isLoading ? (
        <div className="flex h-[40vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-navy" /></div>
      ) : (
        <>
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <StatCard label="Pending Approval" value={String(pending.length)} icon={Store} accent="saffron" />
            <StatCard label="Approved Companies" value={String(approved.length)} icon={Check} accent="india-green" />
            <StatCard label="Total Applications" value={String(apps.length)} icon={UsersRound} accent="navy" />
          </div>

          {events.length > 0 && (
            <Card className="p-4 mb-6 border-border/60">
              <h3 className="font-display font-bold text-navy text-sm mb-2">Stall Allocation Shortcuts</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {events.map((ev) => (
                  <Link key={ev.id} to="/admin/allocation/$eventId" params={{ eventId: ev.id.toString() }} search={{ tab: "company" }} className="p-3 rounded-lg border border-border hover:border-navy hover:bg-navy/5 transition flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-navy text-sm truncate">{ev.name}</p>
                      <p className="text-xs text-muted-foreground font-mono truncate">EVT-{ev.id}</p>
                    </div>
                    <MapPinned className="h-4 w-4 text-navy shrink-0" />
                  </Link>
                ))}
              </div>
            </Card>
          )}

          <Card className="border-border/60 mb-8">
            <div className="p-4 border-b border-border"><h2 className="font-display font-bold text-navy">Employer Stall Applications</h2></div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employer</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Roles Required</TableHead>
                  <TableHead>Vacancies</TableHead>
                  <TableHead>Payment Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Allocated Stall</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apps.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8 text-sm text-muted-foreground">No applications found.</TableCell></TableRow>
                ) : apps.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium text-navy">{a.employerName}</TableCell>
                    <TableCell className="text-sm">{a.eventName}</TableCell>
                    <TableCell className="text-xs">
                      <div className="text-navy font-semibold">{a.contactEmail}</div>
                      <div className="text-muted-foreground mt-0.5">{new Date(a.applied_at).toLocaleDateString()}</div>
                    </TableCell>
                    <TableCell className="text-xs text-navy font-medium max-w-[140px] truncate" title={a.rolesToHire}>
                      {a.rolesToHire || "—"}
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-navy">
                      {a.vacanciesCount ? `${a.vacanciesCount} Openings` : "0"}
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className="flex items-center gap-1 font-mono text-india-green bg-india-green/5 p-1 rounded border border-india-green/20">
                        <CreditCard className="h-3 w-3" /> {a.payment_status || "Verified"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={a.status === "approved" ? "bg-india-green/15 text-india-green uppercase" : a.status === "rejected" ? "bg-red-500/15 text-red-600 uppercase" : "bg-saffron/15 text-saffron uppercase"}>
                        {a.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-mono text-navy font-bold">{a.allocatedStall || "—"}</TableCell>
                    <TableCell>
                      {a.status === "pending" ? (
                        <div className="flex gap-1">
                          <Button size="sm" className="bg-india-green text-white hover:bg-india-green/90" onClick={() => handleApprove(a.id, a.employerName)}><Check className="h-3.5 w-3.5" /></Button>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => handleReject(a.id, a.employerName)}><X className="h-3.5 w-3.5" /></Button>
                        </div>
                      ) : a.status === "approved" ? (
                        <Button asChild size="sm" variant="outline" className="border-navy/20 text-navy hover:bg-navy/5">
                          <Link to="/admin/allocation/$eventId" params={{ eventId: a.eventId.toString() }} search={{ tab: "company", app: a.id.toString() }}>Allocate Stall</Link>
                        </Button>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
    </DashShell>
  );
}
