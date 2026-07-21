import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TricolorBar } from "@/components/Brand";
import { Briefcase, Calendar, MapPin, Building2, Users, ArrowRight, Sparkles } from "lucide-react";
import { SEED_EVENTS, SEED_JOBS, getEventImage, getCompanyLogo, getJobImage } from "@/lib/mockStore";
import { motion, AnimatePresence } from "framer-motion";

type Slide =
  | { kind: "job"; job: (typeof SEED_JOBS)[number] }
  | { kind: "event"; event: (typeof SEED_EVENTS)[number] }
  | { kind: "company" };

function buildSlides(): Slide[] {
  const jobs = SEED_JOBS.slice(0, 3).map<Slide>((job) => ({ kind: "job", job }));
  const events = SEED_EVENTS.filter((e) => e.status !== "Completed")
    .slice(0, 2)
    .map<Slide>((event) => ({ kind: "event", event }));
  const company: Slide = { kind: "company" };
  // interleave: event, job, company, job, event, job
  return [events[0], jobs[0], company, jobs[1], events[1], jobs[2]].filter(Boolean) as Slide[];
}

export function HeroAdCarousel() {
  const slides = buildSlides();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((v) => (v + 1) % slides.length), 4000);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  const slide = slides[i];

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="absolute -inset-4 bg-gradient-to-br from-saffron/20 via-transparent to-india-green/20 rounded-3xl blur-2xl" />
      <Card className="relative overflow-hidden shadow-elegant border-border/60 min-h-[460px]">
        <TricolorBar />
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
            >
              {slide.kind === "event" && <EventSlide event={slide.event} />}
              {slide.kind === "job" && <JobSlide job={slide.job} />}
              {slide.kind === "company" && <CompanySlide />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Show slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                idx === i ? "w-6 bg-navy" : "w-1.5 bg-navy/25"
              }`}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}

function EventSlide({ event }: { event: (typeof SEED_EVENTS)[number] }) {
  const [img, setImg] = useState<string | undefined>(() => getEventImage(event.id));
  useEffect(() => {
    const update = () => setImg(getEventImage(event.id));
    window.addEventListener("bcc-event-images", update);
    return () => window.removeEventListener("bcc-event-images", update);
  }, [event.id]);

  return (
    <div>
      <div className="relative -mx-6 -mt-6 mb-4 h-48 overflow-hidden">
        {img ? (
          <img src={img} alt={event.title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full gov-gradient" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <Badge className="absolute top-3 left-3 bg-saffron/95 text-navy border-0">
          <Calendar className="h-3 w-3 mr-1" /> Upcoming Event
        </Badge>
        <Badge className="absolute top-3 right-3 bg-white text-navy">{event.type}</Badge>
      </div>
      <h3 className="font-display font-bold text-xl text-navy leading-snug">{event.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{event.description}</p>
      <div className="mt-3 space-y-1.5 text-sm text-foreground/80">
        <p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-saffron" /> {new Date(event.date).toLocaleDateString("en-IN", { dateStyle: "medium" })}</p>
        <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-saffron" /> {event.venue}, {event.district}</p>
      </div>
      <div className="mt-4 flex gap-2">
        <Button asChild size="sm" className="flex-1 bg-navy text-white hover:bg-navy/90">
          <Link to="/events/$id" params={{ id: event.id }}>View</Link>
        </Button>
        <Button asChild size="sm" className="flex-1 bg-saffron text-navy hover:bg-saffron/90">
          <Link to="/auth/signup">Register</Link>
        </Button>
      </div>
    </div>
  );
}

function JobSlide({ job }: { job: (typeof SEED_JOBS)[number] }) {
  const logo = getCompanyLogo(job.company);
  const roleImg = getJobImage(job);
  return (
    <div>
      <div className="relative -mx-6 -mt-6 mb-4 h-40 overflow-hidden">
        <img src={roleImg} alt={job.title} className="h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <Badge className="absolute top-3 left-3 bg-india-green text-white border-0">
          <Briefcase className="h-3 w-3 mr-1" /> Featured Job
        </Badge>
        <Badge className="absolute top-3 right-3 bg-white text-navy">{job.type}</Badge>
        <div className="absolute bottom-2 left-3 flex items-center gap-2">
          <div className="h-9 w-9 rounded-md bg-white border border-white/70 flex items-center justify-center overflow-hidden shadow">
            {logo ? (
              <img
                src={logo}
                alt={`${job.company} logo`}
                className="h-full w-full object-contain p-0.5"
                loading="lazy"
                onError={(e) => { (e.currentTarget.style.display = "none"); }}
              />
            ) : (
              <Building2 className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <p className="text-white text-sm font-semibold drop-shadow">{job.company}</p>
        </div>
      </div>
      <h3 className="font-display font-bold text-lg text-navy leading-snug">{job.title}</h3>
      <div className="mt-3 space-y-1.5 text-sm text-foreground/80">
        <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-india-green" /> {job.location}</p>
        <p className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-india-green" /> {job.qualification} · {job.experience} · {job.salary}</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {job.skills.slice(0, 4).map((s) => (
          <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <Button asChild size="sm" className="flex-1 bg-navy text-white hover:bg-navy/90">
          <Link to="/auth/signup">Apply Now <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="flex-1">
          <Link to="/auth/signup">View Details</Link>
        </Button>
      </div>
    </div>
  );
}

function CompanySlide() {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <Badge variant="outline" className="bg-navy/10 border-navy/40 text-navy">
          <Building2 className="h-3 w-3 mr-1" /> For Employers
        </Badge>
        <Badge className="bg-saffron/90 text-navy">Free to join</Badge>
      </div>
      <h3 className="font-display font-bold text-xl text-navy leading-snug">
        Hire from India's largest verified talent pool
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Post jobs, run Udyoga Mela stalls, and access AI-ranked candidates across every state.
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          { k: "1.2L+", v: "Candidates" },
          { k: "2,800+", v: "Employers" },
          { k: "96", v: "Events" },
        ].map((s) => (
          <div key={s.v} className="rounded-lg bg-muted/60 p-2">
            <p className="font-display font-bold text-navy">{s.k}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.v}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Users className="h-3.5 w-3.5" /> Trusted by Infosys, Bosch, Tata, HDFC and more
      </div>
      <div className="mt-4 flex gap-2">
        <Button asChild size="sm" className="flex-1 bg-navy text-white hover:bg-navy/90">
          <Link to="/register-company">Register Company <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="flex-1">
          <Link to="/for-employers">Learn More</Link>
        </Button>
      </div>
    </div>
  );
}
