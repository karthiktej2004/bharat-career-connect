import { createFileRoute, Link } from "@tanstack/react-router";
import { DashShell, PageHeader } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Activity, KeyRound, Shield, UserPlus, Trash2, Save, ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/roles")({
  head: () => ({ meta: [{ title: "Roles & Access — Admin" }] }),
  component: Roles,
});

const MODULES = [
  "Live Monitoring",
  "Event Management",
  "Candidate Management",
  "Employer Management",
  "Company Requests",
  "Stall & Venue",
  "Interview Control",
  "QR & Entry",
  "Notifications",
  "Reports & Analytics",
  "Payments & Billing",
  "Workflow Automation",
  "Module Access",
  "Data Controls",
  "Security & Compliance",
] as const;
type Module = typeof MODULES[number];

const ACTIONS = ["View", "Edit", "Approve", "Export", "Delete"] as const;
type Action = typeof ACTIONS[number];

type RoleName = string;
interface RoleDef {
  role: RoleName;
  users: number;
  perms: Record<Module, Action[]>;
}

function seedPerms(actions: Action[], modules: readonly Module[] = MODULES): Record<Module, Action[]> {
  return Object.fromEntries(modules.map((m) => [m, [...actions]])) as Record<Module, Action[]>;
}

const SEED_ROLES: RoleDef[] = [
  { role: "Admin", users: 1, perms: seedPerms(["View", "Edit", "Approve", "Export", "Delete"]) }, // Master CEO Only
  { role: "Manager", users: 8, perms: seedPerms(["View", "Edit", "Approve", "Export"]) },
  { role: "Event Coordinator", users: 24, perms: {
    ...seedPerms(["View"]),
    "Event Management": ["View", "Edit", "Approve"],
    "Stall & Venue": ["View", "Edit"],
    "QR & Entry": ["View", "Edit"],
    "Interview Control": ["View", "Edit"],
  } },
  { role: "Viewer", users: 12, perms: seedPerms(["View"]) },
];

const STORE_KEY = "bcc_roles_v3";
function loadRoles(): RoleDef[] {
  if (typeof window === "undefined") return SEED_ROLES;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) { localStorage.setItem(STORE_KEY, JSON.stringify(SEED_ROLES)); return SEED_ROLES; }
    return JSON.parse(raw);
  } catch { return SEED_ROLES; }
}
function saveRoles(list: RoleDef[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORE_KEY, JSON.stringify(list));
}

interface Member { id: string; name: string; email: string; role: RoleName; }

const activity = [
  { user: "CEO Admin", action: "Granted 'Workflow Automation' to Infosys", time: "2 min ago" },
  { user: "CEO Admin", action: "Assigned granular HR permissions for Bosch", time: "15 min ago" },
  { user: "K. Singh", action: "Updated stall allocation A-12", time: "28 min ago" },
];

function Roles() {
  const [roles, setRoles] = useState<RoleDef[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleName>("Admin");
  
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<RoleName>("Manager");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTeamMembers = async () => {
    try {
      const res = await fetch("${import.meta.env.VITE_API_BASE_URL}/api/admin/team");
      const json = await res.json();
      if (json.success && json.data) {
        setMembers(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch team members from backend", err);
    }
  };

  useEffect(() => { 
    setRoles(loadRoles()); 
    fetchTeamMembers(); 
  }, []);

  const current = useMemo(() => roles.find((r) => r.role === selectedRole), [roles, selectedRole]);

  function toggle(module: Module, action: Action) {
    setRoles((prev) => prev.map((r) => {
      if (r.role !== selectedRole) return r;
      const has = r.perms[module]?.includes(action);
      const next = has
        ? r.perms[module].filter((a) => a !== action)
        : [...(r.perms[module] ?? []), action];
      return { ...r, perms: { ...r.perms, [module]: next } };
    }));
  }

  function savePermissions() {
    saveRoles(roles);
    toast.success(`Permissions saved for ${selectedRole}`);
  }

  async function addMember() {
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      toast.error("Please fill in Full Name, Work Email, and Password.");
      return;
    }
    if (newRole === "Admin") {
      toast.error("The Master Admin role is exclusively restricted to the BCC CEO.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("${import.meta.env.VITE_API_BASE_URL}/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: newName.trim(),
          email: newEmail.trim(),
          password: newPassword,
          role: newRole,
          permissions: current?.perms || {}
        })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(`${newName} added successfully as ${newRole}!`);
        setNewName(""); 
        setNewEmail(""); 
        setNewPassword("");
        fetchTeamMembers();
      } else {
        toast.error(json.message || "Failed to add team member.");
      }
    } catch (err) {
      toast.error("Server connection failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function changeRole(id: string, role: RoleName) {
    if (role === "Admin") {
      toast.error("Cannot assign Master CEO role to team members.");
      return;
    }
    setMembers((prev) => prev.map((m) => m.id === id ? { ...m, role } : m));
    toast.success("Role updated locally");
  }

  async function removeMember(id: string) {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/team/${id}`, { method: "DELETE" });
      setMembers((prev) => prev.filter((x) => x.id !== id));
      toast.success("Team member removed successfully");
    } catch {
      toast.error("Failed to remove member");
    }
  }

  return (
    <DashShell role="admin" nav={adminNav}>
      <PageHeader title="Roles, Permissions & Access" description="Master Admin is restricted solely to the BCC CEO. Manage operational team members and permissions below." action={
        <Button className="bg-navy text-white hover:bg-navy/90 font-bold" onClick={savePermissions}><Save className="h-4 w-4 mr-1" />Save changes</Button>
      } />

      <Card className="p-4 border-border/60 bg-saffron/5 mb-6 flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-lg bg-saffron/20 flex items-center justify-center shrink-0"><KeyRound className="h-5 w-5 text-navy" /></div>
          <div>
            <p className="font-display font-bold text-navy">Company Module Access & Multi-HR Permissions</p>
            <p className="text-sm text-muted-foreground">The CEO can control which pages and features each company can access, and manage individual permissions for multi-HR company teams.</p>
          </div>
        </div>
        <Button asChild className="bg-navy text-white hover:bg-navy/90 shrink-0 font-bold">
          <Link to="/admin/access">Open Module Access<ArrowRight className="h-4 w-4 ml-1" /></Link>
        </Button>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="border-border/60 overflow-hidden bg-white">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <Shield className="h-4 w-4 text-navy" />
            <h2 className="font-display font-bold text-navy text-sm">Roles Hierarchy</h2>
          </div>
          <div className="divide-y">
            {roles.map((r) => {
              const active = selectedRole === r.role;
              const permCount = Object.values(r.perms).reduce((n, arr) => n + arr.length, 0);
              return (
                <button key={r.role} onClick={() => setSelectedRole(r.role)}
                  className={`w-full text-left px-4 py-3 transition ${active ? "bg-navy text-white" : "hover:bg-muted"}`}>
                  <div className="flex items-center justify-between">
                    <p className={`font-medium text-sm ${active ? "text-white" : "text-navy"}`}>{r.role} {r.role === "Admin" && "(Master CEO)"}</p>
                    <Badge className={`text-[10px] ${active ? "bg-white/20 text-white" : "bg-muted text-navy"}`}>{r.role === "Admin" ? "1 user" : `${r.users} users`}</Badge>
                  </div>
                  <p className={`text-xs mt-0.5 ${active ? "text-white/70" : "text-muted-foreground"}`}>{permCount} permissions across {MODULES.length} modules</p>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="border-border/60 lg:col-span-2 overflow-hidden bg-white">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-navy text-sm">Permission matrix · {selectedRole}</h2>
              <p className="text-xs text-muted-foreground">Tick to grant this role the action on each Admin module.</p>
            </div>
          </div>
          <div className="overflow-x-auto max-h-[520px]">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Module</TableHead>
                  {ACTIONS.map((a) => <TableHead key={a} className="text-center">{a}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {MODULES.map((m) => (
                  <TableRow key={m}>
                    <TableCell className="font-medium text-navy text-sm">{m}</TableCell>
                    {ACTIONS.map((a) => {
                      const on = current?.perms[m]?.includes(a) ?? false;
                      return (
                        <TableCell key={a} className="text-center">
                          <Checkbox checked={on} onCheckedChange={() => toggle(m, a)} disabled={selectedRole === "Admin"} />
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {selectedRole === "Admin" && (
            <p className="p-3 text-xs text-muted-foreground border-t">Master Admin (CEO) permissions are absolute and cannot be edited.</p>
          )}
        </Card>
      </div>

      <Card className="p-6 border-border/60 mt-6 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="h-5 w-5 text-saffron" />
          <h2 className="font-display font-bold text-navy">Team members & role assignments</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Note: The Master Admin role is exclusive to the Bharat Career Connect CEO.</p>

        <div className="grid md:grid-cols-5 gap-2 mb-5">
          <Input placeholder="Full name" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <Input placeholder="Work email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          <Input type="password" placeholder="Temporary password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <Select value={newRole} onValueChange={setNewRole}>
            <SelectTrigger><SelectValue placeholder="Select Role" /></SelectTrigger>
            <SelectContent>
              {roles.filter(r => r.role !== "Admin").map((r) => <SelectItem key={r.role} value={r.role}>{r.role}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button className="bg-saffron text-navy hover:bg-saffron/90 font-bold" onClick={addMember} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            <Plus className="h-4 w-4 mr-1" />Add member
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {members.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">No operational team members found in database.</TableCell></TableRow>
              ) : (
                members.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium text-navy">{m.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{m.email}</TableCell>
                    <TableCell>
                      <Select value={m.role} onValueChange={(v) => changeRole(m.id, v)}>
                        <SelectTrigger className="h-8 w-[180px]"><SelectValue /></SelectTrigger>
                        <SelectContent>{roles.filter(r => r.role !== "Admin").map((r) => <SelectItem key={r.role} value={r.role}>{r.role}</SelectItem>)}</SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => removeMember(m.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </DashShell>
  );
}
