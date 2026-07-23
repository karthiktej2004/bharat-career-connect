import { createFileRoute } from "@tanstack/react-router";
import { DashShell, PageHeader } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus, Search, Ban, CheckCircle2, Trash2, Loader2, AlertTriangle } from "lucide-react";
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

export function Candidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openRegisterModal, setOpenRegisterModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deletingCandidate, setDeletingCandidate] = useState<Candidate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    qualification: "BE/B-Tech",
    district: "Bengaluru Urban",
    experienceType: "Fresher",
  });

  const fetchCandidates = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("https://bcc-backend-0cny.onrender.com/api/admin/candidates");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) setCandidates(json.data);
      }
    } catch (error) {
      toast.error("Network error fetching candidates.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const toggleStatus = async (candidateId: string, currentStatus: string) => {
    const newStatus = currentStatus === "Blocked" ? "Verified" : "Blocked";

    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, status: newStatus } : c))
    );

    try {
      const res = await fetch(`https://bcc-backend-0cny.onrender.com/api/admin/candidates/${candidateId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(`Candidate account ${newStatus === "Blocked" ? "blocked" : "unblocked"} successfully.`);
      } else {
        toast.error(json.message || "Failed to update status.");
        fetchCandidates();
      }
    } catch (err) {
      toast.error("Server connection failed.");
      fetchCandidates();
    }
  };

  const handleDeleteCandidate = async () => {
    if (!deletingCandidate) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`https://bcc-backend-0cny.onrender.com/api/admin/candidates/${deletingCandidate.id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (json.success) {
        toast.success(`Candidate ${deletingCandidate.name} permanently deleted.`);
        setCandidates((prev) => prev.filter((c) => c.id !== deletingCandidate.id));
        setDeletingCandidate(null);
      } else {
        toast.error(json.message || "Failed to delete candidate.");
      }
    } catch (err) {
      toast.error("Error deleting candidate from server.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleManualRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.phone) {
      toast.error("Please enter candidate name and mobile number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("https://bcc-backend-0cny.onrender.com/api/admin/candidates/manual-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(`Candidate registered successfully! ID: ${json.uniqueId}`);
        setOpenRegisterModal(false);
        setForm({ fullName: "", email: "", phone: "", qualification: "BE/B-Tech", district: "Bengaluru Urban", experienceType: "Fresher" });
        fetchCandidates();
      } else {
        toast.error(json.message || "Registration failed.");
      }
    } catch (err) {
      toast.error("Server error creating manual candidate entry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCandidates = candidates.filter((c) => {
    const query = searchTerm.toLowerCase();
    return (
      (c.id || "").toLowerCase().includes(query) ||
      (c.name || "").toLowerCase().includes(query) ||
      (c.district || "").toLowerCase().includes(query)
    );
  });

  return (
    <DashShell role="admin" nav={adminNav}>
      <PageHeader
        title="Candidate Management"
        description="Verify, block, or permanently remove registered candidates."
        action={
          <Dialog open={openRegisterModal} onOpenChange={setOpenRegisterModal}>
            <DialogTrigger asChild>
              <Button className="bg-saffron text-navy hover:bg-saffron/90 font-bold">
                <UserPlus className="h-4 w-4 mr-1" />
                Manual Candidate Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>On-the-Spot Candidate Registration</DialogTitle>
                <DialogDescription>
                  Register candidates on behalf of Bharat Career Connect if they cannot register themselves.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleManualRegister} className="space-y-3 mt-2">
                <div>
                  <Label>Full Name *</Label>
                  <Input
                    className="mt-1"
                    placeholder="Candidate Name"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Mobile Number *</Label>
                  <Input
                    className="mt-1"
                    placeholder="10-digit mobile"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Email Address (Optional)</Label>
                  <Input
                    className="mt-1"
                    placeholder="Email ID"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Qualification</Label>
                  <Input
                    className="mt-1"
                    value={form.qualification}
                    onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                  />
                </div>
                <div>
                  <Label>District</Label>
                  <Input
                    className="mt-1"
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-2 mt-4 pt-2 border-t">
                  <Button type="button" variant="outline" onClick={() => setOpenRegisterModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-navy text-white hover:bg-navy/90" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Register Candidate
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="p-4 mb-4 border-border/60 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by Candidate ID, name, district…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
                  <TableCell><Checkbox /></TableCell>
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
                        c.status === "Blocked"
                          ? "bg-destructive/15 text-destructive"
                          : c.status === "Pending"
                          ? "bg-saffron/15 text-saffron"
                          : "bg-india-green/15 text-india-green"
                      }
                    >
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className={
                          c.status === "Blocked"
                            ? "text-india-green border-india-green/40 hover:bg-india-green/10 h-8 text-xs gap-1"
                            : "text-amber-600 border-amber-500/40 hover:bg-amber-500/10 h-8 text-xs gap-1"
                        }
                        onClick={() => toggleStatus(c.id, c.status)}
                      >
                        {c.status === "Blocked" ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" /> Unblock
                          </>
                        ) : (
                          <>
                            <Ban className="h-3.5 w-3.5" /> Block
                          </>
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive border-destructive/40 hover:bg-destructive/10 h-8 text-xs gap-1"
                        onClick={() => setDeletingCandidate(c)}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!deletingCandidate} onOpenChange={(o) => !o && setDeletingCandidate(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Delete Candidate Permanently?
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm text-slate-600">
              Are you sure you want to permanently delete candidate{" "}
              <strong className="text-navy font-bold">{deletingCandidate?.name}</strong> ({deletingCandidate?.id})?
              <br /><br />
              This action cannot be undone. All application history, event passes, and profile records will be completely removed from the database.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeletingCandidate(null)}>
              Cancel
            </Button>
            <Button
              className="bg-destructive text-white hover:bg-destructive/90 gap-2"
              onClick={handleDeleteCandidate}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {isDeleting ? "Deleting..." : "Permanently Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashShell>
  );
}
