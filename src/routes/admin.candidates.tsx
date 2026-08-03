import { createFileRoute } from "@tanstack/react-router";
import { DashShell, PageHeader } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2, Download } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/candidates")({
  head: () => ({ meta: [{ title: "Candidates — Admin" }] }),
  component: Candidates,
});

// Fallback data for testing until the GET endpoint is fully active
const fallbackData = Array.from({ length: 10 }, (_, i) => ({
  id: `BCC-${10001 + i}`,
  name: ["Ramesh K.", "Priya S.", "Mohammed I.", "Lakshmi N.", "Arjun R.", "Suresh M.", "Anita P.", "Vikram J.", "Kiran B.", "Deepa R."][i],
  qual: ["BE/B-Tech", "UG Degree", "ITI", "Diploma", "12th std", "BE/B-Tech", "UG Degree", "ITI", "Diploma", "BE/B-Tech"][i],
  district: ["Bengaluru Urban", "Mysuru", "Hubballi", "Bengaluru Urban", "Bengaluru Urban", "Mysuru", "Hubballi", "Mysuru", "Bengaluru Urban", "Hubballi"][i],
  status: i % 3 === 0 ? "Pending" : i % 3 === 1 ? "Approved" : "Verified",
}));

function Candidates() {
  const [candidates, setCandidates] = useState<any[]>(fallbackData);
  const [isLoading, setIsLoading] = useState(false);
  
  // New States for Search and Selection
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Fetch real data from the backend
  const fetchCandidates = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/candidates`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          setCandidates(json.data);
        }
      }
    } catch (error) {
      console.error("Error fetching candidates:", error);
      // Fallback to mock data on error for now
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // 1. Search Filter Logic
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const term = searchTerm.toLowerCase();
      return (
        c.id?.toLowerCase().includes(term) ||
        c.name?.toLowerCase().includes(term) ||
        c.district?.toLowerCase().includes(term)
      );
    });
  }, [candidates, searchTerm]);

  // 2. Selection Logic
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredCandidates.map((c) => c.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  // 3. Export Logic (If selected, export selected. If none selected, export all)
  const handleExport = () => {
    const dataToExport = selectedIds.size > 0 
      ? candidates.filter(c => selectedIds.has(c.id)) 
      : candidates;

    if (dataToExport.length === 0) {
      toast.error("No data available to export.");
      return;
    }

    const csvRows = ["ID,Name,Qualification,District,Status"];
    dataToExport.forEach((c) => {
      csvRows.push(`"${c.id}","${c.name}","${c.qual}","${c.district}","${c.status}"`);
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Candidates_Export_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success(`Exported ${dataToExport.length} candidates successfully.`);
  };

  // 4. Update Status Function
  const updateStatus = async (candidateId: string, newStatus: string) => {
    // Optimistic UI update
    setCandidates((prev) => 
      prev.map((c) => (c.id === candidateId ? { ...c, status: newStatus } : c))
    );

    // Production API Call
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/candidates/${candidateId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      
      const result = await res.json();
      
      if (result.success) {
        toast.success(`Candidate marked as ${newStatus}`);
      } else {
        toast.error(result.message || "Failed to update status");
        fetchCandidates(); // Revert back to server truth if it failed
      }
    } catch (err) {
      toast.error("Network error while connecting to server.");
      fetchCandidates(); // Revert back to server truth if it failed
    }
  };

  return (
    <DashShell role="admin" nav={adminNav}>
      <PageHeader title="Candidate Management" description="Approve, verify and track all registered candidates." action={
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          {selectedIds.size > 0 ? `Export Selected (${selectedIds.size})` : "Export All Data"}
        </Button>
      } />
      
      <Card className="p-4 mb-4 border-border/60 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            className="pl-9" 
            placeholder="Search by ID, name, district…" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>
      
      <Card className="border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox 
                  checked={filteredCandidates.length > 0 && selectedIds.size === filteredCandidates.length}
                  onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                />
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Qualification</TableHead>
              <TableHead>District</TableHead>
              {/* Removed Attendance Column */}
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin mx-auto text-navy"/></TableCell></TableRow>
            ) : filteredCandidates.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">No candidates found.</TableCell></TableRow>
            ) : (
              filteredCandidates.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedIds.has(c.id)}
                      onCheckedChange={(checked) => handleSelectOne(c.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs">{c.id}</TableCell>
                  <TableCell className="font-medium text-navy">{c.name}</TableCell>
                  <TableCell className="text-sm">{c.qual}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.district}</TableCell>
                  {/* Removed Attendance Cell Data */}
                  <TableCell>
                    <Badge className={
                      c.status === "Pending" ? "bg-saffron/15 text-saffron" : 
                      c.status === "Rejected" ? "bg-red-500/15 text-red-600" : 
                      "bg-india-green/15 text-india-green"
                    }>
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="bg-india-green text-white hover:bg-india-green/90 font-medium"
                        onClick={() => updateStatus(c.id, "Verified")}
                      >
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 border-red-200 hover:bg-red-50 font-medium"
                        onClick={() => updateStatus(c.id, "Rejected")}
                      >
                        Reject
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
