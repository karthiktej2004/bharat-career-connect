import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { DashShell, PageHeader } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldCheck, UserPlus, Trash2, Edit, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/access")({
  head: () => ({ meta: [{ title: "Team & Access Control — Bharat Career Connect" }] }),
  component: AdminAccessControl,
});

const PERMISSION_ACTIONS = ["View", "Create", "Edit", "Approve", "Delete", "Export"] as const;

const AVAILABLE_PAGES = [
  "Dashboard",
  "Job Fair Events",
  "Stall Allocation",
  "Live Crowd Monitor",
  "Job Approvals",
  "Employers",
  "Candidates",
  "Interview Control",
  "QR & Gate Entry",
  "Reports & Analytics",
  "Feedback & Grievance",
  "Payments & Billing",
];

function AdminAccessControl() {
  const [team, setTeam] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "Sub-Admin",
    permissions: {} as Record<string, string[]>,
  });

  const fetchTeam = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/team`);
      const json = await res.json();
      if (json.success) setTeam(json.data);
    } catch (e) {
      toast.error("Failed to load admin team.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const togglePermission = (page: string, action: string) => {
    setForm((prev) => {
      const current = prev.permissions[page] || [];
      const updated = current.includes(action)
        ? current.filter((a) => a !== action)
        : [...current, action];
      return {
        ...prev,
        permissions: { ...prev.permissions, [page]: updated },
      };
    });
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || (!editingMember && !form.password)) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const url = editingMember
        ? `${import.meta.env.VITE_API_BASE_URL}/api/admin/team/${editingMember.id}`
        : `${import.meta.env.VITE_API_BASE_URL}/api/admin/team`;
      const method = editingMember ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();

      if (json.success) {
        toast.success(
          editingMember
            ? "Team member permissions updated successfully!"
            : "New admin team member created successfully!"
        );
        setOpenDialog(false);
        setEditingMember(null);
        fetchTeam();
      } else {
        toast.error(json.message || "Failed to save team member.");
      }
    } catch (e) {
      toast.error("Network error saving team member.");
    }
  };

  const handleDeleteMember = async (id: number) => {
    if (!confirm("Remove this team member? They will lose all admin access immediately.")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/team/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Team member deleted successfully!");
        fetchTeam();
      }
    } catch (e) {
      toast.error("Error removing member.");
    }
  };

  return (
    <DashShell role="admin" nav={adminNav}>
      <PageHeader
        title="Team & Access Control"
        description="Master Admin IAM: Configure page-based access and action permissions (View, Create, Edit, Approve, Delete, Export)."
        action={
          <Button
            onClick={() => {
              setEditingMember(null);
              setForm({ fullName: "", email: "", password: "", role: "Sub-Admin", permissions: {} });
              setOpenDialog(true);
            }}
            className="bg-saffron text-navy font-semibold hover:bg-saffron/90"
          >
            <UserPlus className="h-4 w-4 mr-1.5" /> Add Admin Member
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center p-16">
          <Loader2 className="h-8 w-8 animate-spin text-saffron" />
        </div>
      ) : (
        <Card className="border-border/60 mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Assigned Pages</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {team.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No sub-admin members created yet.
                  </TableCell>
                </TableRow>
              ) : (
                team.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-bold text-navy">{m.name || m.full_name}</TableCell>
                    <TableCell className="text-sm">{m.email}</TableCell>
                    <TableCell>
                      <Badge className="bg-navy/10 text-navy border-navy/20">{m.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {m.permissions ? Object.keys(m.permissions).length : 0} pages assigned
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingMember(m);
                            setForm({
                              fullName: m.name || m.full_name,
                              email: m.email,
                              password: "",
                              role: m.role || "Sub-Admin",
                              permissions: typeof m.permissions === "string" ? JSON.parse(m.permissions) : m.permissions || {},
                            });
                            setOpenDialog(true);
                          }}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200"
                          onClick={() => handleDeleteMember(m.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* IAM PERMISSIONS DIALOG */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-navy">
              <ShieldCheck className="h-5 w-5 text-saffron" />
              {editingMember ? "Edit Team Member Access" : "Configure New Sub-Admin Access"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveMember} className="space-y-6 pt-2">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Full Name *</Label>
                <Input
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Email Address *</Label>
                <Input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1"
                />
              </div>
              {!editingMember && (
                <div>
                  <Label>Initial Password *</Label>
                  <Input
                    required
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="mt-1"
                  />
                </div>
              )}
              <div>
                <Label>Role Classification</Label>
                <Select
                  value={form.role}
                  onValueChange={(v) => setForm({ ...form, role: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sub-Admin">Sub-Admin</SelectItem>
                    <SelectItem value="Event Manager">Event Manager</SelectItem>
                    <SelectItem value="Stall Allocator">Stall Allocator</SelectItem>
                    <SelectItem value="Finance Officer">Finance Officer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* PERMISSIONS TABLE */}
            <div className="border rounded-lg p-4 bg-slate-50 space-y-3">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
                Page-Based Action Permissions
              </Label>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {AVAILABLE_PAGES.map((page) => {
                  const assignedActions = form.permissions[page] || [];
                  return (
                    <div
                      key={page}
                      className="flex items-center justify-between p-2.5 rounded bg-white border text-sm"
                    >
                      <span className="font-semibold text-navy">{page}</span>
                      <div className="flex flex-wrap gap-3">
                        {PERMISSION_ACTIONS.map((action) => {
                          const isChecked = assignedActions.includes(action);
                          return (
                            <label
                              key={action}
                              className="flex items-center gap-1.5 cursor-pointer text-xs"
                            >
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={() => togglePermission(page, action)}
                              />
                              <span>{action}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-saffron text-navy font-semibold hover:bg-saffron/90">
                Save & Enforce Permissions
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashShell>
  );
}
