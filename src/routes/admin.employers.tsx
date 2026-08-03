import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DashShell, PageHeader } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Star, CheckCircle2, XCircle, Trash2, Loader2, Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/employers")({
  head: () => ({ meta: [{ title: "Employers — Admin" }] }),
  component: Employers,
});

interface Employer {
  id: string;
  dbId: number;
  name: string;
  gst: string;
  jobs: number;
  rating: number;
  status: "Active" | "Pending" | "Blacklisted";
}

function Employers() {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for Selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Fetch real data from express backend using the AWS production server URL
  const fetchEmployers = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://15.207.249.155:5000/api/admin/employers");
      const json = await response.json();
      if (json.success) {
        setEmployers(json.data);
      }
    } catch (error) {
      console.error("Failed to load employers:", error);
      toast.error("Failed to load employers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployers();
  }, []);

  // Update employer status dynamically with zero-flicker optimistic update
  const handleStatusUpdate = async (dbId: number, status: "approved" | "rejected" | "blacklisted") => {
    // 1. Optimistically update local state immediately so UI changes instantly
    const targetStatusMapped = status === "approved" ? "Active" : status === "blacklisted" ? "Blacklisted" : "Pending";
    
    setEmployers((prev) =>
      prev.map((e) => (e.dbId === dbId ? { ...e, status: targetStatusMapped as any } : e))
    );

    try {
      const response = await fetch(`http://15.207.249.155:5000/api/admin/employers/${dbId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await response.json();
      if (json.success) {
        toast.success(`Employer successfully marked as ${status === 'blacklisted' ? 'deleted' : status}!`);
      } else {
        toast.error(json.message || "Failed to update status.");
        fetchEmployers(); // Roll back if backend rejected it
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Server connection error.");
      fetchEmployers(); // Roll back on network error
    }
  };

  // --- Selection Logic ---
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(employers.map((e) => e.dbId)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (dbId: number, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(dbId);
    } else {
      newSelected.delete(dbId);
    }
    setSelectedIds(newSelected);
  };

  // --- Export Logic ---
  const handleExport = () => {
    const dataToExport = selectedIds.size > 0 
      ? employers.filter(e => selectedIds.has(e.dbId)) 
      : employers;

    if (dataToExport.length === 0) {
      toast.error("No data available to export.");
      return;
    }

    const csvRows = ["ID,Company,GST,Active Jobs,Rating,Status"];
    dataToExport.forEach((e) => {
      // Escape quotes in name to prevent CSV breaking
      const safeName = e.name.replace(/"/g, '""');
      csvRows.push(`"${e.id}","${safeName}","${e.gst}",${e.jobs},${e.rating},"${e.status}"`);
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Employers_Export_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success(`Exported ${dataToExport.length} employers successfully.`);
  };

  return (
    <DashShell role="admin" nav={adminNav}>
      <PageHeader 
        title="Employer Management" 
        description="Approve, verify and rate employer participation." 
        action={
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            {selectedIds.size > 0 ? `Export Selected (${selectedIds.size})` : "Export All Data"}
          </Button>
        }
      />
      <Card className="border-border/60">
        {loading ? (
          <div className="flex justify-center items-center p-8 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading employers...
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox 
                    checked={employers.length > 0 && selectedIds.size === employers.length}
                    onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                  />
                </TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>GST</TableHead>
                <TableHead>Active Jobs</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-6">
                    No employers found.
                  </TableCell>
                </TableRow>
              ) : (
                employers.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedIds.has(e.dbId)}
                        onCheckedChange={(checked) => handleSelectOne(e.dbId, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs">{e.id}</TableCell>
                    <TableCell className="font-medium text-navy">{e.name}</TableCell>
                    <TableCell>
                      <Badge className={e.gst === "Verified" ? "bg-india-green/15 text-india-green" : "bg-saffron/15 text-saffron"}>
                        {e.gst}
                      </Badge>
                    </TableCell>
                    <TableCell>{e.jobs}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-saffron text-saffron" />
                        {e.rating}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={e.status === "Active" ? "bg-india-green/15 text-india-green" : e.status === "Pending" ? "bg-saffron/15 text-saffron" : "bg-destructive/15 text-destructive"}>
                        {e.status === "Blacklisted" ? "Deleted" : e.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 border-india-green/40 text-india-green hover:bg-india-green/10" 
                          onClick={() => handleStatusUpdate(e.dbId, "approved")}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 border-amber-500/40 text-amber-600 hover:bg-amber-500/10" 
                          onClick={() => handleStatusUpdate(e.dbId, "rejected")}
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 border-destructive/40 text-destructive hover:bg-destructive/10" 
                          onClick={() => handleStatusUpdate(e.dbId, "blacklisted")}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </DashShell>
  );
}
