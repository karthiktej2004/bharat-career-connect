// Mock data store with localStorage persistence
export type Role = "candidate" | "employer" | "companyadmin" | "admin" | "superadmin" | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface JobEvent {
  id: string;
  title: string;
  date: string;
  venue: string;
  district: string;
  state: string;
  type: "Physical" | "Virtual" | "Hybrid";
  capacity: number;
  registered: number;
  employers: number;
  status: "Upcoming" | "Live" | "Completed";
  description: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  type: "Full-time" | "Internship" | "Apprenticeship";
  qualification: string;
  skills: string[];
  experience: string;
  salary: string;
  description?: string;
  stallNo?: string;
  matchScore?: number;
  eventId?: string;
  sharedToBoard?: boolean;
  approvalStatus?: "pending" | "approved" | "rejected";
  reviewNote?: string;
  postedAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  status: "Applied" | "Shortlisted" | "Interview" | "Offered" | "Rejected";
  appliedAt: string;
}

export const SEED_EVENTS: JobEvent[] = [
  { id: "evt-bm-2026", title: "Udyoga Mela 2026 — Bengaluru", date: "2026-08-12", venue: "Palace Grounds, Hall 1-3", district: "Bengaluru Urban", state: "Karnataka", type: "Physical", capacity: 15000, registered: 9842, employers: 180, status: "Upcoming", description: "India's largest single-day employment drive, hosted in partnership with the Department of Skill Development." },
  { id: "evt-mys-2026", title: "Mysuru Career Connect", date: "2026-07-22", venue: "Mysuru Exhibition Authority", district: "Mysuru", state: "Karnataka", type: "Hybrid", capacity: 6000, registered: 4120, employers: 75, status: "Upcoming", description: "Manufacturing, IT and tourism sector hiring across Mysuru region." },
  { id: "evt-hub-2026", title: "Hubballi Skill Fair", date: "2026-07-05", venue: "Vidyanagar Convention Centre", district: "Dharwad", state: "Karnataka", type: "Physical", capacity: 4000, registered: 3550, employers: 52, status: "Live", description: "ITI, Diploma and Apprenticeship roles across North Karnataka." },
  { id: "evt-virt-2026", title: "All-India Virtual Job Fair", date: "2026-09-01", venue: "Online", district: "Pan-India", state: "All", type: "Virtual", capacity: 50000, registered: 23110, employers: 410, status: "Upcoming", description: "Nationwide virtual hiring drive for IT, BPO and remote-friendly roles." },
  { id: "evt-blr-completed", title: "Bengaluru Apprenticeship Drive", date: "2026-04-18", venue: "Tripuravasini, Palace Grounds", district: "Bengaluru Urban", state: "Karnataka", type: "Physical", capacity: 8000, registered: 7800, employers: 96, status: "Completed", description: "Apprenticeship-focused event under the National Apprenticeship Promotion Scheme." },
];

export const SEED_JOBS: Job[] = [
  { id: "job-1", title: "Junior Software Engineer", company: "Infosys", location: "Bengaluru", type: "Full-time", qualification: "BE/B-Tech", skills: ["Java", "SQL", "REST APIs"], experience: "0-1 yr", salary: "₹4.2 LPA", stallNo: "A-12", matchScore: 92, eventId: "evt-bm-2026", postedAt: "2026-06-10" },
  { id: "job-2", title: "Retail Sales Associate", company: "Reliance Retail", location: "Bengaluru", type: "Full-time", qualification: "12th std", skills: ["Communication", "Customer Service"], experience: "Fresher", salary: "₹2.4 LPA", stallNo: "B-04", matchScore: 78, eventId: "evt-bm-2026", postedAt: "2026-06-12" },
  { id: "job-3", title: "CNC Machine Operator", company: "Bosch Limited", location: "Mysuru", type: "Apprenticeship", qualification: "ITI", skills: ["CNC", "Lathe", "Quality Control"], experience: "0-2 yr", salary: "₹2.8 LPA", stallNo: "M-09", matchScore: 85, eventId: "evt-mys-2026", postedAt: "2026-06-08" },
  { id: "job-4", title: "Data Analyst Intern", company: "Wipro", location: "Bengaluru", type: "Internship", qualification: "UG Degree", skills: ["Excel", "SQL", "Power BI"], experience: "Fresher", salary: "₹25K/mo", stallNo: "A-22", matchScore: 88, eventId: "evt-bm-2026", postedAt: "2026-06-14" },
  { id: "job-5", title: "Customer Support Executive", company: "Tata Consultancy Services", location: "Hubballi", type: "Full-time", qualification: "Diploma", skills: ["English", "Kannada", "Email"], experience: "0-1 yr", salary: "₹3.0 LPA", stallNo: "H-03", matchScore: 81, eventId: "evt-hub-2026", postedAt: "2026-06-09" },
  { id: "job-6", title: "Field Sales Officer", company: "HDFC Bank", location: "Bengaluru", type: "Full-time", qualification: "UG Degree", skills: ["Sales", "Communication"], experience: "1-3 yr", salary: "₹3.6 LPA", stallNo: "C-07", matchScore: 74, eventId: "evt-bm-2026", postedAt: "2026-06-13" },
  { id: "job-7", title: "Electrician Apprentice", company: "BHEL", location: "Mysuru", type: "Apprenticeship", qualification: "ITI", skills: ["Wiring", "Safety", "Maintenance"], experience: "Fresher", salary: "₹18K/mo", stallNo: "M-14", matchScore: 90, eventId: "evt-mys-2026", postedAt: "2026-06-11" },
  { id: "job-8", title: "Frontend Developer", company: "Mindtree", location: "Bengaluru", type: "Full-time", qualification: "BE/B-Tech", skills: ["React", "TypeScript", "CSS"], experience: "1-2 yr", salary: "₹6.5 LPA", stallNo: "A-18", matchScore: 95, eventId: "evt-bm-2026", postedAt: "2026-06-15" },
];

export const QUALIFICATIONS = [
  "Below 10th / SSLC",
  "10th std / SSLC",
  "ITI",
  "12th std / 2nd PUC",
  "Diploma",
  "UG Degree",
  "PG Degree",
  "BE/B-Tech",
  "ME/M-Tech",
  "PHD",
  "Short Term Training (STT)",
  "Others",
];

const KEY = "bcc_session";

// ==========================================
// 🚀 TAB-ISOLATED SESSION MANAGEMENT
// ==========================================

export function setSession(user: any) {
  if (typeof window !== "undefined") {
    if (user) {
      // CHANGED to sessionStorage: Now each tab has its own completely separate login!
      sessionStorage.setItem("bcc-session", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("bcc-session");
    }
  }
}

export function getSession(): any {
  if (typeof window === "undefined") return null;
  
  // CHANGED to sessionStorage
  const stored = sessionStorage.getItem("bcc-session");
  
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Session parse error:", e);
      return null;
    }
  }
  
  return null; 
}

// ============ Company registration & approval ============
export interface CompanyRequest {
  id: string;
  name: string;
  domain: string;
  gst: string;
  industry: string;
  size: string;
  website: string;
  city: string;
  hrName: string;
  hrEmail: string;
  hrPhone: string;
  about: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  reviewedAt?: string;
  reviewNote?: string;
  employerUniqueId?: string;
}


const CR_KEY = "bcc_company_requests";
const SEED_COMPANIES: CompanyRequest[] = [
  { id: "CR-1001", name: "Infosys Limited", domain: "infosys.com", gst: "29AAACI4741L1ZE", industry: "Information Technology", size: "10000+", website: "https://infosys.com", city: "Bengaluru", hrName: "Priya Rao", hrEmail: "priya.rao@infosys.com", hrPhone: "+91 98450 12345", about: "Global leader in next-generation digital services and consulting.", status: "approved", createdAt: "2026-05-10", reviewedAt: "2026-05-11", employerUniqueId: "EMP-INFY-1001" },
  { id: "CR-1002", name: "Bosch Limited", domain: "in.bosch.com", gst: "29AAACB1534R1Z9", industry: "Manufacturing", size: "5000-10000", website: "https://bosch.in", city: "Bengaluru", hrName: "Anil Kumar", hrEmail: "anil.kumar@in.bosch.com", hrPhone: "+91 99000 12345", about: "Engineering and technology company with roots in Karnataka.", status: "approved", createdAt: "2026-05-14", reviewedAt: "2026-05-15", employerUniqueId: "EMP-BOSCH-1002" },
  { id: "CR-1003", name: "Nova Techworks Pvt Ltd", domain: "novatechworks.in", gst: "29AABCN0000A1Z5", industry: "IT Services", size: "51-200", website: "https://novatechworks.in", city: "Mysuru", hrName: "Meera Iyer", hrEmail: "meera@novatechworks.in", hrPhone: "+91 98861 22334", about: "Boutique product engineering studio serving Indian SaaS startups.", status: "pending", createdAt: "2026-06-20" },
];

function readRequests(): CompanyRequest[] {
  if (typeof window === "undefined") return SEED_COMPANIES;
  try {
    const raw = localStorage.getItem(CR_KEY);
    if (!raw) { localStorage.setItem(CR_KEY, JSON.stringify(SEED_COMPANIES)); return SEED_COMPANIES; }
    return JSON.parse(raw) as CompanyRequest[];
  } catch { return SEED_COMPANIES; }
}
function writeRequests(list: CompanyRequest[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CR_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("bcc-company-requests"));
}
export function listCompanyRequests(): CompanyRequest[] { return readRequests(); }
export function addCompanyRequest(input: Omit<CompanyRequest, "id" | "status" | "createdAt">): CompanyRequest {
  const rec: CompanyRequest = { ...input, id: "CR-" + Math.floor(1000 + Math.random() * 9000), status: "pending", createdAt: new Date().toISOString().slice(0, 10) };
  writeRequests([rec, ...readRequests()]);
  return rec;
}
export function reviewCompanyRequest(id: string, status: "approved" | "rejected", note?: string) {
  const next = readRequests().map((r) => {
    if (r.id !== id) return r;
    const patch: Partial<CompanyRequest> = { status, reviewedAt: new Date().toISOString().slice(0, 10), reviewNote: note };
    if (status === "approved" && !r.employerUniqueId) {
      const slug = (r.name.match(/[A-Za-z]+/g) ?? ["EMP"]).slice(0, 1).join("").toUpperCase().slice(0, 6);
      patch.employerUniqueId = `EMP-${slug}-${r.id.replace(/[^0-9]/g, "")}`;
    }
    return { ...r, ...patch };
  });
  writeRequests(next);
}
export function getCompanyForEmail(email: string): CompanyRequest | null {
  const at = email.split("@")[1]?.toLowerCase().trim();
  if (!at) return null;
  return readRequests().find((r) => r.domain.toLowerCase() === at) ?? null;
}

export function isEmailAllowedForEmployer(email: string, companyName?: string): { ok: boolean; reason?: string; company?: CompanyRequest } {
  const at = email.split("@")[1]?.toLowerCase().trim();
  if (!at) return { ok: false, reason: "Please enter a valid work email." };
  const all = readRequests();
  const match = all.find((r) => r.status === "approved" && r.domain.toLowerCase() === at);
  if (!match) {
    const pending = all.find((r) => r.domain.toLowerCase() === at && r.status === "pending");
    if (pending) return { ok: false, reason: "Your company registration is still pending admin approval." };
    return { ok: false, reason: "This email domain is not linked to an approved company. Please register your company first." };
  }
  if (companyName && companyName.trim() && match.name.toLowerCase() !== companyName.trim().toLowerCase()) {
    return { ok: false, reason: `Email domain @${at} is registered under "${match.name}". Please use that company name.` };
  }
  return { ok: true, company: match };
}

// ============ Posted jobs (employer) ============
const JOBS_KEY = "bcc_posted_jobs";
export function listPostedJobs(): Job[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(JOBS_KEY) || "[]"); } catch { return []; }
}
export function addPostedJob(job: Job) {
  const withStatus: Job = { approvalStatus: "pending", ...job };
  if (!withStatus.approvalStatus) withStatus.approvalStatus = "pending";
  const list = [withStatus, ...listPostedJobs()];
  localStorage.setItem(JOBS_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("bcc-jobs"));
}
export function updatePostedJob(id: string, patch: Partial<Job>) {
  const list = listPostedJobs().map((j) => j.id === id ? { ...j, ...patch } : j);
  localStorage.setItem(JOBS_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("bcc-jobs"));
}
export function shareJobToBoard(id: string) {
  updatePostedJob(id, { sharedToBoard: true });
}
export function deletePostedJob(id: string) {
  const list = listPostedJobs().filter((j) => j.id !== id);
  localStorage.setItem(JOBS_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("bcc-jobs"));
}
export function listPendingJobs(): Job[] {
  return listPostedJobs().filter((j) => (j.approvalStatus ?? "pending") === "pending");
}
export function reviewJob(id: string, status: "approved" | "rejected", note?: string) {
  updatePostedJob(id, { approvalStatus: status, reviewNote: note });
}
function isApproved(j: Job) { return (j.approvalStatus ?? "approved") === "approved"; }
/** All jobs visible on the public job board (not event-scoped, or explicitly shared). */
export function listBoardJobs(): Job[] {
  const posted = listPostedJobs().filter((j) => isApproved(j) && (!j.eventId || j.sharedToBoard));
  return [...posted, ...SEED_JOBS];
}
/** Jobs attached to a specific event — only visible inside that event's job list. */
export function listJobsForEvent(eventId: string): Job[] {
  const posted = listPostedJobs().filter((j) => isApproved(j) && j.eventId === eventId);
  const seeded = SEED_JOBS.filter((j) => j.eventId === eventId);
  return [...posted, ...seeded];
}

// ============ Event images (uploaded by employers, with seeded defaults) ============
import evtBengaluru from "@/assets/event-bengaluru.jpg";
import evtHubballi from "@/assets/event-hubballi.jpg";
import evtMysuru from "@/assets/event-mysuru.jpg";
import evtVirtual from "@/assets/event-virtual.jpg";

const DEFAULT_EVENT_IMAGES: Record<string, string> = {
  "evt-bm-2026": evtBengaluru,
  "evt-blr-completed": evtBengaluru,
  "evt-hub-2026": evtHubballi,
  "evt-mys-2026": evtMysuru,
  "evt-virt-2026": evtVirtual,
};

const EVENT_IMG_KEY = "bcc_event_images";
function readEventImages(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(EVENT_IMG_KEY) || "{}"); } catch { return {}; }
}
export function getEventImage(eventId: string): string | undefined {
  return readEventImages()[eventId] ?? DEFAULT_EVENT_IMAGES[eventId];
}
export function setEventImage(eventId: string, dataUrl: string) {
  if (typeof window === "undefined") return;
  const map = readEventImages();
  map[eventId] = dataUrl;
  localStorage.setItem(EVENT_IMG_KEY, JSON.stringify(map));
  window.dispatchEvent(new Event("bcc-event-images"));
}
export function removeEventImage(eventId: string) {
  if (typeof window === "undefined") return;
  const map = readEventImages();
  delete map[eventId];
  localStorage.setItem(EVENT_IMG_KEY, JSON.stringify(map));
  window.dispatchEvent(new Event("bcc-event-images"));
}
export function listEventImages(): Record<string, string> { return readEventImages(); }

// ============ Company logos (via Clearbit — no API key required) ============
const COMPANY_DOMAINS: Record<string, string> = {
  "Infosys": "infosys.com",
  "Infosys Limited": "infosys.com",
  "Bosch Limited": "bosch.com",
  "Bosch": "bosch.com",
  "Wipro": "wipro.com",
  "Reliance Retail": "relianceretail.com",
  "Tata Consultancy Services": "tcs.com",
  "TCS": "tcs.com",
  "HDFC Bank": "hdfcbank.com",
  "BHEL": "bhel.com",
  "Mindtree": "ltimindtree.com",
  "Nova Techworks Pvt Ltd": "novatechworks.in",
};
export function getCompanyLogo(company: string): string | undefined {
  const domain = COMPANY_DOMAINS[company] ?? COMPANY_DOMAINS[company?.trim()];
  return domain ? `https://logo.clearbit.com/${domain}` : undefined;
}

// ============ Job role images (seeded illustrations) ============
import jobSoftware from "@/assets/job-software.jpg";
import jobRetail from "@/assets/job-retail.jpg";
import jobCnc from "@/assets/job-cnc.jpg";
import jobData from "@/assets/job-data.jpg";
import jobSupport from "@/assets/job-support.jpg";
import jobSales from "@/assets/job-sales.jpg";
import jobElectrician from "@/assets/job-electrician.jpg";
import jobFrontend from "@/assets/job-frontend.jpg";

const JOB_IMAGES_BY_ID: Record<string, string> = {
  "job-1": jobSoftware,
  "job-2": jobRetail,
  "job-3": jobCnc,
  "job-4": jobData,
  "job-5": jobSupport,
  "job-6": jobSales,
  "job-7": jobElectrician,
  "job-8": jobFrontend,
};

export function getJobImage(job: { id: string; title?: string }): string {
  if (JOB_IMAGES_BY_ID[job.id]) return JOB_IMAGES_BY_ID[job.id];
  const t = (job.title || "").toLowerCase();
  if (t.includes("frontend") || t.includes("web") || t.includes("ui")) return jobFrontend;
  if (t.includes("software") || t.includes("developer") || t.includes("engineer")) return jobSoftware;
  if (t.includes("data") || t.includes("analyst") || t.includes("analytics")) return jobData;
  if (t.includes("sales") || t.includes("business development")) return jobSales;
  if (t.includes("support") || t.includes("customer") || t.includes("bpo")) return jobSupport;
  if (t.includes("retail") || t.includes("store") || t.includes("cashier")) return jobRetail;
  if (t.includes("electric")) return jobElectrician;
  if (t.includes("cnc") || t.includes("machine") || t.includes("operator") || t.includes("apprentice")) return jobCnc;
  return jobSoftware;
}

// ============ Candidate applications ============
const APPS_KEY = "bcc_applications";
export function listApplications(): Application[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(APPS_KEY) || "[]"); } catch { return []; }
}
export function addApplication(app: Application) {
  const list = [app, ...listApplications()];
  localStorage.setItem(APPS_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("bcc-applications"));
}

// ============ Subscription plans (per employer company) ============
export type PlanTier = "free" | "gold" | "premium";

export interface PlanConfig {
  id: PlanTier;
  name: string;
  priceInr: number; // per month
  applicantsPerJob: number; // Infinity for unlimited
  employerSeats: number;
  adminSeats: number;
  features: string[];
}

export const PLANS: Record<PlanTier, PlanConfig> = {
  free: {
    id: "free", name: "Free", priceInr: 0,
    applicantsPerJob: 3, employerSeats: 1, adminSeats: 1,
    features: ["View 3 applicants per job", "1 employer seat", "1 company admin", "Basic job posting"],
  },
  gold: {
    id: "gold", name: "Gold", priceInr: 4999,
    applicantsPerJob: 5, employerSeats: 5, adminSeats: 1,
    features: ["View 5 applicants per job", "5 employer seats", "1 company admin", "Shortlist & interview tools", "Email support"],
  },
  premium: {
    id: "premium", name: "Premium", priceInr: 14999,
    applicantsPerJob: Infinity, employerSeats: Infinity, adminSeats: Infinity,
    features: ["Unlimited applicants per job", "Unlimited employer seats", "Unlimited admins", "Priority AI ranking", "Dedicated success manager", "Analytics & reports"],
  },
};

const PLAN_KEY = "bcc_company_plan";
export function getCompanyPlan(): PlanTier {
  if (typeof window === "undefined") return "free";
  const v = localStorage.getItem(PLAN_KEY);
  return (v === "gold" || v === "premium") ? v : "free";
}
export function setCompanyPlan(tier: PlanTier) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PLAN_KEY, tier);
  window.dispatchEvent(new Event("bcc-plan"));
}

// ============ Mock applicants per job ============
export interface Applicant {
  id: string;
  name: string;
  qualification: string;
  experience: string;
  matchScore: number;
  skills: string[];
  location: string;
  appliedAt: string;
  status: "Applied" | "Shortlisted" | "Interview" | "Hired" | "Rejected";
}

const APPLICANT_POOL: Omit<Applicant, "id" | "status" | "appliedAt">[] = [
  { name: "Ramesh Kumar", qualification: "BE/B-Tech", experience: "0-1 yr", matchScore: 94, skills: ["Java", "SQL", "React"], location: "Bengaluru" },
  { name: "Priya Sharma", qualification: "UG Degree", experience: "Fresher", matchScore: 89, skills: ["Excel", "Power BI", "SQL"], location: "Bengaluru" },
  { name: "Mohammed Imran", qualification: "BE/B-Tech", experience: "1-2 yr", matchScore: 91, skills: ["React", "TypeScript", "CSS"], location: "Bengaluru" },
  { name: "Lakshmi Naidu", qualification: "BE/B-Tech", experience: "0-1 yr", matchScore: 87, skills: ["Java", "Spring", "MySQL"], location: "Mysuru" },
  { name: "Arjun Reddy", qualification: "Diploma", experience: "0-1 yr", matchScore: 78, skills: ["English", "Telugu", "Email"], location: "Hubballi" },
  { name: "Kavya Nair", qualification: "UG Degree", experience: "1-3 yr", matchScore: 82, skills: ["Sales", "Communication"], location: "Bengaluru" },
  { name: "Vikas Patil", qualification: "ITI", experience: "0-2 yr", matchScore: 85, skills: ["CNC", "Lathe"], location: "Mysuru" },
  { name: "Ananya Gowda", qualification: "BE/B-Tech", experience: "0-1 yr", matchScore: 88, skills: ["Python", "SQL"], location: "Bengaluru" },
  { name: "Suresh Rao", qualification: "12th std", experience: "Fresher", matchScore: 72, skills: ["Customer Service"], location: "Bengaluru" },
  { name: "Deepa Menon", qualification: "UG Degree", experience: "2-4 yr", matchScore: 90, skills: ["Excel", "Tally", "Accounting"], location: "Bengaluru" },
  { name: "Rahul Shetty", qualification: "BE/B-Tech", experience: "1-2 yr", matchScore: 86, skills: ["Node.js", "MongoDB"], location: "Mysuru" },
  { name: "Sneha Kulkarni", qualification: "UG Degree", experience: "Fresher", matchScore: 80, skills: ["Content Writing", "SEO"], location: "Bengaluru" },
];

const APPLICANTS_KEY = "bcc_job_applicants_v2";
function seedApplicantsFor(jobId: string): Applicant[] {
  // deterministic count per job (6-10) so limits actually bite
  const hash = jobId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const count = 6 + (hash % 5);
  const statuses: Applicant["status"][] = ["Applied", "Applied", "Applied", "Applied", "Applied", "Applied", "Applied", "Applied", "Applied", "Applied"];
  return Array.from({ length: count }, (_, i) => {
    const src = APPLICANT_POOL[(hash + i) % APPLICANT_POOL.length];
    return {
      ...src,
      id: `${jobId}-app-${i}`,
      status: statuses[i] ?? "Applied",
      appliedAt: new Date(Date.now() - (i + 1) * 86400000).toISOString().slice(0, 10),
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}
function readApplicants(): Record<string, Applicant[]> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(APPLICANTS_KEY) || "{}"); } catch { return {}; }
}
function writeApplicants(map: Record<string, Applicant[]>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(APPLICANTS_KEY, JSON.stringify(map));
  window.dispatchEvent(new Event("bcc-applicants"));
}
export function getApplicantsForJob(jobId: string): Applicant[] {
  const map = readApplicants();
  if (!map[jobId]) { map[jobId] = seedApplicantsFor(jobId); writeApplicants(map); }
  return map[jobId];
}
export function updateApplicantStatus(jobId: string, applicantId: string, status: Applicant["status"]) {
  const map = readApplicants();
  const list = map[jobId] ?? seedApplicantsFor(jobId);
  map[jobId] = list.map(a => a.id === applicantId ? { ...a, status } : a);
  writeApplicants(map);
}

// ============ Candidate profile (full onboarding) ============
export interface CandidateProfile {
  uniqueId: string;
  fullName: string;
  email: string;
  phone: string;
  dob?: string;
  gender?: string;
  language?: string;
  category?: "General" | "SC" | "ST" | "OBC" | "EWS" | "PwD";
  state?: string;
  district?: string;
  taluk?: string;
  pincode?: string;
  qualification?: string;
  institution?: string;
  schoolName?: string;
  course?: string;
  yearOfPassing?: string;
  percentage?: string;
  specialization?: string;
  certifications?: string[];
  languagesFluent?: string[];
  skills?: string[];
  experienceType?: "Fresher" | "Experienced";
  yearsOfExperience?: string;
  currentRole?: string;
  currentCompany?: string;
  industry?: string;
  functionalArea?: string;
  employmentType?: string;
  employmentStatus?: string;
  noticePeriod?: string;
  currentSalary?: string;
  workLocation?: string;
  joinedFrom?: string;
  joinedTo?: string;
  currentlyWorking?: boolean;
  jobDescription?: string;
  reasonForChange?: string;
  resumeFileName?: string;
  preferredRoles?: string[];
  preferredLocations?: string[];
  preferredJobType?: string;
  expectedSalary?: string;
  willingToRelocate?: boolean;
  createdAt: string;
  completion: number;
}
const PROFILE_KEY = "bcc_candidate_profile";
export function saveCandidateProfile(p: CandidateProfile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  window.dispatchEvent(new Event("bcc-profile"));
}
export function getCandidateProfile(): CandidateProfile | null {
  if (typeof window === "undefined") return null;
  try { const raw = localStorage.getItem(PROFILE_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
export function generateCandidateId(): string {
  return `BCC-${Math.floor(10000000 + Math.random() * 90000000)}`;
}
export const NSQF_SKILLS = [
  "Java","Python","JavaScript","React","Node.js","SQL","Data Analysis","Excel","Power BI","Tableau",
  "Digital Marketing","SEO","Content Writing","Graphic Design","UI/UX",
  "CNC Operation","Welding","Electrical Wiring","Plumbing","AC Repair","Automobile Service",
  "Retail Sales","Customer Service","Tele-calling","Cashier",
  "Nursing","Medical Lab","Pharmacy Assistant",
  "Tailoring","Beautician","Hospitality","Cooking","Housekeeping",
  "Data Entry","Tally","Accounting","GST Filing",
];
export const INDIAN_LANGUAGES = ["English","Hindi","Kannada","Telugu","Tamil","Malayalam","Marathi","Bengali","Gujarati","Punjabi","Odia","Urdu"];
export const INDIAN_STATES = ["Karnataka","Tamil Nadu","Telangana","Andhra Pradesh","Kerala","Maharashtra","Delhi","Gujarat","Uttar Pradesh","West Bengal","Rajasthan","Punjab","Haryana","Madhya Pradesh","Bihar","Odisha","Assam"];

// ============ Activity log (candidate history) ============
export type ActivityType =
  | "account_created"
  | "profile_updated"
  | "event_registered"
  | "event_pass_viewed"
  | "job_applied"
  | "job_viewed"
  | "interview_scheduled"
  | "interview_attended"
  | "feedback_submitted"
  | "resume_uploaded";

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  meta?: Record<string, string | number>;
  at: string; // ISO
}

const ACT_KEY = "bcc_activity_log";
export function listActivity(): ActivityEntry[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(ACT_KEY) || "[]"); } catch { return []; }
}
export function logActivity(entry: Omit<ActivityEntry, "id" | "at"> & { at?: string }) {
  if (typeof window === "undefined") return;
  const rec: ActivityEntry = {
    id: "act-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    at: entry.at || new Date().toISOString(),
    ...entry,
  };
  const list = [rec, ...listActivity()].slice(0, 500);
  localStorage.setItem(ACT_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("bcc-activity"));
}
export function clearActivity() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACT_KEY);
  window.dispatchEvent(new Event("bcc-activity"));
}




// ============ Employer Feedback & Video Testimonials ============
export interface EmployerFeedback {
  id: string;
  employerId: string;       // company request id
  employerName: string;
  rating: number;           // 1-5
  candidateQuality: string;
  eventOrganisation: string;
  hiringEfficiency: string;
  status: "pending" | "published" | "rejected";
  createdAt: string;
  reviewedAt?: string;
  reviewNote?: string;
}
export interface EmployerTestimonial {
  id: string;
  employerId: string;
  employerName: string;
  topic: "Hiring experience" | "Event outcome";
  title: string;
  summary: string;
  videoName?: string;       // stored file name (mock)
  status: "pending" | "published" | "rejected";
  createdAt: string;
  reviewedAt?: string;
  reviewNote?: string;
}

const FB_KEY = "bcc_employer_feedback";
const TS_KEY = "bcc_employer_testimonials";

function readList<T>(k: string): T[] {
  if (typeof window === "undefined") return [];
  try { const raw = localStorage.getItem(k); return raw ? (JSON.parse(raw) as T[]) : []; } catch { return []; }
}
function writeList<T>(k: string, list: T[], evt: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(k, JSON.stringify(list));
  window.dispatchEvent(new Event(evt));
}

export function listEmployerFeedback(): EmployerFeedback[] { return readList<EmployerFeedback>(FB_KEY); }
export function addEmployerFeedback(input: Omit<EmployerFeedback, "id" | "status" | "createdAt">): EmployerFeedback {
  const rec: EmployerFeedback = { ...input, id: "FB-" + Math.floor(1000 + Math.random() * 9000), status: "pending", createdAt: new Date().toISOString().slice(0, 10) };
  writeList(FB_KEY, [rec, ...listEmployerFeedback()], "bcc-employer-feedback");
  return rec;
}
export function reviewEmployerFeedback(id: string, status: "published" | "rejected", note?: string) {
  const next = listEmployerFeedback().map((r) => r.id === id ? { ...r, status, reviewedAt: new Date().toISOString().slice(0, 10), reviewNote: note } : r);
  writeList(FB_KEY, next, "bcc-employer-feedback");
}

export function listEmployerTestimonials(): EmployerTestimonial[] { return readList<EmployerTestimonial>(TS_KEY); }
export function addEmployerTestimonial(input: Omit<EmployerTestimonial, "id" | "status" | "createdAt">): EmployerTestimonial {
  const rec: EmployerTestimonial = { ...input, id: "VT-" + Math.floor(1000 + Math.random() * 9000), status: "pending", createdAt: new Date().toISOString().slice(0, 10) };
  writeList(TS_KEY, [rec, ...listEmployerTestimonials()], "bcc-employer-testimonials");
  return rec;
}
export function reviewEmployerTestimonial(id: string, status: "published" | "rejected", note?: string) {
  const next = listEmployerTestimonials().map((r) => r.id === id ? { ...r, status, reviewedAt: new Date().toISOString().slice(0, 10), reviewNote: note } : r);
  writeList(TS_KEY, next, "bcc-employer-testimonials");
}

// ============ Employer → Admin activity feed ============
export interface EmployerActionEvent {
  id: string;
  employerName: string;
  jobId: string;
  jobTitle: string;
  applicantId: string;
  applicantName: string;
  action: "Shortlisted" | "Interview" | "Hired" | "Rejected" | "Applied";
  at: string;
}
const EA_KEY = "bcc_employer_actions";
export function listEmployerActions(): EmployerActionEvent[] { return readList<EmployerActionEvent>(EA_KEY); }
export function logEmployerAction(input: Omit<EmployerActionEvent, "id" | "at">) {
  const rec: EmployerActionEvent = { ...input, id: "EA-" + Date.now() + "-" + Math.floor(Math.random() * 1000), at: new Date().toISOString() };
  writeList(EA_KEY, [rec, ...listEmployerActions()].slice(0, 200), "bcc-employer-actions");
}

// ============ Scheduled interviews ============
export interface ScheduledInterview {
  id: string;
  applicantId: string;
  applicantName: string;
  jobId: string;
  jobTitle: string;
  company: string;
  mode: "Online" | "Walk-in";
  date: string;
  time: string;
  meetingLink?: string;
  venue?: string;
  locationDetail?: string;
  mapsLink?: string;
  description?: string;
  panel?: string;
  notifyWhatsapp?: boolean;
  notifyEmail?: boolean;
  status: "Scheduled" | "Completed" | "Cancelled";
  isReschedule?: boolean;
  createdAt: string;
}
const IV_KEY = "bcc_interviews";
export function listInterviews(): ScheduledInterview[] { return readList<ScheduledInterview>(IV_KEY); }
export function scheduleInterview(input: Omit<ScheduledInterview, "id" | "status" | "createdAt">): ScheduledInterview {
  const rec: ScheduledInterview = { ...input, id: "IV-" + Date.now() + "-" + Math.floor(Math.random() * 1000), status: "Scheduled", createdAt: new Date().toISOString() };
  writeList(IV_KEY, [rec, ...listInterviews()], "bcc-interviews");
  return rec;
}
export function updateInterview(id: string, patch: Partial<ScheduledInterview>) {
  const next = listInterviews().map((iv) => iv.id === id ? { ...iv, ...patch } : iv);
  writeList(IV_KEY, next, "bcc-interviews");
}

// ============ Applicant ↔ Employer messages ============
export interface AppMessage {
  id: string;
  applicantId: string;
  applicantName: string;
  jobId: string;
  jobTitle: string;
  company: string;
  from: "employer" | "candidate";
  text: string;
  kind?: "chat" | "schedule" | "reject" | "reschedule-request";
  at: string;
}
const MSG_KEY = "bcc_app_messages";
export function listMessages(): AppMessage[] { return readList<AppMessage>(MSG_KEY); }
export function listMessagesFor(applicantId: string, jobId: string): AppMessage[] {
  return listMessages()
    .filter((m) => m.applicantId === applicantId && m.jobId === jobId)
    .sort((a, b) => (a.at < b.at ? -1 : 1));
}
export function addMessage(input: Omit<AppMessage, "id" | "at">): AppMessage {
  const rec: AppMessage = { ...input, id: "MSG-" + Date.now() + "-" + Math.floor(Math.random() * 1000), at: new Date().toISOString() };
  writeList(MSG_KEY, [rec, ...listMessages()].slice(0, 500), "bcc-messages");
  return rec;
}

// Unread message tracking per viewer
type ReadMap = Record<string, string>;
function readKey(viewer: "employer" | "candidate") { return `bcc_msg_read_${viewer}`; }
function loadReadMap(viewer: "employer" | "candidate"): ReadMap {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(readKey(viewer)) || "{}"); } catch { return {}; }
}
export function getUnreadCount(applicantId: string, jobId: string, viewer: "employer" | "candidate"): number {
  const map = loadReadMap(viewer);
  const last = map[`${applicantId}:${jobId}`];
  const otherSide = viewer === "employer" ? "candidate" : "employer";
  return listMessagesFor(applicantId, jobId).filter((m) => m.from === otherSide && (!last || m.at > last)).length;
}
export function markThreadRead(applicantId: string, jobId: string, viewer: "employer" | "candidate") {
  if (typeof window === "undefined") return;
  const map = loadReadMap(viewer);
  map[`${applicantId}:${jobId}`] = new Date().toISOString();
  localStorage.setItem(readKey(viewer), JSON.stringify(map));
  window.dispatchEvent(new Event("bcc-messages"));
}

// ============ Current employer's company profile (demo) ============
export interface EmployerCompanyProfile {
  name: string;
  industry: string;
  size: string;
  website: string;
  city: string;
  hrName: string;
  hrEmail: string;
  hrPhone: string;
  about: string;
}
export const MY_COMPANY_PROFILE: EmployerCompanyProfile = {
  name: "Acme Corp",
  industry: "Information Technology",
  size: "201-500",
  website: "https://acmecorp.example.in",
  city: "Bengaluru",
  hrName: "Priya Sharma",
  hrEmail: "priya@company.com",
  hrPhone: "+91 98450 11223",
  about: "Product engineering studio building SaaS tools for Indian enterprises.",
};

// ============ Stall applications (employer ↔ admin for job fair events) ============
export interface StallApplication {
  id: string;
  eventId: string;
  employerId: string;      // demo employer id / session id
  employerName: string;
  contactName: string;
  contactPhone: string;
  candidatesNeeded: number;
  rolesToHire: string;
  preferredZone?: string;
  notes?: string;
  status: "pending" | "approved" | "rejected";
  stallNo?: string;
  hall?: string;
  mapLat?: number;
  mapLng?: number;
  gateInstructions?: string;
  attendanceCode?: string;   // set by admin on approval
  attended: boolean;
  attendedAt?: string;
  reviewNote?: string;
  createdAt: string;
  reviewedAt?: string;
}

const STALL_KEY = "bcc_stall_applications";
const SEED_STALL_APPS: StallApplication[] = [
  {
    id: "SA-2001", eventId: "evt-hub-2026", employerId: "demo-employer",
    employerName: "Acme Corp", contactName: "R. Menon", contactPhone: "+91 98456 12345",
    candidatesNeeded: 25, rolesToHire: "Frontend Developer, QA Engineer",
    preferredZone: "IT Hall", status: "approved", stallNo: "H-12", hall: "Hall B",
    mapLat: 15.3647, mapLng: 75.1240,
    gateInstructions: "Enter via Gate 2 (Vidyanagar side). Show attendance QR at the employer check-in desk.",
    attendanceCode: "HUB-9241", attended: false,
    createdAt: "2026-06-20", reviewedAt: "2026-06-22",
  },
];

function readStalls(): StallApplication[] {
  if (typeof window === "undefined") return SEED_STALL_APPS;
  try {
    const raw = localStorage.getItem(STALL_KEY);
    if (!raw) { localStorage.setItem(STALL_KEY, JSON.stringify(SEED_STALL_APPS)); return SEED_STALL_APPS; }
    return JSON.parse(raw) as StallApplication[];
  } catch { return SEED_STALL_APPS; }
}
function writeStalls(list: StallApplication[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STALL_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("bcc-stall-apps"));
}

export function listStallApplications(): StallApplication[] { return readStalls(); }
export function getStallApplication(eventId: string, employerId: string): StallApplication | null {
  const all = readStalls().filter((s) => s.eventId === eventId);
  // Prefer exact employerId match; fall back to same company name so re-logins
  // (which mint a new session id) still see the approved allocation for their company.
  const byId = all.find((s) => s.employerId === employerId);
  if (byId) return byId;
  const byCompany = all.find((s) => s.employerName.trim().toLowerCase() === MY_COMPANY_PROFILE.name.trim().toLowerCase());
  return byCompany ?? null;
}
export function getStallById(id: string): StallApplication | null {
  return readStalls().find((s) => s.id === id) ?? null;
}
export function applyForStall(input: Omit<StallApplication, "id" | "status" | "attended" | "createdAt">): StallApplication {
  const rec: StallApplication = {
    ...input,
    id: "SA-" + Math.floor(1000 + Math.random() * 9000),
    status: "pending", attended: false,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  const nameKey = input.employerName.trim().toLowerCase();
  writeStalls([rec, ...readStalls().filter((s) => !(s.eventId === input.eventId && (s.employerId === input.employerId || s.employerName.trim().toLowerCase() === nameKey)))]);
  return rec;
}
export function reviewStallApplication(id: string, status: "approved" | "rejected", patch?: Partial<StallApplication>) {
  const next = readStalls().map((s) => {
    if (s.id !== id) return s;
    const merged: StallApplication = {
      ...s, ...patch, status,
      reviewedAt: new Date().toISOString().slice(0, 10),
    };
    if (status === "approved" && !merged.attendanceCode) {
      merged.attendanceCode = `${(s.eventId.split("-")[1] ?? "EVT").toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    return merged;
  });
  writeStalls(next);
}
export function markStallAttendance(id: string, code: string): { ok: boolean; reason?: string } {
  const app = getStallById(id);
  if (!app) return { ok: false, reason: "Application not found" };
  if (app.status !== "approved") return { ok: false, reason: "Stall is not yet approved" };
  if (!app.attendanceCode) return { ok: false, reason: "No attendance code assigned" };
  if (code.trim().toUpperCase() !== app.attendanceCode.toUpperCase()) {
    return { ok: false, reason: "Invalid code — check with the admin's event scanner" };
  }
  const next = readStalls().map((s) => s.id === id ? { ...s, attended: true, attendedAt: new Date().toISOString() } : s);
  writeStalls(next);
  return { ok: true };
}

// ============ Walk-in candidate lookup (by platform ID) ============
export interface WalkInCandidate {
  uniqueId: string;
  fullName: string;
  phone: string;
  email?: string;
  qualification?: string;
  experience?: string;
  skills?: string[];
  location?: string;
  resumeFileName?: string;
}

const WALKIN_KEY = "bcc_walkin_candidates";
const SEED_WALKINS: WalkInCandidate[] = [
  { uniqueId: "BCC-88451207", fullName: "Suresh Nayak", phone: "+91 98120 44521", email: "suresh.nayak@example.in", qualification: "ITI", experience: "1-2 yr", skills: ["Electrical Wiring", "Safety"], location: "Hubballi", resumeFileName: "suresh_nayak_resume.pdf" },
  { uniqueId: "BCC-77329918", fullName: "Neha Deshpande", phone: "+91 99880 76612", email: "neha.d@example.in", qualification: "BE/B-Tech", experience: "0-1 yr", skills: ["React", "JavaScript", "CSS"], location: "Bengaluru", resumeFileName: "neha_deshpande_resume.pdf" },
];
function readWalkIns(): WalkInCandidate[] {
  if (typeof window === "undefined") return SEED_WALKINS;
  try {
    const raw = localStorage.getItem(WALKIN_KEY);
    if (!raw) { localStorage.setItem(WALKIN_KEY, JSON.stringify(SEED_WALKINS)); return SEED_WALKINS; }
    return JSON.parse(raw) as WalkInCandidate[];
  } catch { return SEED_WALKINS; }
}
function writeWalkIns(list: WalkInCandidate[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(WALKIN_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("bcc-walkins"));
}
export function findCandidateByPublicId(publicId: string): WalkInCandidate | null {
  const q = publicId.trim().toUpperCase();
  if (!q) return null;
  const w = readWalkIns().find((c) => c.uniqueId.toUpperCase() === q);
  if (w) return w;
  const p = getCandidateProfile();
  if (p && p.uniqueId.toUpperCase() === q) {
    return {
      uniqueId: p.uniqueId, fullName: p.fullName, phone: p.phone, email: p.email,
      qualification: p.qualification, experience: p.yearsOfExperience,
      skills: p.skills, location: p.district, resumeFileName: p.resumeFileName,
    };
  }
  return null;
}
export function registerWalkIn(input: Omit<WalkInCandidate, "uniqueId">): WalkInCandidate {
  const rec: WalkInCandidate = { uniqueId: generateCandidateId(), ...input };
  writeWalkIns([rec, ...readWalkIns()]);
  return rec;
}

// ============ Event-scoped walk-in decisions (interview / hire / reject) ============
export interface WalkInDecision {
  id: string;
  eventId: string;
  candidateId: string;
  candidateName: string;
  decision: "Interview" | "Hired" | "Rejected" | "Shortlisted";
  note?: string;
  at: string;
}
const WD_KEY = "bcc_walkin_decisions";
export function listWalkInDecisions(eventId?: string): WalkInDecision[] {
  const list = readList<WalkInDecision>(WD_KEY);
  return eventId ? list.filter((d) => d.eventId === eventId) : list;
}
export function recordWalkInDecision(input: Omit<WalkInDecision, "id" | "at">): WalkInDecision {
  const rec: WalkInDecision = { ...input, id: "WD-" + Date.now(), at: new Date().toISOString() };
  writeList(WD_KEY, [rec, ...readList<WalkInDecision>(WD_KEY)].slice(0, 500), "bcc-walkin-decisions");
  return rec;
}

// ============ QR / Gate scan log ============
export interface ScanEntry {
  id: string;
  eventId: string;
  eventTitle: string;
  code: string;
  name: string;
  role: "candidate" | "employer";
  gate: string;
  status: "success" | "duplicate" | "not_found";
  at: string;
}
const SCAN_KEY = "bcc_scan_log";
const SCAN_SEED: ScanEntry[] = [
  { id: "SC-1", eventId: "evt-hub-2026", eventTitle: "Hubballi Skill Fair", code: "BCC-10024", name: "Ramesh Kumar", role: "candidate", gate: "Gate 1", status: "success", at: new Date().toISOString() },
  { id: "SC-2", eventId: "evt-hub-2026", eventTitle: "Hubballi Skill Fair", code: "BCC-10025", name: "Priya Sharma", role: "candidate", gate: "Gate 2", status: "success", at: new Date().toISOString() },
  { id: "SC-3", eventId: "evt-hub-2026", eventTitle: "Hubballi Skill Fair", code: "EMP-INFY-1001", name: "Infosys Limited", role: "employer", gate: "Gate 1", status: "success", at: new Date().toISOString() },
  { id: "SC-4", eventId: "evt-bm-2026", eventTitle: "Udyoga Mela 2026 — Bengaluru", code: "BCC-10088", name: "Anil Verma", role: "candidate", gate: "Gate 1", status: "success", at: new Date().toISOString() },
  { id: "SC-5", eventId: "evt-bm-2026", eventTitle: "Udyoga Mela 2026 — Bengaluru", code: "EMP-BOSCH-1002", name: "Bosch Limited", role: "employer", gate: "Gate 1", status: "success", at: new Date().toISOString() },
];
function readScans(): ScanEntry[] {
  if (typeof window === "undefined") return SCAN_SEED;
  try {
    const raw = localStorage.getItem(SCAN_KEY);
    if (!raw) { localStorage.setItem(SCAN_KEY, JSON.stringify(SCAN_SEED)); return SCAN_SEED; }
    return JSON.parse(raw) as ScanEntry[];
  } catch { return SCAN_SEED; }
}
export function listScans(eventId?: string): ScanEntry[] {
  const all = readScans();
  return eventId ? all.filter((s) => s.eventId === eventId) : all;
}
export function addScan(input: Omit<ScanEntry, "id" | "at">): ScanEntry {
  const rec: ScanEntry = { ...input, id: "SC-" + Date.now(), at: new Date().toISOString() };
  const next = [rec, ...readScans()].slice(0, 1000);
  if (typeof window !== "undefined") {
    localStorage.setItem(SCAN_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("bcc-scans"));
  }
  return rec;
}
export function todayScanStats() {
  const today = new Date().toISOString().slice(0, 10);
  const scans = readScans().filter((s) => s.at.slice(0, 10) === today && s.status === "success");
  const candidate = scans.filter((s) => s.role === "candidate").length;
  const employer = scans.filter((s) => s.role === "employer").length;
  return { total: candidate + employer, candidate, employer };
}


// ============ Venue Layout Builder (per event) ============
export type VenueBlockKind = "Building" | "Hall" | "Ground" | "Block";
export interface VenueStall {
  id: string;
  code: string;
  allocatedToAppId?: string;
  allocatedName?: string;
}
export interface VenueSection {
  id: string;
  name: string;
  code: string;
  stalls: VenueStall[];
}
export interface VenueBlock {
  id: string;
  eventId: string;
  kind: VenueBlockKind;
  name: string;
  code: string;
  sections: VenueSection[];
  stalls: VenueStall[];
}

const VENUE_KEY = "bcc_event_venues";
function readVenues(): VenueBlock[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(VENUE_KEY);
    return raw ? JSON.parse(raw) as VenueBlock[] : [];
  } catch { return []; }
}
function writeVenues(list: VenueBlock[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(VENUE_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("bcc-venues"));
}
function vuid(prefix: string) { return prefix + "-" + Math.random().toString(36).slice(2, 8).toUpperCase(); }

export function listVenueBlocks(eventId: string): VenueBlock[] {
  return readVenues().filter((b) => b.eventId === eventId);
}
export function addVenueBlock(eventId: string, kind: VenueBlockKind, name: string, code: string): VenueBlock {
  const rec: VenueBlock = { id: vuid("VB"), eventId, kind, name, code, sections: [], stalls: [] };
  writeVenues([...readVenues(), rec]);
  return rec;
}
export function deleteVenueBlock(id: string) {
  writeVenues(readVenues().filter((b) => b.id !== id));
}
export function addVenueSection(blockId: string, name: string, code: string): void {
  const list = readVenues().map((b) => b.id === blockId
    ? { ...b, sections: [...b.sections, { id: vuid("VS"), name, code, stalls: [] }] } : b);
  writeVenues(list);
}
export function deleteVenueSection(blockId: string, sectionId: string) {
  const list = readVenues().map((b) => b.id === blockId
    ? { ...b, sections: b.sections.filter((s) => s.id !== sectionId) } : b);
  writeVenues(list);
}
export function addStallsToBlock(blockId: string, count: number, prefix = "Stall") {
  const list = readVenues().map((b) => {
    if (b.id !== blockId) return b;
    const start = b.stalls.length + 1;
    const newStalls: VenueStall[] = Array.from({ length: count }, (_, i) => ({
      id: vuid("ST"), code: `${prefix}-${String(start + i).padStart(2, "0")}`,
    }));
    return { ...b, stalls: [...b.stalls, ...newStalls] };
  });
  writeVenues(list);
}
export function addStallsToSection(blockId: string, sectionId: string, count: number, prefix = "Stall") {
  const list = readVenues().map((b) => {
    if (b.id !== blockId) return b;
    return {
      ...b,
      sections: b.sections.map((s) => {
        if (s.id !== sectionId) return s;
        const start = s.stalls.length + 1;
        const newStalls: VenueStall[] = Array.from({ length: count }, (_, i) => ({
          id: vuid("ST"), code: `${prefix}-${String(start + i).padStart(2, "0")}`,
        }));
        return { ...s, stalls: [...s.stalls, ...newStalls] };
      }),
    };
  });
  writeVenues(list);
}
export function deleteStall(blockId: string, stallId: string, sectionId?: string) {
  const list = readVenues().map((b) => {
    if (b.id !== blockId) return b;
    if (sectionId) return { ...b, sections: b.sections.map((s) => s.id === sectionId ? { ...s, stalls: s.stalls.filter((x) => x.id !== stallId) } : s) };
    return { ...b, stalls: b.stalls.filter((x) => x.id !== stallId) };
  });
  writeVenues(list);
}
export function allocateStall(stallId: string, appId: string | null, name: string | null) {
  const list = readVenues().map((b) => {
    const mapStall = (s: VenueStall): VenueStall => {
      if (appId && s.allocatedToAppId === appId && s.id !== stallId) return { ...s, allocatedToAppId: undefined, allocatedName: undefined };
      if (s.id === stallId) return { ...s, allocatedToAppId: appId ?? undefined, allocatedName: name ?? undefined };
      return s;
    };
    return {
      ...b,
      stalls: b.stalls.map(mapStall),
      sections: b.sections.map((sec) => ({ ...sec, stalls: sec.stalls.map(mapStall) })),
    };
  });
  writeVenues(list);
}
export function venueStats(eventId: string) {
  const blocks = listVenueBlocks(eventId);
  let total = 0, allocated = 0;
  for (const b of blocks) {
    for (const s of b.stalls) { total++; if (s.allocatedToAppId) allocated++; }
    for (const sec of b.sections) for (const s of sec.stalls) { total++; if (s.allocatedToAppId) allocated++; }
  }
  return { blocks: blocks.length, total, allocated, empty: total - allocated };
}

export function updateVenueBlock(id: string, patch: { name?: string; code?: string; kind?: VenueBlockKind }) {
  writeVenues(readVenues().map((b) => b.id === id ? { ...b, ...patch } : b));
}
export function updateVenueSection(blockId: string, sectionId: string, patch: { name?: string; code?: string }) {
  writeVenues(readVenues().map((b) => b.id === blockId
    ? { ...b, sections: b.sections.map((s) => s.id === sectionId ? { ...s, ...patch } : s) } : b));
}
export function updateStallCode(blockId: string, stallId: string, code: string, sectionId?: string) {
  writeVenues(readVenues().map((b) => {
    if (b.id !== blockId) return b;
    if (sectionId) return { ...b, sections: b.sections.map((s) => s.id === sectionId
      ? { ...s, stalls: s.stalls.map((x) => x.id === stallId ? { ...x, code } : x) } : s) };
    return { ...b, stalls: b.stalls.map((x) => x.id === stallId ? { ...x, code } : x) };
  }));
}
export function renumberStalls(blockId: string, prefix: string, sectionId?: string) {
  writeVenues(readVenues().map((b) => {
    if (b.id !== blockId) return b;
    const relabel = (arr: VenueStall[]) => arr.map((s, i) => ({ ...s, code: `${prefix}-${String(i + 1).padStart(2, "0")}` }));
    if (sectionId) return { ...b, sections: b.sections.map((s) => s.id === sectionId ? { ...s, stalls: relabel(s.stalls) } : s) };
    return { ...b, stalls: relabel(b.stalls) };
  }));
}

