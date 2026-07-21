import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { DashShell, PageHeader, StatCard } from "@/components/DashShell";
import { candidateNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Calendar, FileCheck, Award, QrCode, Sparkles, Flame, Coins, MapPin, ChevronRight, GraduationCap, IdCard, Loader2 } from "lucide-react";
import { getSession } from "@/lib/mockStore";

export const Route = createFileRoute("/candidate/")({
  head: () => ({ meta: [{ title: "Candidate Dashboard — Bharat Career Connect" }] }),
  component: CandidateHome,
});

// We keep your completion calculator just in case the backend sends the raw row
function computeCompletion(p: any): number {
  if (!p) return 0;
  const fields: unknown[] = [p.fullName, p.email, p.phone, p.dob, p.gender, p.category, p.state, p.district, p.pincode, p.qualification, p.institution, p.yearOfPassing, p.percentage, p.specialization, p.skills?.length, p.experienceType, p.resumeFileName, p.preferredLocations?.length, p.preferredJobType, p.expectedSalary];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

function CandidateHome() {
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState("Candidate");
  const [slide, setSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Real database states
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  
  const trackRef = useRef<HTMLDivElement>(null);

  // ==========================================
  // 🚀 REAL DATABASE FETCH ON DASHBOARD LOAD
  // ==========================================
  useEffect(() => {
    async function fetchMyData() {
      const session = getSession(); 
      if (!session || !session.id) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch everything in parallel
        const [pRes, jRes, aRes, eRes] = await Promise.all([
          fetch(`http://localhost:5000/api/candidate/${session.id}`),
          fetch(`http://localhost:5000/api/jobs/all`),
          fetch(`http://localhost:5000/api/candidate/${session.id}/applications`),
          fetch(`http://localhost:5000/api/candidate/${session.id}/events`)
        ]);

        const [pJson, jJson, aJson, eJson] = await Promise.all([
          pRes.json(), jRes.json(), aRes.json(), eRes.json()
        ]);
        
        if (pJson.success && pJson.data) {
          setProfile(pJson.data);
          const displayName = pJson.data.fullName || session.name || "Candidate";
          setName(displayName.split(" ")[0]);
        }
        if (jJson.success) setJobs(jJson.data);
        if (aJson.success) setApplications(aJson.data);
        if (eJson.success) setEvents(eJson.data);

      } catch (err) {
        console.error("Failed to fetch real database data", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMyData();
  }, []);

  if (isLoading) {
    return (
      <DashShell role="candidate" nav={candidateNav}>
        <div className="flex flex-col items-center justify-center h-[60vh] text-navy">
          <Loader2 className="h-8 w-8 animate-spin mb-4 text-saffron" />
          <p className="font-medium">Loading your real database profile...</p>
        </div>
      </DashShell>
    );
  }

  const profileCompletion = profile?.completion || computeCompletion(profile) || 0;
  const userSkills = profile?.skills || [];
  
  function scrollTo(i: number) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.children[i] as HTMLElement | undefined;
    if (card) el.scrollTo({ left: card.offsetLeft - 16, behavior: "smooth" });
    setSlide(i);
  }

  return (
    <DashShell role="candidate" nav={candidateNav}>
      {/* Mobile hero */}
      <div className="lg:hidden -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 mb-6">
        <div className="relative overflow-hidden rounded-b-3xl px-5 pt-6 pb-8 gov-gradient text-white">
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 20% 10%, rgba(255,153,51,0.5), transparent 40%), radial-gradient(circle at 90% 90%, rgba(19,136,8,0.4), transparent 45%)" }} />
          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-widest text-white/70">Welcome back</p>
              <h1 className="font-display font-extrabold text-2xl leading-tight mt-1 truncate">Hi, {name}!</h1>
              <p className="text-sm text-white/80 mt-1 truncate">{profile?.uniqueId ? `ID ${profile.uniqueId} · ` : ""}{profile?.qualification || "Your next opportunity awaits"}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1 rounded-full bg-white/10 border border-white/20 px-2.5 py-1 text-xs font-semibold">
                <Flame className="h-3.5 w-3.5 text-saffron" /> 5
              </div>
              <div className="flex items-center gap-1 rounded-full bg-white/10 border border-white/20 px-2.5 py-1 text-xs font-semibold">
                <Coins className="h-3.5 w-3.5 text-gold" /> 200
              </div>
            </div>
          </div>

          <div className="relative mt-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur p-3 flex items-center gap-3">
            <div className="relative size-11 shrink-0">
              <svg viewBox="0 0 36 36" className="size-11 -rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15" fill="none" stroke="var(--saffron)" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${(profileCompletion / 100) * 94.2} 94.2`} />
              </svg>
              <span className="absolute inset-0 grid place-items-center text-[10px] font-bold">{profileCompletion}%</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">{profileCompletion >= 100 ? "Profile complete" : "Complete your profile"}</p>
              <p className="text-[11px] text-white/70">{profileCompletion >= 100 ? "Great job — you're fully ready" : "Boost your match score by adding missing details"}</p>
            </div>
            <Button asChild size="sm" className="bg-saffron text-navy hover:bg-saffron/90 shrink-0"><Link to="/candidate/profile">{profileCompletion >= 100 ? "View" : "Finish"}</Link></Button>
          </div>
        </div>
      </div>

      <div className="hidden lg:block">
        <PageHeader title={`Welcome back, ${name}`} description={profile?.uniqueId ? `Candidate ID: ${profile.uniqueId} · ${profile.email || ""}` : "Here's what's happening with your job search today."} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard label="Profile" value={`${profileCompletion}%`} icon={IdCard} accent="india-green" trend={profileCompletion >= 100 ? "Complete" : "Keep going"} />
        <StatCard label="Skills" value={String(userSkills.length)} icon={Sparkles} accent="navy" trend={userSkills.slice(0, 2).join(", ") || "Add skills"} />
        <StatCard label="Qualification" value={profile?.qualification ? profile.qualification.split(" ")[0] : "—"} icon={GraduationCap} />
        <StatCard label="Experience" value={profile?.experienceType === "Experienced" ? `${profile.yearsOfExperience || "1"} yr` : profile?.experienceType || "Fresher"} icon={Briefcase} accent="india-green" />
      </div>

      {/* JOBS FOR YOU */}
      <section className="mb-8">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 mb-3 px-1">
          <div className="min-w-0">
            <h2 className="font-display font-bold text-navy text-lg sm:text-xl">Jobs for you</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Curated openings that match your profile</p>
          </div>
          <Link to="/candidate/jobs" className="text-sm text-saffron font-semibold inline-flex items-center shrink-0">
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div
          ref={trackRef}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3 -mx-4 sm:-mx-6 px-4 sm:px-6 scrollbar-none"
          style={{ scrollbarWidth: "none" }}
          onScroll={(e) => {
            const el = e.currentTarget;
            const idx = Math.round(el.scrollLeft / (el.clientWidth * 0.82));
            if (idx !== slide) setSlide(idx);
          }}
        >
          {jobs.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No jobs match your profile yet.</p>
          ) : (
            jobs.map((j) => (
              <article
                key={j.id}
                className="snap-start shrink-0 w-[82%] sm:w-[360px] rounded-2xl border border-border/60 bg-background shadow-soft overflow-hidden card-hover"
              >
                <div className="gov-gradient h-24 relative p-4 flex flex-col justify-between text-white">
                  <Badge className="self-start bg-white/20 border border-white/25 text-white hover:bg-white/25">New</Badge>
                  <div>
                    <p className="text-xs text-white/80">{j.company_name}</p>
                    <h3 className="font-display font-bold text-base truncate">{j.title}</h3>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {j.location}
                  </p>
                  <Button asChild size="sm" className="w-full mt-3 bg-navy text-white hover:bg-navy/90">
                    <Link to="/candidate/jobs">Apply now</Link>
                  </Button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {/* My Applications section */}
      <section className="mb-8">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 mb-3 px-1">
          <div className="min-w-0">
            <h2 className="font-display font-bold text-navy text-lg sm:text-xl">My Applications</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Everything you've applied to, right here</p>
          </div>
          <Link to="/candidate/applications" className="text-sm text-saffron font-semibold inline-flex items-center shrink-0">
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 sm:-mx-6 px-4 sm:px-6 scrollbar-none" style={{ scrollbarWidth: "none" }}>
          {applications.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No applications found.</p>
          ) : (
            applications.slice(0, 5).map((app) => (
              <Card key={app.application_id} className="snap-start shrink-0 w-[70%] sm:w-64 p-4 border-border/60">
                <div className="size-10 rounded-lg bg-navy/10 text-navy grid place-items-center mb-3">
                  <Briefcase className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-navy text-sm truncate">{app.job_title}</h3>
                <p className="text-xs text-muted-foreground truncate">{app.company}</p>
                <Badge className="mt-3 bg-saffron/15 text-saffron border-0">{app.status}</Badge>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* Upcoming events */}
      <section>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 mb-3 px-1">
          <div className="min-w-0">
            <h2 className="font-display font-bold text-navy text-lg sm:text-xl">Upcoming Events</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Udyoga Melas near you</p>
          </div>
          <Link to="/candidate/events" className="text-sm text-saffron font-semibold inline-flex items-center shrink-0">
            All events <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground italic col-span-2">No upcoming events.</p>
          ) : (
            events.slice(0, 2).map((e) => (
              <Card key={e.id} className="p-4 border-border/60">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-navy truncate">{e.title || e.event_name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {new Date(e.event_date).toLocaleDateString("en-IN", { dateStyle: "medium" })} · {e.venue}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0">{e.type || "Fair"}</Badge>
                </div>
                <Button asChild size="sm" variant="outline" className="w-full mt-3">
                  <Link to="/candidate/events"><QrCode className="h-4 w-4 mr-1" /> View pass</Link>
                </Button>
              </Card>
            ))
          )}
        </div>
      </section>
    </DashShell>
  );
}