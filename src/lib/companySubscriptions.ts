// Per-company subscription & billing state managed by Admin.
// Keyed by company email domain (e.g. "infosys.com").
import { PLANS, type PlanTier } from "@/lib/mockStore";

export interface CompanySubscription {
  plan: PlanTier;
  status: "active" | "expired" | "trial";
  paidThisMonth: boolean;
  amountPaidInr: number;
  lastPaymentDate?: string; // YYYY-MM-DD
  nextBillDate: string;     // YYYY-MM-DD
  invoiceNo?: string;
  notes?: string;
}

const KEY = "bcc_company_subs";

const SEED: Record<string, CompanySubscription> = {
  "infosys.com":     { plan: "premium", status: "active",  paidThisMonth: true,  amountPaidInr: 14999, lastPaymentDate: "2026-07-01", nextBillDate: "2026-08-01", invoiceNo: "INV-2026-0071" },
  "in.bosch.com":    { plan: "gold",    status: "active",  paidThisMonth: false, amountPaidInr: 4999,  lastPaymentDate: "2026-06-01", nextBillDate: "2026-07-01", invoiceNo: "INV-2026-0064" },
  "novatechworks.in":{ plan: "free",    status: "trial",   paidThisMonth: false, amountPaidInr: 0,     nextBillDate: "2026-08-15" },
};

function read(): Record<string, CompanySubscription> {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) { localStorage.setItem(KEY, JSON.stringify(SEED)); return SEED; }
    return JSON.parse(raw);
  } catch { return SEED; }
}
function write(map: Record<string, CompanySubscription>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(map));
  window.dispatchEvent(new Event("bcc-company-subs"));
}

export function getSubscription(domain: string): CompanySubscription {
  const d = domain.toLowerCase();
  const map = read();
  return map[d] ?? { plan: "free", status: "trial", paidThisMonth: false, amountPaidInr: 0, nextBillDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10) };
}

export function setSubscription(domain: string, sub: CompanySubscription) {
  const map = read();
  map[domain.toLowerCase()] = sub;
  write(map);
}

export function updateSubscription(domain: string, patch: Partial<CompanySubscription>) {
  setSubscription(domain, { ...getSubscription(domain), ...patch });
}

export function priceForPlan(tier: PlanTier): number {
  return PLANS[tier].priceInr;
}
