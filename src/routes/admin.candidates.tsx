import { createFileRoute } from "@tanstack/react-router";
import { DashShell, PageHeader } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2, Download, Ban, Unlock } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/candidates")({
  head: () => ({ meta: [{ title: "Candidates — Admin" }] }),
  component: Candidates,
});

function Candidates() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchCandidates = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/candidates`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setCandidates(json.data);
        }
      }
    } catch (error) {
      toast.error("Error fetching candidates from server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const term = searchTerm.toLowerCase();
      return (
        c.id?.toLowerCase().includes(term) ||
        c.name?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.phone?.includes(term) ||
        c.district?.toLowerCase().includes(term)
      );
    });
  }, [candidates, searchTerm]);

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

  const handleExport = () => {
    const dataToExport = selectedIds.size > 0 
      ? candidates.filter(c => selectedIds.has(c.id)) 
      : candidates;

    if (dataToExport.length === 0) {
      toast.error("No data available to export.");
      return;
    }

    const csvRows = ["ID,Name,Email,Phone,Qualification,District,Account Status"];
    dataToExport.forEach((c) => {
      csvRows.push(`"${c.id}","${c.name}","${c.email || ''}","${c.phone || ''}","${c.qual}","${c.district}","${c.account_status}"`);
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

  // --- NEW BLOCK/UNBLOCK LOGIC ---
  const toggleBlockStatus = async (candidateId: string, action: "Block" | "Unblock", candidateName: string) => {
    if (action === "Block") {
        if (!confirm(`Are you sure you want to block ${candidateName}? They will not be able to log in.`)) return;
    }

    const newStatus = action === "Block" ? "Blocked" : "Active";

    // Optimistic UI update
    setCandidates((prev) => 
      prev.map((c) => (c.id === candidateId ? { ...c, account_status: newStatus } : c))
    );

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/candidates/${candidateId}/block`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      
      const result = await res.json();
      
      if (result.success) {
        toast.success(`Candidate account has been ${newStatus.toLowerCase()}.`);
      } else {
        toast.error(result.message || "Failed to update account status.");
        fetchCandidates(); // Revert back to server truth if it failed
      }
    } catch (err) {
      toast.error("Network error while connecting to server.");
      fetchCandidates(); 
    }
  };

  return (
    <DashShell role="admin" nav={adminNav}>
      <PageHeader title="Candidate Management" description="Manage user accounts, monitor registrations, and moderate platform access." action={
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
            placeholder="Search by ID, name, email, phone, or district…" 
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
              <TableHead>Contact Info</TableHead>
              <TableHead>Qualification</TableHead>
              <TableHead>District</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin mx-auto text-navy"/></TableCell></TableRow>
            ) : filteredCandidates.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">No candidates found.</TableCell></TableRow>
            ) : (
              filteredCandidates.map((c) => (
                <TableRow key={c.id} className={c.account_status === 'Blocked' ? "bg-red-50/50" : ""}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedIds.has(c.id)}
                      onCheckedChange={(checked) => handleSelectOne(c.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs">{c.id}</TableCell>
                  <TableCell className="font-medium text-navy">
                    {c.name}
                    {c.account_status === 'Blocked' && <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold uppercase">Blocked</span>}
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="font-medium">{c.email || 'N/A'}</div>
                    <div className="text-muted-foreground mt-0.5">{c.phone || 'N/A'}</div>
                  </TableCell>
                  <TableCell className="text-sm">{c.qual}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.district}</TableCell>
                  
                  <TableCell className="text-right">
                    {c.account_status === 'Blocked' ? (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-india-green border-india-green hover:bg-india-green/10 font-medium"
                          onClick={() => toggleBlockStatus(c.id, "Unblock", c.name)}
                        >
                          <Unlock className="h-4 w-4 mr-2" /> Unblock
                        </Button>
                    ) : (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600 border-red-200 hover:bg-red-50 font-medium"
                          onClick={() => toggleBlockStatus(c.id, "Block", c.name)}
                        >
                          <Ban className="h-4 w-4 mr-2" /> Block Account
                        </Button>
                    )}
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
