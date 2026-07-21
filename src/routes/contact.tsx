import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, Globe } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Bharat Career Connect" },
      { name: "description", content: "Get in touch with Bharat Career Connect Solutions LLP for partnerships, employer onboarding and event support." },
      { property: "og:title", content: "Contact — Bharat Career Connect" },
      { property: "og:description", content: "Get in touch with Bharat Career Connect Solutions LLP for partnerships, employer onboarding and event support." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero-gradient py-16">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <Badge variant="outline" className="mb-3">Contact</Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-navy">Let's build Bharat's hiring future together</h1>
          </div>
        </section>
        <section className="mx-auto max-w-[1440px] px-4 py-16 grid lg:grid-cols-2 gap-10">
          <Card className="p-8 border-border/60">
            <h2 className="font-display font-bold text-navy text-2xl mb-6">Send us a message</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Message received. Our team will reach out within 1 business day.");
                (e.target as HTMLFormElement).reset();
              }}
              className="space-y-4"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>Full name</Label><Input required placeholder="Your name" className="mt-1" /></div>
                <div><Label>Phone</Label><Input required placeholder="+91" className="mt-1" /></div>
              </div>
              <div><Label>Email</Label><Input required type="email" placeholder="you@company.com" className="mt-1" /></div>
              <div><Label>Organisation</Label><Input placeholder="Company / Department" className="mt-1" /></div>
              <div><Label>Message</Label><Textarea required rows={5} placeholder="How can we help?" className="mt-1" /></div>
              <Button type="submit" className="w-full bg-saffron text-navy hover:bg-saffron/90">Send message</Button>
            </form>
          </Card>
          <div className="space-y-4">
            <Card className="p-6 border-border/60">
              <MapPin className="h-6 w-6 text-saffron mb-2" />
              <h3 className="font-display font-bold text-navy">Head Office</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Bharat Career Connect Solutions LLP<br />
                No.1, YM Complex, 1st Floor,<br />
                Jogi Colony, Madiwala Checkpost,<br />
                Hosur Main Road, Bengaluru – 560029
              </p>
            </Card>
            <Card className="p-6 border-border/60"><Phone className="h-6 w-6 text-india-green mb-2" /><h3 className="font-display font-bold text-navy">Phone</h3><p className="mt-2 text-sm text-muted-foreground">+91 99863 02386</p></Card>
            <Card className="p-6 border-border/60"><Mail className="h-6 w-6 text-navy mb-2" /><h3 className="font-display font-bold text-navy">Email</h3><p className="mt-2 text-sm text-muted-foreground">info@bharatcareerconnect.com</p></Card>
            <Card className="p-6 border-border/60"><Globe className="h-6 w-6 text-saffron mb-2" /><h3 className="font-display font-bold text-navy">Website</h3><p className="mt-2 text-sm text-muted-foreground">www.bharatcareerconnect.com</p></Card>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
