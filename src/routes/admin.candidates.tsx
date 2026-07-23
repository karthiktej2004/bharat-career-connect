import { createFileRoute } from "@tanstack/react-router";
import { DashShell, PageHeader } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Search, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
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
  attended: i % 2 === 0,
}));

function Candidates() {
  const [candidates, setCandidates] = useState<any[]>(fallbackData);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch real data from the backend
  const fetchCandidates = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("https://bcc-backend-0cny.onrender.com/api/admin/candidates");
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

  // Update Status Function
  const updateStatus = async (candidateId: string, newStatus: string) => {
    // 1. Optimistic UI update (makes the UI feel snappy instantly)
    setCandidates((prev) => 
      prev.map((c) => (c.id === candidateId ? { ...c, status: newStatus } : c))
    );

    // 2. Production API Call
    try {
      const res = await fetch(`https://bcc-backend-0cny.onrender.com/api/admin/candidates/${candidateId}/status`, {
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
        <Button variant="outline"><Upload className="h-4 w-4 mr-1" />Bulk Import</Button>
      } />
      
      <Card className="p-4 mb-4 border-border/60 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by ID, name, district…" />
        </div>
      </Card>
      
      <Card className="border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"><Checkbox /></TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Qualification</TableHead>
              <TableHead>District</TableHead>
              <TableHead>Attendance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin mx-auto text-navy"/></TableCell></TableRow>
            ) : candidates.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-10 text-muted-foreground">No candidates found.</TableCell></TableRow>
            ) : (
              candidates.map((c) => (
                <TableRow key={c.id}>
                  <TableCell><Checkbox /></TableCell>
                  <TableCell className="font-mono text-xs">{c.id}</TableCell>
                  <TableCell className="font-medium text-navy">{c.name}</TableCell>
                  <TableCell className="text-sm">{c.qual}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.district}</TableCell>
                  <TableCell>
                    {c.attended ? <Badge className="bg-india-green/15 text-india-green">QR ✓</Badge> : <Badge variant="outline">—</Badge>}
                  </TableCell>
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
                    <div className="flex gap-1">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-india-green hover:bg-india-green/10"
                        onClick={() => updateStatus(c.id, "Verified")}
                        title="Verify Candidate"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => updateStatus(c.id, "Rejected")}
                        title="Reject Candidate"
                      >
                        <XCircle className="h-4 w-4" />
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
