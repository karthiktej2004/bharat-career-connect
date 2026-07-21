import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { TricolorBar } from "@/components/Brand";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Eye, Heart, Users, ShieldCheck, Building2 } from "lucide-react";
import { QUALIFICATIONS } from "@/lib/mockStore";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Bharat Career Connect" },
      { name: "description", content: "Our mission to power India's largest employment ecosystem through Udyoga Mela job fairs and continuous AI-driven hiring." },
      { property: "og:title", content: "About — Bharat Career Connect" },
      { property: "og:description", content: "Our mission to power India's largest employment ecosystem through Udyoga Mela job fairs and continuous AI-driven hiring." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero-gradient py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <Badge variant="outline" className="mb-3">About Us</Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-navy">Powering Bharat's Employment Story</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Bharat Career Connect Solutions LLP is a Bengaluru-based platform purpose-built to connect
              India's job seekers, skill aspirants and employers through structured Udyoga Mela events.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-16 grid md:grid-cols-3 gap-6">
          {[
            { icon: Target, t: "Mission", d: "Enable seamless discovery and application for jobs, internships and apprenticeships across India — at scale and at speed." },
            { icon: Eye, t: "Vision", d: "Become the trusted employment exchange for every Indian — from ITI apprentice to PhD graduate." },
            { icon: Heart, t: "Values", d: "Inclusion, transparency, government partnership and AI-driven fairness in every match we make." },
          ].map((x) => (
            <Card key={x.t} className="p-6 card-hover border-border/60">
              <x.icon className="h-8 w-8 text-saffron mb-3" />
              <h3 className="font-display font-bold text-navy text-xl mb-2">{x.t}</h3>
              <p className="text-sm text-muted-foreground">{x.d}</p>
            </Card>
          ))}
        </section>

        <section className="bg-muted/40 py-16">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-navy text-center">Built for every level of education</h2>
            <p className="text-center mt-2 text-muted-foreground">From Below 10th to PhD, including ITI, Diploma and Short Term Training (STT) aspirants.</p>
            <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {QUALIFICATIONS.map((q, i) => (
                <div key={q} className="rounded-lg bg-background border border-border/60 px-4 py-3 text-sm flex items-center gap-3">
                  <span className="size-7 rounded-full bg-saffron/15 text-saffron font-display font-bold text-xs flex items-center justify-center">{i + 1}</span>
                  {q}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-16 grid lg:grid-cols-3 gap-6">
          {[
            { icon: Users, t: "Target Users", d: "Skill aspirants, internship and apprenticeship aspirants, freshers and experienced professionals." },
            { icon: Building2, t: "Employers", d: "Public sector undertakings, private companies, MSMEs and government skill missions." },
            { icon: ShieldCheck, t: "Government Partners", d: "MSDE, NSDC, state skill development missions and district employment exchanges." },
          ].map((x) => (
            <Card key={x.t} className="p-6 border-border/60">
              <x.icon className="h-7 w-7 text-india-green mb-3" />
              <h3 className="font-display font-bold text-navy">{x.t}</h3>
              <p className="text-sm text-muted-foreground mt-2">{x.d}</p>
            </Card>
          ))}
        </section>

        <TricolorBar />
      </main>
      <SiteFooter />
    </>
  );
}
