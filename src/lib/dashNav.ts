import { 
  LayoutDashboard, 
  UserCircle, 
  Briefcase, 
  FileCheck, 
  Calendar, 
  MessageSquareHeart, 
  Video as VideoIcon, 
  History, 
  Building2, 
  Users, 
  CalendarCheck, 
  BarChart3, 
  MessageSquare, 
  CalendarRange, 
  UserCog, 
  BuildingIcon, 
  ClipboardList, 
  QrCode, 
  Megaphone, 
  FileBarChart2, 
  ShieldCheck, 
  Wallet, 
  KeyRound, 
  Settings, 
  Inbox, 
  Workflow, 
  Database, 
  LifeBuoy, 
  Sparkles, 
  Bookmark,
  Ticket,
  CalendarDays,
  UsersRound,
  Store,
  Bell
} from "lucide-react";
import type { NavItem } from "@/components/DashShell";

export const candidateNav: NavItem[] = [
  { to: "/candidate", label: "Overview", icon: LayoutDashboard },
  { to: "/candidate/profile", label: "Profile", icon: UserCircle },
  { to: "/candidate/jobs", label: "Browse Jobs", icon: Briefcase },
  { to: "/candidate/saved-jobs", label: "Saved Jobs", icon: Bookmark },
  { to: "/candidate/applications", label: "Applications", icon: FileCheck },
  { to: "/candidate/events", label: "Events", icon: Calendar },
  { to: "/candidate/interviews", label: "Interviews", icon: MessageSquareHeart },
  { to: "/candidate/history", label: "History", icon: History },
  { to: "/candidate/feedback", label: "Feedback", icon: VideoIcon },
  // 🚨 FIXED: Changed undefined 'Notifications' to imported 'Bell' icon 🚨
  { to: "/candidate/notifications", label: "Notifications", icon: Bell }
];

export const employerNav: NavItem[] = [
  { to: "/employer", label: "Dashboard", icon: LayoutDashboard },
  { to: "/employer/company", label: "Company Profile", icon: Building2 },
  { to: "/employer/event-jobs", label: "Event Jobs", icon: CalendarDays },
  { to: "/employer/candidates", label: "Applications", icon: Users },
  { to: "/employer/events", label: "Job Fair", icon: Calendar },
  { to: "/employer/event-queue", label: "Live Queue", icon: Ticket },
  { to: "/employer/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/employer/feedback", label: "Feedback", icon: MessageSquare },
];

export const exhibitorNav: NavItem[] = [
  { to: "/exhibitor", label: "Dashboard", icon: LayoutDashboard },
  { to: "/exhibitor/profile", label: "Profile", icon: Store },
  { to: "/exhibitor/events", label: "Events", icon: CalendarRange },
  { to: "/exhibitor/representatives", label: "Representatives", icon: UsersRound },
  { to: "/exhibitor/branding", label: "Branding & Promotion", icon: Megaphone },
  { to: "/exhibitor/leads", label: "Visitor Leads", icon: QrCode },
  { to: "/exhibitor/notifications", label: "Notifications", icon: Bell },
];

export const adminNav: NavItem[] = [
  { to: "/admin", label: "Live Monitoring", icon: LayoutDashboard },
  { to: "/admin/events", label: "Event Management", icon: CalendarRange },
  { to: "/admin/jobfair", label: "Event Approvals", icon: Sparkles },
  { to: "/admin/candidates", label: "Candidate Management", icon: UserCog },
  { to: "/admin/event-candidates", label: "Event Candidates", icon: UsersRound },
  { to: "/admin/employers", label: "Employer Management", icon: BuildingIcon },
  { to: "/admin/exhibitors", label: "Exhibitor Management", icon: Store },
  { to: "/admin/jobs", label: "Job Approvals", icon: Briefcase },
  { to: "/admin/interviews", label: "Interview Control", icon: ClipboardList },
  { to: "/admin/qr", label: "QR & Entry", icon: QrCode },
  { to: "/admin/notifications", label: "Notifications", icon: Megaphone },
  { to: "/admin/feedback", label: "Feedback & Grievance", icon: ShieldCheck },
  { to: "/admin/payments", label: "Payments & Billing", icon: Wallet },
  { to: "/admin/crowd-monitor", label: "Live Crowd Monitor", icon: Users },
  { to: "/admin/history", label: "Event History", icon: History },
];
