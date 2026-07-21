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
import { Plus, Activity, KeyRound, Shield, UserPlus, Trash2, Save, ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/roles")({
  head: () => ({ meta: [{ title: "Roles & Access — Admin" }] }),
  component: Roles,
});

// ============= Roles & permission matrix =============
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
  { role: "Admin",       users: 2,  perms: seedPerms(["View", "Edit", "Approve", "Export", "Delete"]) },
  { role: "Admin",             users: 8,  perms: seedPerms(["View", "Edit", "Approve", "Export"]) },
  { role: "Event Coordinator", users: 24, perms: {
    ...seedPerms(["View"]),
    "Event Management":  ["View", "Edit", "Approve"],
    "Stall & Venue":     ["View", "Edit"],
    "QR & Entry":        ["View", "Edit"],
    "Interview Control": ["View", "Edit"],
  } },
  { role: "Viewer",            users: 12, perms: seedPerms(["View"]) },
];

const STORE_KEY = "bcc_roles_v2";
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

// ============= Team members =============
interface Member { id: string; name: string; email: string; role: RoleName; }
const SEED_MEMBERS: Member[] = [
  { id: "u1", name: "Sunitha Reddy",  email: "sunitha@bcc.gov.in",   role: "Admin" },
  { id: "u2", name: "Pradeep Nair",   email: "pradeep@bcc.gov.in",   role: "Admin" },
  { id: "u3", name: "Karan Singh",    email: "karan@bcc.gov.in",     role: "Event Coordinator" },
  { id: "u4", name: "Meher Khan",     email: "meher@bcc.gov.in",     role: "Admin" },
  { id: "u5", name: "Divya Iyer",     email: "divya@bcc.gov.in",     role: "Viewer" },
];
const MEM_KEY = "bcc_admin_members";
function loadMembers(): Member[] {
  if (typeof window === "undefined") return SEED_MEMBERS;
  try {
    const raw = localStorage.getItem(MEM_KEY);
    if (!raw) { localStorage.setItem(MEM_KEY, JSON.stringify(SEED_MEMBERS)); return SEED_MEMBERS; }
    return JSON.parse(raw);
  } catch { return SEED_MEMBERS; }
}
function saveMembers(list: Member[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(MEM_KEY, JSON.stringify(list));
}

const activity = [
  { user: "S. Reddy", action: "Granted 'Workflow Automation' to Infosys",      time: "2 min ago" },
  { user: "P. Nair",  action: "Elevated 'Karan Singh' → Event Coordinator",     time: "12 min ago" },
  { user: "K. Singh", action: "Updated stall allocation A-12",                  time: "28 min ago" },
  { user: "M. Khan",  action: "Marked Bosch subscription as paid this month",   time: "1 hr ago" },
];

function Roles() {
  const [roles, setRoles] = useState<RoleDef[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleName>("Admin");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<RoleName>("Viewer");

  useEffect(() => { setRoles(loadRoles()); setMembers(loadMembers()); }, []);

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

  function addMember() {
    if (!newName.trim() || !newEmail.trim()) return;
    const rec: Member = { id: "u" + Math.random().toString(36).slice(2, 7), name: newName, email: newEmail, role: newRole };
    const next = [rec, ...members];
    setMembers(next); saveMembers(next);
    setRoles((prev) => prev.map((r) => r.role === newRole ? { ...r, users: r.users + 1 } : r));
    setNewName(""); setNewEmail("");
    toast.success(`${rec.name} added as ${rec.role}`);
  }

  function changeRole(id: string, role: RoleName) {
    setMembers((prev) => {
      const before = prev.find((m) => m.id === id);
      const next = prev.map((m) => m.id === id ? { ...m, role } : m);
      saveMembers(next);
      if (before && before.role !== role) {
        setRoles((rs) => rs.map((r) =>
          r.role === before.role ? { ...r, users: Math.max(0, r.users - 1) } :
          r.role === role ? { ...r, users: r.users + 1 } : r
        ));
      }
      return next;
    });
    toast.success("Role updated");
  }

  function removeMember(id: string) {
    const m = members.find((x) => x.id === id);
    const next = members.filter((x) => x.id !== id);
    setMembers(next); saveMembers(next);
    if (m) setRoles((rs) => rs.map((r) => r.role === m.role ? { ...r, users: Math.max(0, r.users - 1) } : r));
    toast.success("Member removed");
  }

  return (
    <DashShell role="admin" nav={adminNav}>
      <PageHeader title="Roles, Permissions & Access" description="Manage what each admin role can do inside the Admin panel — and control team membership." action={
        <Button className="bg-navy text-white hover:bg-navy/90" onClick={savePermissions}><Save className="h-4 w-4 mr-1" />Save changes</Button>
      } />

      {/* Cross-link to company module access */}
      <Card className="p-4 border-border/60 bg-saffron/5 mb-6 flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-lg bg-saffron/20 flex items-center justify-center shrink-0"><KeyRound className="h-5 w-5 text-navy" /></div>
          <div>
            <p className="font-display font-bold text-navy">Grant premium modules to a company</p>
            <p className="text-sm text-muted-foreground">This page controls internal admin permissions. To grant Company Admins access to modules like Workflow Automation, Stalls or Data Controls based on their subscription, use Module Access.</p>
          </div>
        </div>
        <Button asChild className="bg-navy text-white hover:bg-navy/90 shrink-0">
          <Link to="/admin/access">Open Module Access<ArrowRight className="h-4 w-4 ml-1" /></Link>
        </Button>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Roles list */}
        <Card className="border-border/60 overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <Shield className="h-4 w-4 text-navy" />
            <h2 className="font-display font-bold text-navy text-sm">Roles</h2>
          </div>
          <div className="divide-y">
            {roles.map((r) => {
              const active = selectedRole === r.role;
              const permCount = Object.values(r.perms).reduce((n, arr) => n + arr.length, 0);
              return (
                <button key={r.role} onClick={() => setSelectedRole(r.role)}
                  className={`w-full text-left px-4 py-3 transition ${active ? "bg-navy text-white" : "hover:bg-muted"}`}>
                  <div className="flex items-center justify-between">
                    <p className={`font-medium text-sm ${active ? "text-white" : "text-navy"}`}>{r.role}</p>
                    <Badge className={`text-[10px] ${active ? "bg-white/20 text-white" : "bg-muted text-navy"}`}>{r.users} users</Badge>
                  </div>
                  <p className={`text-xs mt-0.5 ${active ? "text-white/70" : "text-muted-foreground"}`}>{permCount} permissions across {MODULES.length} modules</p>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Permission matrix */}
        <Card className="border-border/60 lg:col-span-2 overflow-hidden">
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
            <p className="p-3 text-xs text-muted-foreground border-t">Admin permissions are always full and cannot be reduced here.</p>
          )}
        </Card>
      </div>

      {/* Team members */}
      <Card className="p-6 border-border/60 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="h-5 w-5 text-saffron" />
          <h2 className="font-display font-bold text-navy">Team members & role assignments</h2>
        </div>

        <div className="grid md:grid-cols-4 gap-2 mb-5">
          <Input placeholder="Full name" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <Input placeholder="Work email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          <Select value={newRole} onValueChange={setNewRole}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{roles.map((r) => <SelectItem key={r.role} value={r.role}>{r.role}</SelectItem>)}</SelectContent>
          </Select>
          <Button className="bg-saffron text-navy hover:bg-saffron/90" onClick={addMember}><Plus className="h-4 w-4 mr-1" />Add member</Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium text-navy">{m.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{m.email}</TableCell>
                  <TableCell>
                    <Select value={m.role} onValueChange={(v) => changeRole(m.id, v)}>
                      <SelectTrigger className="h-8 w-[180px]"><SelectValue /></SelectTrigger>
                      <SelectContent>{roles.map((r) => <SelectItem key={r.role} value={r.role}>{r.role}</SelectItem>)}</SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" className="text-danger hover:bg-danger/10" onClick={() => removeMember(m.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Activity */}
      <Card className="p-6 border-border/60 mt-6">
        <div className="flex items-center gap-2 mb-4"><Activity className="h-5 w-5 text-saffron" /><h2 className="font-display font-bold text-navy">Recent access activity</h2></div>
        <div className="grid md:grid-cols-2 gap-3">
          {activity.map((a, i) => (
            <div key={i} className="text-sm border-l-2 border-saffron pl-3">
              <p className="font-medium text-navy">{a.user}</p>
              <p className="text-xs text-muted-foreground">{a.action}</p>
              <p className="text-xs text-muted-foreground/80 mt-0.5">{a.time}</p>
            </div>
          ))}
        </div>
      </Card>
    </DashShell>
  );
}
