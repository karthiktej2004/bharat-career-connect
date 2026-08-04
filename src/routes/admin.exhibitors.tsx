import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DashShell, PageHeader } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, Loader2, Store } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/exhibitors")({
  head: () => ({ meta: [{ title: "Exhibitor Management — Admin" }] }),
  component: AdminExhibitors,
});

function AdminExhibitors() {
  const [exhibitors, setExhibitors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchExhibitors = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/exhibitors`);
      const json = await res.json();
      if (json.success) setExhibitors(json.data);
    } catch (error) {
      toast.error("Failed to fetch exhibitors from database.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExhibitors();
  }, []);

  const updateStatus = async (dbId: number, status: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/exhibitors/${dbId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const json = await res.json();
      
      if (json.success) {
        toast.success(json.message);
        // Update local state instantly to feel fast
        setExhibitors(prev => prev.map(exh => exh.dbId === dbId ? { ...exh, status } : exh));
      } else {
        toast.error(json.message || "Failed to update status.");
      }
    } catch (error) {
      toast.error("Network error while updating status.");
    }
  };

  return (
    <DashShell role="admin" nav={adminNav}>
      <PageHeader 
        title="Exhibitor Management" 
        description="Approve and manage non-hiring exhibitor accounts for your events." 
      />

      <Card className="border-border/60 mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exhibitor ID</TableHead>
              <TableHead>Company Name</TableHead>
              <TableHead>Contact Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-navy"/>
                </TableCell>
              </TableRow>
            ) : exhibitors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground flex flex-col items-center">
                  <Store className="h-10 w-10 opacity-20 mb-2" />
                  No exhibitors registered yet.
                </TableCell>
              </TableRow>
            ) : (
              exhibitors.map((exh) => (
                <TableRow key={exh.id}>
                  <TableCell className="font-mono text-sm text-slate-500">{exh.id}</TableCell>
                  <TableCell className="font-bold text-navy">{exh.name}</TableCell>
                  <TableCell>
                    <div className="text-sm">{exh.email}</div>
                    <div className="text-xs text-muted-foreground">{exh.phone}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      exh.status === 'approved' ? "bg-india-green/15 text-india-green" : 
                      exh.status === 'rejected' ? "bg-red-500/15 text-red-600" : 
                      "bg-saffron/15 text-saffron"
                    }>
                      {exh.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-india-green border-india-green/40 hover:bg-india-green/10"
                        onClick={() => updateStatus(exh.dbId, 'approved')}
                        disabled={exh.status === 'approved'}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-destructive border-destructive/40 hover:bg-destructive/10"
                        onClick={() => updateStatus(exh.dbId, 'rejected')}
                        disabled={exh.status === 'rejected'}
                      >
                        <XCircle className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </DashShell>
  );
}
