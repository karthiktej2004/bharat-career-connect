import { LayoutDashboard, UserCircle, Briefcase, FileCheck, Calendar, MessageSquareHeart, Video as VideoIcon, History, Building2, Users, CalendarCheck, BarChart3, MessageSquare, CalendarRange, UserCog, BuildingIcon, ClipboardList, QrCode, Megaphone, FileBarChart2, ShieldCheck, Wallet, KeyRound, Settings, Inbox, Workflow, Database, LifeBuoy, Sparkles } from "lucide-react";
import type { NavItem } from "@/components/DashShell";

export const candidateNav: NavItem[] = [
  { to: "/candidate", label: "Overview", icon: LayoutDashboard },
  { to: "/candidate/profile", label: "Profile", icon: UserCircle },
  { to: "/candidate/jobs", label: "Browse Jobs", icon: Briefcase },
  { to: "/candidate/applications", label: "Applications", icon: FileCheck },
  { to: "/candidate/events", label: "Events", icon: Calendar },
  { to: "/candidate/interviews", label: "Interviews", icon: MessageSquareHeart },
  { to: "/candidate/history", label: "History", icon: History },
  { to: "/candidate/feedback", label: "Feedback", icon: VideoIcon },
];

export const employerNav: NavItem[] = [
  { to: "/employer", label: "Dashboard", icon: LayoutDashboard },
  { to: "/employer/company", label: "Company Profile", icon: Building2 },
  { to: "/employer/jobs", label: "Job Postings", icon: Briefcase },
  { to: "/employer/candidates", label: "Applications", icon: Users },
  { to: "/employer/interviews", label: "Interviews", icon: CalendarCheck },
  { to: "/employer/events", label: "Job Fair", icon: Calendar },
  { to: "/employer/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/employer/feedback", label: "Feedback", icon: MessageSquare },
];

export const adminNav: NavItem[] = [
  { to: "/admin", label: "Live Monitoring", icon: LayoutDashboard },
  { to: "/admin/events", label: "Event Management", icon: CalendarRange },
  { to: "/admin/jobfair", label: "Event Approvals", icon: Sparkles },
  { to: "/admin/candidates", label: "Candidate Management", icon: UserCog },
  { to: "/admin/employers", label: "Employer Management", icon: BuildingIcon },
  { to: "/admin/jobs", label: "Job Approvals", icon: Briefcase },
  { to: "/admin/company-requests", label: "Company Requests", icon: Inbox },
  { to: "/admin/interviews", label: "Interview Control", icon: ClipboardList },
  { to: "/admin/qr", label: "QR & Entry", icon: QrCode },
  { to: "/admin/notifications", label: "Notifications", icon: Megaphone },
  { to: "/admin/reports", label: "Reports & Analytics", icon: FileBarChart2 },
  { to: "/admin/feedback", label: "Feedback & Grievance", icon: ShieldCheck },
  { to: "/admin/payments", label: "Payments & Billing", icon: Wallet },
  { to: "/admin/roles", label: "Roles & Access", icon: KeyRound },
  { to: "/admin/data", label: "Data Controls", icon: Database },
  { to: "/admin/settings", label: "Security & Compliance", icon: Settings },
];
