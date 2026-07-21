import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Globe, GraduationCap, Building2 } from "lucide-react";
import { Logo, TricolorBar } from "./Brand";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getSession, setSession, type User } from "@/lib/mockStore";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/for-candidates", label: "For Candidates" },
  { to: "/for-employers", label: "For Employers" },
  { to: "/events", label: "Events" },
  { to: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const sync = () => setUser(getSession());
    sync();
    window.addEventListener("bcc-session", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("bcc-session", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const dashHref =
    user?.role === "superadmin" ? "/admin"
    : user?.role === "admin" ? "/company-admin"
    : user?.role === "employer" ? "/company-admin"
    : user?.role === "candidate" ? "/candidate"
    : "/auth/login";

  return (
    <>
    <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-md border-b border-border">
      <TricolorBar />
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden lg:flex items-center gap-1">
          {nav.map((n) => {
            const active = pathname === n.to || (n.to !== "/" && pathname.startsWith(n.to));
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  active ? "text-saffron font-semibold" : "text-foreground/80 hover:text-navy hover:bg-muted"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden lg:flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <Globe className="h-4 w-4" /> EN
          </Button>
          {user ? (
            <>
              <Button asChild variant="outline" size="sm">
                <Link to={dashHref}>Dashboard</Link>
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSession(null)}>Sign out</Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm"><Link to="/auth/login">Sign in</Link></Button>
              <Button size="sm" className="bg-saffron text-navy hover:bg-saffron/90" onClick={() => setRegisterOpen(true)}>
                Register
              </Button>
            </>
          )}

        </div>
        <button className="lg:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="px-4 py-3 space-y-1">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className="block px-3 py-2 rounded-md text-sm hover:bg-muted">
                {n.label}
              </Link>
            ))}
            <div className="pt-2 grid gap-2">
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1"><Link to="/auth/login">Sign in</Link></Button>
                <Button size="sm" className="flex-1 bg-saffron text-navy hover:bg-saffron/90" onClick={() => { setOpen(false); setRegisterOpen(true); }}>Register</Button>
              </div>
            </div>

          </div>
        </div>
      )}
    </header>

    <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center font-display text-xl text-navy">Register as</DialogTitle>
          <DialogDescription className="text-center">Choose how you want to join Bharat Career Connect</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 mt-2">
          <Button onClick={() => { setRegisterOpen(false); navigate({ to: "/auth/signup" }); }} className="h-auto py-4 bg-navy hover:bg-navy/90 justify-start gap-3 px-4">
            <GraduationCap className="h-6 w-6 shrink-0" />
            <div className="text-left">
              <p className="font-semibold">Candidate</p>
              <p className="text-xs text-white/70 font-normal">Looking for jobs & career opportunities</p>
            </div>
          </Button>
          <Button onClick={() => { setRegisterOpen(false); navigate({ to: "/register-company" }); }} className="h-auto py-4 bg-saffron text-navy hover:bg-saffron/90 justify-start gap-3 px-4">
            <Building2 className="h-6 w-6 shrink-0" />
            <div className="text-left">
              <p className="font-semibold">Employer</p>
              <p className="text-xs text-navy/70 font-normal">Hiring talent for your organization</p>
            </div>
          </Button>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-1">
          Already have an account? <button onClick={() => { setRegisterOpen(false); navigate({ to: "/auth/login" }); }} className="text-saffron font-medium underline">Sign in</button>
        </p>
      </DialogContent>
    </Dialog>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-navy text-white/90 mt-20">
      <TricolorBar />
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo light />
          <p className="mt-4 text-sm text-white/70 max-w-md">
            A unified, next-generation digital ecosystem connecting job seekers, skill aspirants
            and employers through structured Udyoga Mela events and continuous hiring.
          </p>
          <div className="mt-4 flex gap-2 text-xs">
            <span className="px-2 py-1 rounded bg-white/10 border border-white/15">Made in India</span>
            <span className="px-2 py-1 rounded bg-white/10 border border-white/15">DPDP-Compliant</span>
            <span className="px-2 py-1 rounded bg-white/10 border border-white/15">NSQF-Aligned</span>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Platform</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link to="/for-candidates" className="hover:text-saffron">For Candidates</Link></li>
            <li><Link to="/for-employers" className="hover:text-saffron">For Employers</Link></li>
            <li><Link to="/events" className="hover:text-saffron">Events</Link></li>
            <li><Link to="/about" className="hover:text-saffron">About</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Contact</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li>+91 99863 02386</li>
            <li>info@bharatcareerconnect.com</li>
            <li className="text-xs">No.1, YM Complex, 1st Floor, Jogi Colony, Madiwala, Hosur Main Road, Bengaluru – 560029</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">
        © {new Date().getFullYear()} Bharat Career Connect Solutions LLP. All rights reserved.
      </div>
    </footer>
  );
}
