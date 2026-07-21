import { createFileRoute } from "@tanstack/react-router";
import { DashShell, PageHeader, StatCard } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallet, IndianRupee, Receipt, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/admin/payments")({
  head: () => ({ meta: [{ title: "Payments — Admin" }] }),
  component: Payments,
});

const invoices = [
  { id: "INV-2026-0148", employer: "Infosys", amount: "₹2,40,000", desc: "Premium Stall · Bengaluru Aug 2026", status: "Paid", date: "2026-06-12" },
  { id: "INV-2026-0149", employer: "Wipro", amount: "₹1,80,000", desc: "Standard Stall · Bengaluru Aug 2026", status: "Paid", date: "2026-06-14" },
  { id: "INV-2026-0150", employer: "Bosch", amount: "₹95,000", desc: "Standard Stall · Mysuru Jul 2026", status: "Pending", date: "2026-06-20" },
  { id: "INV-2026-0151", employer: "Reliance Retail", amount: "₹3,60,000", desc: "Premium + Walk-in · Bengaluru Aug 2026", status: "Paid", date: "2026-06-18" },
  { id: "INV-2026-0152", employer: "Acme Pvt Ltd", amount: "₹45,000", desc: "Compact Stall · Mysuru Jul 2026", status: "Refunded", date: "2026-06-22" },
];

function Payments() {
  return (
    <DashShell role="admin" nav={adminNav}>
      <PageHeader title="Payment & Financial Management" description="Stall booking fees, invoices and refunds." />
      <div className="grid sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="Collected (YTD)" value="₹1.84 Cr" icon={IndianRupee} accent="india-green" />
        <StatCard label="Pending" value="₹12.4 L" icon={Wallet} accent="saffron" />
        <StatCard label="Invoices" value="148" icon={Receipt} accent="navy" />
        <StatCard label="Refunds" value="₹85K" icon={RefreshCw} />
      </div>
      <Card className="border-border/60">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-display font-bold text-navy">Recent Invoices</h2>
          <Button size="sm" className="bg-saffron text-navy hover:bg-saffron/90">Generate Invoice</Button>
        </div>
        <Table>
          <TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Employer</TableHead><TableHead>Description</TableHead><TableHead>Amount</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {invoices.map((i) => (
              <TableRow key={i.id}>
                <TableCell className="font-mono text-xs">{i.id}</TableCell>
                <TableCell className="font-medium text-navy">{i.employer}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{i.desc}</TableCell>
                <TableCell className="font-semibold">{i.amount}</TableCell>
                <TableCell className="text-sm">{new Date(i.date).toLocaleDateString("en-IN")}</TableCell>
                <TableCell><Badge className={i.status === "Paid" ? "bg-india-green/15 text-india-green" : i.status === "Pending" ? "bg-saffron/15 text-saffron" : "bg-muted text-foreground"}>{i.status}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </DashShell>
  );
}
