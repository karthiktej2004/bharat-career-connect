import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { LogOut, Menu } from "lucide-react";

import { Logo, TricolorBar } from "./Brand";
import { Button } from "./ui/button";
import { MobileTabBar } from "./MobileTabBar";
import { getSession, setSession, type User } from "@/lib/mockStore";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

interface Props {
  role: "candidate" | "employer" | "companyadmin" | "admin";
  nav: NavItem[];
  children: ReactNode;
}

const roleColors = {
  candidate: { accent: "bg-saffron text-navy", label: "Candidate" },
  employer: { accent: "bg-india-green text-white", label: "Employer" },
  companyadmin: { accent: "bg-navy text-white", label: "Admin" },
  admin: { accent: "bg-navy text-white", label: "Admin" },
};

export function DashShell({ role, nav, children }: Props) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ==========================================
  // 🚀 SMART ROUTE PROTECTION LOGIC (Fixes the 'role' error)
  // ==========================================
  useEffect(() => {
    // We use 'any' here to stop TypeScript from throwing a strict type error on the 'role' word
    const u: any = getSession(); 
    
    if (!u) {
      // 1. Not logged in? Kick them to the login page.
      navigate({ to: "/" }); 
    } else if (u.role !== role) {
      // 2. Wrong dashboard? DO NOT destroy the session! 
      // Just safely redirect them back to their correct home.
      if (u.role === 'admin') {
        navigate({ to: "/admin" });
      } else if (u.role === 'employer') {
        navigate({ to: "/employer" });
      } else {
        navigate({ to: "/candidate" });
      }
    } else {
      // 3. Valid session and correct role! Let them in.
      setUser(u);
    }
  }, [role, navigate]);

  useEffect(() => setSidebarOpen(false), [pathname]);

  function logout() {
    setSession(null);
    navigate({ to: "/" }); 
  }

  const meta = roleColors[role];

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar — desktop sticky, mobile drawer */}
      <aside className={`fixed lg:sticky top-0 z-40 h-screen w-72 lg:w-64 bg-background border-r border-border flex flex-col transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <TricolorBar />
        <div className="p-4 border-b border-border"><Logo /></div>
        <div className="px-4 py-3">
          <div className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded ${meta.accent} inline-block font-semibold`}>{meta.label} Panel</div>
        </div>
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {nav.map((n) => {
            const active = pathname === n.to;
            return (
              <Link key={n.to} to={n.to} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${active ? "bg-navy text-white font-medium" : "text-foreground/80 hover:bg-muted"}`}>
                <n.icon className="h-4 w-4 shrink-0" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-gradient-to-br from-saffron to-india-green flex items-center justify-center text-white font-bold text-sm shrink-0">
              {user?.name?.charAt(0) ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-navy">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} title="Sign out"><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* MOBILE ONLY HEADER */}
        <header className="lg:hidden sticky top-0 z-20 bg-background/90 backdrop-blur border-b border-border h-14 flex items-center px-3 sm:px-4 gap-2">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}><Menu /></Button>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Logo compact />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">{children}</main>
        <MobileTabBar role={role} nav={nav} onMore={() => setSidebarOpen(true)} />
      </div>
    </div>
  );
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display font-bold text-xl sm:text-2xl lg:text-3xl text-navy truncate">{title}</h1>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, trend, accent = "saffron" }: { label: string; value: string | number; icon: LucideIcon; trend?: string; accent?: "saffron" | "navy" | "india-green" }) {
  const accentClass = accent === "navy" ? "bg-navy/10 text-navy" : accent === "india-green" ? "bg-india-green/15 text-india-green" : "bg-saffron/15 text-saffron";
  return (
    <div className="rounded-xl bg-background border border-border/60 p-4 sm:p-5 card-hover">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground truncate">{label}</p>
          <p className="font-display font-bold text-xl sm:text-2xl text-navy mt-1">{value}</p>
          {trend && <p className="text-xs text-india-green mt-1 truncate">{trend}</p>}
        </div>
        <div className={`size-9 sm:size-10 rounded-lg flex items-center justify-center shrink-0 ${accentClass}`}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
      </div>
    </div>
  );
}