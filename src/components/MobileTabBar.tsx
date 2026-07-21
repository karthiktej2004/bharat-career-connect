import { Link, useRouterState } from "@tanstack/react-router";
import type { NavItem } from "./DashShell";

interface Props {
  role: "candidate" | "employer" | "companyadmin" | "admin";
  nav: NavItem[];
  onMore?: () => void;
}

export function MobileTabBar({ nav, onMore }: Props) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const primary = nav.slice(0, 4);
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5 h-16">
        {primary.map((n) => {
          const active = pathname === n.to;
          return (
            <Link
              key={n.to}
              to={n.to}
              className="flex flex-col items-center justify-center gap-1 min-w-0"
            >
              <span
                className={`flex items-center justify-center h-8 w-12 rounded-full transition ${
                  active ? "bg-saffron/20 text-saffron" : "text-muted-foreground"
                }`}
              >
                <n.icon className="h-5 w-5 shrink-0" />
              </span>
              <span className={`text-[10px] font-medium truncate max-w-full px-1 ${active ? "text-navy" : "text-muted-foreground"}`}>
                {n.label.split(" ")[0]}
              </span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={onMore}
          className="flex flex-col items-center justify-center gap-1 text-muted-foreground"
          aria-label="More"
        >
          <span className="flex items-center justify-center h-8 w-12 rounded-full">
            <span className="inline-flex gap-0.5">
              <span className="h-1 w-1 rounded-full bg-current" />
              <span className="h-1 w-1 rounded-full bg-current" />
              <span className="h-1 w-1 rounded-full bg-current" />
            </span>
          </span>
          <span className="text-[10px] font-medium">More</span>
        </button>
      </div>
    </nav>
  );
}
