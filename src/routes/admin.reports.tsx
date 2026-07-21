import { createFileRoute } from "@tanstack/react-router";
import { DashShell, PageHeader, StatCard } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileSpreadsheet, TrendingUp, Users, Briefcase, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, LineChart, Line } from "recharts";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({ meta: [{ title: "Reports — Admin" }] }),
  component: Reports,
});

const districts = [
  { d: "Bengaluru", reg: 4820, hired: 1240 },
  { d: "Mysuru", reg: 2140, hired: 680 },
  { d: "Hubballi", reg: 1850, hired: 520 },
  { d: "Mangaluru", reg: 1320, hired: 380 },
  { d: "Belagavi", reg: 980, hired: 220 },
];
const trend = Array.from({ length: 12 }, (_, i) => ({ m: ["J","F","M","A","M","J","J","A","S","O","N","D"][i], v: Math.floor(200 + Math.random() * 800) }));
const industry = [
  { i: "IT", h: 1240 }, { i: "Retail", h: 880 }, { i: "Manufacturing", h: 740 }, { i: "Banking", h: 420 }, { i: "Logistics", h: 320 },
];

function Reports() {
  return (
    <DashShell role="admin" nav={adminNav}>
      <PageHeader title="Reports & Analytics" description="Government-grade employment outcome reporting." action={
        <div className="flex gap-2"><Button variant="outline"><Download className="h-4 w-4 mr-1" />PDF</Button><Button variant="outline"><FileSpreadsheet className="h-4 w-4 mr-1" />Excel</Button></div>
      } />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Registrations" value="11,110" icon={Users} accent="navy" />
        <StatCard label="Interviews" value="3,240" icon={Briefcase} accent="saffron" />
        <StatCard label="Offers Generated" value="1,040" icon={Award} accent="india-green" trend="+22% YoY" />
        <StatCard label="Hiring Rate" value="9.4%" icon={TrendingUp} accent="india-green" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6 border-border/60">
          <h2 className="font-display font-bold text-navy mb-4">District-wise Hiring</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={districts}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="d" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="reg" fill="var(--saffron)" radius={[6, 6, 0, 0]} name="Registered" />
              <Bar dataKey="hired" fill="var(--india-green)" radius={[6, 6, 0, 0]} name="Hired" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-6 border-border/60">
          <h2 className="font-display font-bold text-navy mb-4">Hiring Trend (12 months)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="m" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="v" stroke="var(--navy)" strokeWidth={3} dot={{ fill: "var(--saffron)", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <Card className="p-6 border-border/60">
        <h2 className="font-display font-bold text-navy mb-4">Industry-wise Hiring Report</h2>
        <Table>
          <TableHeader><TableRow><TableHead>Industry</TableHead><TableHead>Hires</TableHead><TableHead>Share</TableHead></TableRow></TableHeader>
          <TableBody>
            {industry.map((r, i) => {
              const total = industry.reduce((a, b) => a + b.h, 0);
              return (
                <TableRow key={r.i}>
                  <TableCell className="font-medium text-navy">{r.i}</TableCell>
                  <TableCell>{r.h.toLocaleString("en-IN")}</TableCell>
                  <TableCell><div className="flex items-center gap-2"><div className="h-2 bg-muted rounded-full flex-1 max-w-32 overflow-hidden"><div className="h-full bg-saffron" style={{ width: `${(r.h / total) * 100}%` }} /></div>{Math.round((r.h / total) * 100)}%</div></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </DashShell>
  );
}
