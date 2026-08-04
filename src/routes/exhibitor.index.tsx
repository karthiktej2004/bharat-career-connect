import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DashShell, PageHeader, StatCard } from "@/components/DashShell";
import { exhibitorNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, Users, QrCode, Megaphone, Calendar, CheckCircle2 } from "lucide-react";
import { getSession } from "@/lib/mockStore";

export const Route = createFileRoute("/exhibitor/")({
  head: () => ({ meta: [{ title: "Exhibitor Dashboard — Bharat Career Connect" }] }),
  component: ExhibitorDashboard,
});

function ExhibitorDashboard() {
  const user = getSession();
  const [stats, setStats] = useState<any>({
    activeEvents: 0,
    visitorLeads: 0,
    representatives: 0,
    promotions: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/exhibitor/dashboard/${user.id}`);
        const json = await res.json();
        if (json.success) {
          setStats(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  return (
    <DashShell role="exhibitor" nav={exhibitorNav}>
      <PageHeader 
        title={`Welcome, ${user?.name || "Exhibitor"}`} 
        description="Manage your event stalls, captured visitor leads, and promotional campaigns." 
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          label="Registered Events" 
          value={isLoading ? "..." : stats.activeEvents} 
          icon={Calendar} 
          accent="india-green" 
        />
        <StatCard 
          label="Visitor Leads Captured" 
          value={isLoading ? "..." : stats.visitorLeads} 
          icon={QrCode} 
          accent="saffron" 
        />
        <StatCard 
          label="Stall Representatives" 
          value={isLoading ? "..." : stats.representatives} 
          icon={Users} 
          accent="navy" 
        />
        <StatCard 
          label="Active Banners" 
          value={isLoading ? "..." : stats.promotions} 
          icon={Megaphone} 
          accent="india-green" 
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-6 border-border/60 lg:col-span-2">
          <h2 className="font-display font-bold text-navy mb-2">Exhibitor Control Center</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Welcome to your exhibitor portal! From here, you can manage your stall details, register booth representatives who will manage your event stall, collect leads using QR code scans, and publish promotional banners for upcoming Udyoga Melas.
          </p>
        </Card>

        <Card className="p-6 border-border/60">
          <h2 className="font-display font-bold text-navy mb-4">Account Status</h2>
          <div className="flex items-center justify-between p-3 rounded-lg bg-india-green/10 border border-india-green/20">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-india-green" />
              <span className="text-sm font-medium text-navy">Account Verified</span>
            </div>
            <Badge className="bg-india-green text-white">ACTIVE</Badge>
          </div>
        </Card>
      </div>
    </DashShell>
  );
}
