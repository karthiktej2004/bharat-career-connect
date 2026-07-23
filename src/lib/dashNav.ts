import {
  Radio,
  Calendar,
  CheckSquare,
  Users,
  Building2,
  Briefcase,
  Inbox,
  Video,
  QrCode,
  Bell,
  BarChart3,
  History,
  MessageSquare,
  Settings,
  LayoutDashboard,
  User,
  MapPin,
  FileText,
  LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export const adminNav: NavItem[] = [
  { title: "Live Monitoring", href: "/admin", icon: Radio },
  { title: "Event Management", href: "/admin/events", icon: Calendar },
  { title: "Event Approvals", href: "/admin/jobfair", icon: CheckSquare },
  { title: "Candidate Management", href: "/admin/candidates", icon: Users },
  { title: "Employer Management", href: "/admin/employers", icon: Building2 },
  { title: "Job Approvals", href: "/admin/jobs", icon: Briefcase },
  { title: "Company Requests", href: "/admin/company-requests", icon: Inbox },
  { title: "Interview Control", href: "/admin/interviews", icon: Video },
  { title: "QR & Entry", href: "/admin/qr", icon: QrCode },
  { title: "Notifications", href: "/admin/notifications", icon: Bell },
  { title: "Reports & Analytics", href: "/admin/reports", icon: BarChart3 },
  { title: "Activity History", href: "/admin/history", icon: History },
  { title: "Feedback & Grievance", href: "/admin/feedback", icon: MessageSquare },
  { title: "Settings", href: "/admin/settings", icon: Settings },
];

export const employerNav: NavItem[] = [
  { title: "Dashboard", href: "/employer", icon: LayoutDashboard },
  { title: "Company Profile", href: "/employer/company", icon: Building2 },
  { title: "Job Postings", href: "/employer/jobs", icon: Briefcase },
  { title: "Applications", href: "/employer/applications", icon: FileText },
  { title: "Interviews", href: "/employer/interviews", icon: Calendar },
  { title: "Job Fair", href: "/employer/events", icon: MapPin },
  { title: "Analytics", href: "/employer/analytics", icon: BarChart3 },
  { title: "Feedback", href: "/employer/feedback", icon: MessageSquare },
];

export const candidateNav: NavItem[] = [
  { title: "Dashboard", href: "/candidate", icon: LayoutDashboard },
  { title: "My Profile", href: "/candidate/profile", icon: User },
  { title: "Browse Jobs", href: "/candidate/jobs", icon: Briefcase },
  { title: "Job Fairs", href: "/candidate/events", icon: Calendar },
  { title: "My Applications", href: "/candidate/applications", icon: FileText },
  { title: "Interviews", href: "/candidate/interviews", icon: Video },
  { title: "History", href: "/candidate/history", icon: History },
  { title: "Feedback", href: "/candidate/feedback", icon: MessageSquare },
];
