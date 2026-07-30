import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DashShell, PageHeader } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Star, CheckCircle2, XCircle, Ban, Loader2 } from "lucide-react";
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

  // Fetch real data from express backend
  const fetchEmployers = async () => {
    try {
      setLoading(true);
      const response = await fetch("${import.meta.env.VITE_API_BASE_URL}/api/admin/employers");
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/employers/${dbId}/status`, {
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

  return (
    <DashShell role="admin" nav={adminNav}>
      <PageHeader title="Employer Management" description="Approve, verify and rate employer participation." />
      <Card className="border-border/60">
        {loading ? (
          <div className="flex justify-center items-center p-8 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading employers...
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
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
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                    No employers found.
                  </TableCell>
                </TableRow>
              ) : (
                employers.map((e) => (
                  <TableRow key={e.id}>
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
                        {e.status}
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
                          <Ban className="h-3.5 w-3.5 mr-1" /> Blacklist
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
