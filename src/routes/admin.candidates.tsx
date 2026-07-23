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

interface Candidate {
  id: string;
  name: string;
  qual: string;
  district: string;
  status: string;
  attended: boolean;
}

function Candidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch real data from Render backend
  const fetchCandidates = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("https://bcc-backend-0cny.onrender.com/api/admin/candidates");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setCandidates(json.data);
        }
      }
    } catch (error) {
      console.error("Error fetching candidates:", error);
      toast.error("Network error while connecting to server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // Update Status Function with Optimistic UI Update
  const updateStatus = async (candidateId: string, newStatus: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, status: newStatus } : c))
    );

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
        fetchCandidates();
      }
    } catch (err) {
      toast.error("Network error while connecting to server.");
      fetchCandidates();
    }
  };

  // Filter candidates by search term
  const filteredCandidates = candidates.filter((c) => {
    const query = searchTerm.toLowerCase();
    return (
      (c.id || "").toLowerCase().includes(query) ||
      (c.name || "").toLowerCase().includes(query) ||
      (c.district || "").toLowerCase().includes(query) ||
      (c.qual || "").toLowerCase().includes(query)
    );
  });

  return (
    <DashShell role="admin" nav={adminNav}>
      <PageHeader
        title="Candidate Management"
        description="Approve, verify and track all registered candidates."
        action={
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-1" />
            Bulk Import
          </Button>
        }
      />

      <Card className="p-4 mb-4 border-border/60 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by ID, name, district, qualification…"
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
                <Checkbox />
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Qualification</TableHead>
              <TableHead>District</TableHead>
              <TableHead>Attendance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-navy" />
                </TableCell>
              </TableRow>
            ) : filteredCandidates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                  No candidates found.
                </TableCell>
              </TableRow>
            ) : (
              filteredCandidates.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Checkbox />
                  </TableCell>
                  <TableCell className="font-mono text-xs">{c.id}</TableCell>
                  <TableCell className="font-medium text-navy">{c.name}</TableCell>
                  <TableCell className="text-sm">{c.qual}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.district}</TableCell>
                  <TableCell>
                    {c.attended ? (
                      <Badge className="bg-india-green/15 text-india-green">QR ✓</Badge>
                    ) : (
                      <Badge variant="outline">—</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        c.status === "Pending"
                          ? "bg-saffron/15 text-saffron"
                          : c.status === "Rejected"
                          ? "bg-red-500/15 text-red-600"
                          : "bg-india-green/15 text-india-green"
                      }
                    >
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
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
