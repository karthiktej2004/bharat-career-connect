import { Link } from "@tanstack/react-router";
import { Globe2 } from "lucide-react";

export function TricolorBar({ className = "" }: { className?: string }) {
  return <div className={`tricolor-bar h-1 w-full ${className}`} />;
}

/**
 * Native, typographic rendering of the Bharat Career Connect wordmark.
 * Not an image — built from type + an inline globe glyph so it scales,
 * inherits color, and stays crisp on any background.
 */
export function Logo({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  const text = light ? "text-white" : "text-navy";
  const sub = light ? "text-white/70" : "text-muted-foreground";
  return (
    <Link to="/" className="flex items-center gap-2.5 group" aria-label="Bharat Career Connect — Home">
      <span
        className={`relative inline-flex items-center justify-center h-10 w-10 rounded-lg ${
          light ? "bg-white/10 border border-white/20" : "bg-navy/5 border border-navy/15"
        } group-hover:scale-105 transition-transform`}
      >
        <Globe2 className={`h-5 w-5 ${light ? "text-white" : "text-navy"}`} strokeWidth={2} />
        <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full flex items-center justify-center text-[8px] font-bold ${
          light ? "bg-saffron text-navy" : "bg-saffron text-navy"
        }`}>
          B
        </span>
      </span>
      <span className="flex flex-col leading-none">
        <span className={`font-display font-extrabold tracking-tight ${compact ? "text-sm" : "text-[15px]"} ${text}`}>
          BHARAT <span className="text-saffron">CAREER</span> CONNECT
        </span>
        <span className={`mt-1 text-[9px] uppercase tracking-[0.22em] font-semibold ${sub}`}>
          Udyoga Mela Platform
        </span>
      </span>
    </Link>
  );
}
