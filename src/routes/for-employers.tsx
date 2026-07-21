import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, Calendar, BarChart3, Building2, Award, ShieldCheck, Upload, Star } from "lucide-react";

export const Route = createFileRoute("/for-employers")({
  head: () => ({
    meta: [
      { title: "For Employers — Bharat Career Connect" },
      { name: "description", content: "Post jobs, get AI-ranked candidates, manage interviews and participate in India's largest Udyoga Mela events." },
      { property: "og:title", content: "For Employers — Bharat Career Connect" },
      { property: "og:description", content: "Post jobs, get AI-ranked candidates, manage interviews and participate in India's largest Udyoga Mela events." },
    ],
  }),
  component: EmployerPage,
});

const items = [
  { icon: Briefcase, t: "Smart Job Posting", d: "Single job or bulk Excel upload with filters for role, qualification and skills." },
  { icon: Users, t: "AI Candidate Ranking", d: "Ranked matches with transparent skill, location and experience scoring." },
  { icon: Calendar, t: "Interview Scheduler", d: "Time-slot booking, panel assignment and virtual interview support." },
  { icon: Building2, t: "Udyoga Mela Stalls", d: "Register for events, get stall allocation and manage walk-in queues live." },
  { icon: BarChart3, t: "Hiring Analytics", d: "Conversion rates, event performance and downloadable candidate data." },
  { icon: Upload, t: "Bulk Operations", d: "Post 100s of jobs and shortlist candidates in bulk via Excel/API." },
  { icon: Star, t: "Credibility Score", d: "Build your employer rating with feedback from candidates and admins." },
  { icon: ShieldCheck, t: "GST-Verified Profiles", d: "Verified employer badge with company credibility tracking." },
  { icon: Award, t: "Government Drives", d: "Participate in district and state-level employment campaigns." },
];

function EmployerPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero-gradient py-20">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <Badge variant="outline" className="mb-3">For Employers</Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-navy">Hire faster. Hire better.</h1>
            <p className="mt-4 text-lg text-muted-foreground">Reach 1L+ pre-screened candidates, participate in Udyoga Mela events and close hires on the spot.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="bg-saffron text-navy hover:bg-saffron/90"><Link to="/register-company">Register as Employer</Link></Button>
              <Button asChild size="lg" variant="outline"><Link to="/contact">Contact Support</Link></Button>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-[1440px] px-4 py-16 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((f) => (
            <Card key={f.t} className="p-6 card-hover border-border/60">
              <div className="size-10 rounded-lg bg-india-green/15 flex items-center justify-center mb-3">
                <f.icon className="h-5 w-5 text-india-green" />
              </div>
              <h3 className="font-display font-bold text-navy">{f.t}</h3>
              <p className="text-sm text-muted-foreground mt-2">{f.d}</p>
            </Card>
          ))}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
