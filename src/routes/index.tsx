import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Briefcase, Users, Building2, Award, QrCode, Sparkles, MapPin, Calendar, ShieldCheck, Languages, BarChart3 } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { Counter } from "@/components/Counter";
import { TricolorBar } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEED_EVENTS } from "@/lib/mockStore";
import { HeroAdCarousel } from "@/components/HeroAdCarousel";
import { motion } from "framer-motion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bharat Career Connect — India's Unified Job Fair Platform" },
      { name: "description", content: "Connect with employers, attend Udyoga Mela events and find jobs, internships and apprenticeships across India." },
      { property: "og:title", content: "Bharat Career Connect — India's Unified Job Fair Platform" },
      { property: "og:description", content: "Connect with employers, attend Udyoga Mela events and find jobs, internships and apprenticeships across India." },
    ],
  }),
  component: HomePage,
});

const stats = [
  { value: 124500, suffix: "+", label: "Candidates Registered" },
  { value: 2840, suffix: "+", label: "Verified Employers" },
  { value: 96, suffix: "", label: "Udyoga Mela Events" },
  { value: 38200, suffix: "+", label: "Offers Generated" },
];

const features = [
  { icon: Sparkles, title: "AI-Powered Smart Matching", desc: "Resume ↔ job matching with 40% skills, 20% location, 20% qualification and 20% experience scoring." },
  { icon: QrCode, title: "QR-Based Entry & Stalls", desc: "Contactless venue access, digital tokens, real-time queue tracking across every Udyoga Mela." },
  { icon: Building2, title: "Employer Hiring Console", desc: "Bulk job upload, candidate ranking, interview scheduling and live event dashboards." },
  { icon: BarChart3, title: "Government-Grade Analytics", desc: "District-wise employment reports, hiring trends and outcome tracking for policy makers." },
  { icon: Languages, title: "Multilingual Experience", desc: "English, Hindi, Kannada and Telugu support — built for Bharat at every skill level." },
  { icon: ShieldCheck, title: "DPDP-Compliant & Secure", desc: "Two-factor auth, audit trails, encrypted data — aligned with India's Digital Personal Data Protection Act." },
];

function HomePage() {
  const upcoming = SEED_EVENTS.filter((e) => e.status !== "Completed").slice(0, 3);
  return (
    <>
      <SiteHeader />
      <main>
        {/* HERO */}
        <section className="hero-gradient relative overflow-hidden">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-20 lg:py-28 grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-navy leading-[1.05]">
                A Digital Bridge Between Skills and Success
              </h1>
              <p className="mt-6 text-lg text-foreground/75 max-w-xl">
                A unified, AI-enabled ecosystem connecting job seekers, skill aspirants
                and employers through structured Udyoga Mela events and continuous hiring.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-saffron text-navy hover:bg-saffron/90 shadow-soft">
                  <Link to="/auth/signup">Register as Candidate <ArrowRight className="ml-1" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-navy text-navy hover:bg-navy hover:text-white">
                  <Link to="/register-company">Register as Employer</Link>
                </Button>
              </div>
              <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-india-green" /> Aadhaar-ready</span>
                <span className="flex items-center gap-1.5"><Award className="h-4 w-4 text-saffron" /> NSQF-aligned</span>
                <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-navy" /> MSDE-recognised</span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.15 }}>
              <HeroAdCarousel />
            </motion.div>
          </div>
        </section>

        {/* STATS */}
        <section className="bg-navy text-white">
          <TricolorBar />
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display font-bold text-3xl lg:text-4xl text-saffron">
                  <Counter to={s.value} suffix={s.suffix} />
                </p>
                <p className="text-sm text-white/70 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="outline" className="mb-3">What's Inside</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-navy">Everything a national job-fair platform needs</h2>
            <p className="mt-4 text-muted-foreground">Built end-to-end for candidates, employers and government event organisers.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Card className="p-6 card-hover h-full border-border/60">
                  <div className="size-11 rounded-lg bg-gradient-to-br from-saffron/20 to-india-green/20 flex items-center justify-center mb-4">
                    <f.icon className="h-5 w-5 text-navy" />
                  </div>
                  <h3 className="font-semibold text-navy mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* UPCOMING EVENTS */}
        <section className="bg-muted/30 py-20">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
              <div>
                <Badge variant="outline" className="mb-3">Udyoga Mela</Badge>
                <h2 className="text-3xl lg:text-4xl font-bold text-navy">Upcoming Job Fairs</h2>
              </div>
              <Button asChild variant="outline"><Link to="/events">View All Events <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {upcoming.map((e) => (
                <Card key={e.id} className="overflow-hidden card-hover border-border/60">
                  <div className="h-28 gov-gradient relative">
                    <TricolorBar className="absolute bottom-0" />
                    <Badge className="absolute top-3 right-3 bg-white text-navy">{e.type}</Badge>
                    {e.status === "Live" && <Badge className="absolute top-3 left-3 bg-india-green text-white">LIVE</Badge>}
                  </div>
                  <div className="p-5">
                    <h3 className="font-display font-bold text-navy">{e.title}</h3>
                    <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                      <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {e.venue}</p>
                      <p className="flex items-center gap-2"><Building2 className="h-4 w-4" /> {e.employers} employers</p>
                    </div>
                    <Button asChild size="sm" className="mt-4 w-full bg-navy text-white hover:bg-navy/90">
                      <Link to="/events/$id" params={{ id: e.id }}>View Details</Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* TARGET USERS */}
        <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-3">Built for Bharat</Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-navy">From ITI to PhD — every aspirant belongs here</h2>
              <p className="mt-4 text-muted-foreground">
                Whether you're a 10th-pass skill aspirant, an ITI apprentice, a fresh BE graduate
                or an experienced professional, Bharat Career Connect matches you with the right
                opportunity through Udyoga Mela events and continuous hiring.
              </p>
              <div className="mt-6 flex gap-3">
                <Button asChild className="bg-india-green text-white hover:bg-india-green/90"><Link to="/auth/signup">Get Started Free</Link></Button>
                <Button asChild variant="ghost"><Link to="/about">Learn More</Link></Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Briefcase, t: "Jobs", c: "Freshers & experienced" },
                { icon: Award, t: "Apprenticeships", c: "NAPS-aligned roles" },
                { icon: Users, t: "Internships", c: "Skill-based placements" },
                { icon: Sparkles, t: "Skill Programs", c: "STT & NSQF tracks" },
              ].map((x) => (
                <Card key={x.t} className="p-5 card-hover border-border/60">
                  <x.icon className="h-6 w-6 text-saffron mb-3" />
                  <p className="font-display font-semibold text-navy">{x.t}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{x.c}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 pb-20">
          <div className="gov-gradient rounded-3xl px-8 py-14 lg:px-16 lg:py-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
            <div className="relative">
              <h2 className="text-3xl lg:text-5xl font-bold text-white">Ready to hire — or be hired?</h2>
              <p className="mt-4 text-white/80 max-w-2xl mx-auto">Join India's fastest-growing employment exchange and be part of the next Udyoga Mela.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button asChild size="lg" className="bg-saffron text-navy hover:bg-saffron/90"><Link to="/auth/signup">Create Account</Link></Button>
                <Button asChild size="lg" variant="outline" className="border-white bg-transparent text-white hover:bg-white hover:text-navy"><Link to="/contact">Talk to Our Team</Link></Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
