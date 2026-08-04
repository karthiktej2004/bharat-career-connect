import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DashShell, PageHeader } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, Trash2, Loader2, Download, RefreshCcw, Mail, Phone } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/employers")({
  head: () => ({ meta: [{ title: "Employers — Admin" }] }),
  component: Employers,
});

interface Employer {
  id: string;
  dbId: number;
  name: string;
  email?: string;
  phone?: string;
  pocs?: { email: string; phone: string }[];
  gst: string;
  jobs: number;
  status: string;
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
  const handleStatusUpdate = async (dbId: number, status: string) => {
    // 1. Optimistically update local state immediately so UI changes instantly
    setEmployers((prev) =>
      prev.map((e) => (e.dbId === dbId ? { ...e, status: status } : e))
    );

    try {
      const response = await fetch(`http://15.207.249.155:5000/api/admin/employers/${dbId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await response.json();
      if (json.success) {
        toast.success(`Employer successfully marked as ${status}!`);
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

    const csvRows = ["ID,Company,Main Email,Main Phone,GST,Active Jobs,Status"];
    dataToExport.forEach((e) => {
      // Escape quotes in name to prevent CSV breaking
      const safeName = e.name.replace(/"/g, '""');
      csvRows.push(`"${e.id}","${safeName}","${e.email || ''}","${e.phone || ''}","${e.gst}",${e.jobs},"${e.status}"`);
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
        description="Approve, verify, and track participating companies and their points of contact." 
        action={
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            {selectedIds.size > 0 ? `Export Selected (${selectedIds.size})` : "Export All Data"}
          </Button>
        }
      />
      <Card className="border-border/60 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-8 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading employers...
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                  <TableHead>Main Contact</TableHead>
                  <TableHead>PoC Details</TableHead>
                  <TableHead className="text-center">Active Jobs</TableHead>
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
                    <TableRow key={e.id} className={e.status === 'deleted' || e.status === 'Blacklisted' ? 'bg-slate-50/50 opacity-75' : ''}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedIds.has(e.dbId)}
                          onCheckedChange={(checked) => handleSelectOne(e.dbId, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs font-medium text-navy">{e.id}</TableCell>
                      <TableCell>
                        <div className="font-semibold text-navy mb-1">{e.name}</div>
                        <Badge variant="outline" className={e.gst === "Verified" ? "border-india-green text-india-green text-[10px]" : "border-saffron text-saffron text-[10px]"}>
                          GST: {e.gst}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-navy mb-1">
                          <Mail className="h-3 w-3 text-muted-foreground" /> {e.email || 'N/A'}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3 text-muted-foreground" /> {e.phone || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {e.pocs && e.pocs.length > 0 ? (
                          <div className="space-y-1.5">
                            <Badge variant="secondary" className="text-[10px]">{e.pocs.length} Active PoC(s)</Badge>
                            <div className="max-h-[60px] overflow-y-auto pr-2 space-y-1">
                              {e.pocs.map((poc, idx) => (
                                <div key={idx} className="text-[10px] leading-tight border-l-2 border-navy/20 pl-2">
                                  <div className="font-semibold text-navy truncate max-w-[120px]">{poc.email}</div>
                                  <div className="text-muted-foreground">{poc.phone}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">No extra PoCs</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-semibold text-navy">{e.jobs}</TableCell>
                      <TableCell>
                        <Badge className={
                          e.status === 'approved' || e.status === 'Active' || e.status === 'active' ? "bg-india-green/15 text-india-green" : 
                          e.status === 'deleted' || e.status === 'Blacklisted' ? "bg-slate-200 text-slate-600" :
                          e.status === 'rejected' ? "bg-orange-500/15 text-orange-600" :
                          "bg-saffron/15 text-saffron"
                        }>
                          {e.status === 'approved' ? 'Active' : e.status === 'Blacklisted' ? 'Deleted' : e.status.charAt(0).toUpperCase() + e.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="w-[140px]">
                        <div className="flex flex-col gap-2 w-full">
                          {e.status === 'deleted' || e.status === 'Blacklisted' ? (
                            <Button size="sm" variant="outline" className="text-blue-600 border-blue-300 hover:bg-blue-50 w-full justify-start h-8" onClick={() => handleStatusUpdate(e.dbId, 'approved')}>
                              <RefreshCcw className="h-3.5 w-3.5 mr-2" /> Reactivate
                            </Button>
                          ) : (
                            <>
                              <Button size="sm" variant="outline" className="text-india-green border-india-green hover:bg-india-green/10 w-full justify-start h-8" onClick={() => handleStatusUpdate(e.dbId, 'approved')}>
                                <CheckCircle2 className="h-3.5 w-3.5 mr-2" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" className="text-orange-500 border-orange-200 hover:bg-orange-50 w-full justify-start h-8" onClick={() => handleStatusUpdate(e.dbId, 'rejected')}>
                                <XCircle className="h-3.5 w-3.5 mr-2" /> Reject
                              </Button>
                              <Button size="sm" variant="outline" className="text-slate-500 border-slate-300 hover:bg-slate-100 w-full justify-start h-8" onClick={() => handleStatusUpdate(e.dbId, 'deleted')}>
                                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </DashShell>
  );
}
