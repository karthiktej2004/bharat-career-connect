// Super-admin-controlled module access grants for Company Admin panels.
// Grants are keyed by the company's email domain (e.g. "acme.com").
import { Workflow, FileBarChart2, Megaphone, Database, MapPinned, LifeBuoy, type LucideIcon } from "lucide-react";
import type { PlanTier } from "@/lib/mockStore";

export interface GrantableModule {
  key: string;
  label: string;
  to: string;
  icon: LucideIcon;
  description: string;
  requiredPlan: PlanTier; // minimum subscription tier
}

const PLAN_RANK: Record<PlanTier, number> = { free: 0, gold: 1, premium: 2 };
export function planMeets(current: PlanTier, required: PlanTier): boolean {
  return PLAN_RANK[current] >= PLAN_RANK[required];
}

export const GRANTABLE_MODULES: GrantableModule[] = [
  { key: "automation",    label: "Workflow Automation",     to: "/company-admin/automation",    icon: Workflow,       requiredPlan: "gold",    description: "Auto-approvals, reminders and event-based triggers." },
  { key: "analytics",     label: "Reports & Analytics",     to: "/company-admin/analytics",     icon: FileBarChart2,  requiredPlan: "gold",    description: "Hiring funnel, applicant sources and interview conversion reports." },
  { key: "notifications", label: "Broadcast Notifications", to: "/company-admin/notifications", icon: Megaphone,      requiredPlan: "gold",    description: "SMS / Email / WhatsApp broadcasts to shortlisted candidates." },
  { key: "data",          label: "Data Controls",           to: "/company-admin/data",          icon: Database,       requiredPlan: "premium", description: "Export, retention and PII controls scoped to your company." },
  { key: "stalls",        label: "Stall & Venue",           to: "/company-admin/stalls",        icon: MapPinned,      requiredPlan: "premium", description: "Book, brand and manage your company's stalls at job fairs." },
  { key: "collaboration", label: "Admin Collaboration",     to: "/company-admin/collaboration", icon: LifeBuoy,       requiredPlan: "premium", description: "Chat & task threads with the BCC Admin team." },
];

const KEY = "bcc_module_grants";

type GrantsMap = Record<string, string[]>; // domain -> module keys

function read(): GrantsMap {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}
function write(map: GrantsMap) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(map));
  window.dispatchEvent(new Event("bcc-module-grants"));
}

export function listGrants(): GrantsMap { return read(); }

export function getGrantsForDomain(domain: string): string[] {
  return read()[domain.toLowerCase()] ?? [];
}

export function setGrantsForDomain(domain: string, keys: string[]) {
  const map = read();
  map[domain.toLowerCase()] = keys;
  write(map);
}

export function toggleGrant(domain: string, key: string) {
  const cur = getGrantsForDomain(domain);
  setGrantsForDomain(domain, cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]);
}

export function domainOf(email?: string | null): string | null {
  if (!email) return null;
  const d = email.split("@")[1]?.toLowerCase().trim();
  return d || null;
}
