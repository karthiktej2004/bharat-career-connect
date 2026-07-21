import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, FileText, QrCode, Bell, Languages, MessageCircle, Award, MapPin, Bot } from "lucide-react";

export const Route = createFileRoute("/for-candidates")({
  head: () => ({
    meta: [
      { title: "For Candidates — Bharat Career Connect" },
      { name: "description", content: "Build a smart profile, get AI-matched to jobs, attend Udyoga Mela events with QR pass and track your applications." },
      { property: "og:title", content: "For Candidates — Bharat Career Connect" },
      { property: "og:description", content: "Build a smart profile, get AI-matched to jobs, attend Udyoga Mela events with QR pass and track your applications." },
    ],
  }),
  component: CandidatePage,
});

const items = [
  { icon: Sparkles, t: "AI Smart Matching", d: "Job recommendations scored on skills, location, qualification and experience." },
  { icon: FileText, t: "Resume Builder & Parser", d: "Upload your resume — we auto-fill your profile and suggest skill gaps." },
  { icon: QrCode, t: "QR Entry Pass", d: "Download your QR pass and walk into any Udyoga Mela contact-free." },
  { icon: MapPin, t: "Stall View", d: "Browse employers by stall, industry and walk-in queue length." },
  { icon: Bell, t: "Event Alerts", d: "SMS, WhatsApp and email reminders for slot bookings and interviews." },
  { icon: Award, t: "Government Schemes", d: "Auto-tagged opportunities for SC/ST/OBC reservations and skill missions." },
  { icon: Languages, t: "Multilingual", d: "English, Hindi, Kannada and Telugu — pick the language you're comfortable with." },
  { icon: Bot, t: "AI Chatbot", d: "Instant answers to FAQs about events, jobs and your application status." },
  { icon: MessageCircle, t: "Video Testimonials", d: "Share your hiring journey — approved testimonials feature on the platform." },
];

function CandidatePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero-gradient py-20">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <Badge variant="outline" className="mb-3">For Candidates</Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-navy">Your career, accelerated</h1>
            <p className="mt-4 text-lg text-muted-foreground">Build a profile in minutes, get matched with verified employers and attend India's biggest job fairs — all in one place.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="bg-saffron text-navy hover:bg-saffron/90"><Link to="/auth/signup">Register Free</Link></Button>
              <Button asChild size="lg" variant="outline"><Link to="/events">Browse Events</Link></Button>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-[1440px] px-4 py-16 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((f) => (
            <Card key={f.t} className="p-6 card-hover border-border/60">
              <div className="size-10 rounded-lg bg-saffron/15 flex items-center justify-center mb-3">
                <f.icon className="h-5 w-5 text-saffron" />
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
