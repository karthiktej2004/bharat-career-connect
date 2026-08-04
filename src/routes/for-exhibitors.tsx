import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, Megaphone, QrCode } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/for-exhibitors")({
  head: () => ({
    meta: [
      { title: "For Exhibitors — Bharat Career Connect" },
      { name: "description", content: "Showcase your brand and products at Udyoga Mela events." }
    ],
  }),
  component: ForExhibitorsPage,
});

function ForExhibitorsPage() {
  return (
    <>
      <SiteHeader />
      <main className="hero-gradient min-h-[calc(100vh-4rem)] pt-20 pb-24">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 text-center">
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge variant="outline" className="mb-6 bg-white/50 backdrop-blur text-navy border-navy/20">
              For Exhibitors
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-navy mb-6">
              Showcase your brand. <br className="hidden sm:block" />Expand your reach.
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Book premium stall spaces at Udyoga Mela events. Display your products, connect with thousands of attendees, and network with industry leaders.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-20">
              <Button asChild size="lg" className="bg-india-green text-white hover:bg-india-green/90 shadow-soft">
                <Link to="/register-exhibitor">Register as Exhibitor</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white hover:bg-muted shadow-sm">
                <Link to="/contact">Contact Support</Link>
              </Button>
            </div>
          </motion.div>

          {/* Feature Cards matching the Employer page layout */}
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <Card className="p-6 border-border/60 shadow-sm h-full card-hover bg-white/80 backdrop-blur">
                <div className="size-11 rounded-lg bg-india-green/10 flex items-center justify-center mb-4">
                  <Store className="h-5 w-5 text-india-green" />
                </div>
                <h3 className="font-bold text-navy mb-2">Prime Stall Booking</h3>
                <p className="text-sm text-muted-foreground">
                  Reserve strategic spaces at massive job fairs to maximize footfall and brand exposure for your products.
                </p>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <Card className="p-6 border-border/60 shadow-sm h-full card-hover bg-white/80 backdrop-blur">
                <div className="size-11 rounded-lg bg-india-green/10 flex items-center justify-center mb-4">
                  <Megaphone className="h-5 w-5 text-india-green" />
                </div>
                <h3 className="font-bold text-navy mb-2">Brand Visibility</h3>
                <p className="text-sm text-muted-foreground">
                  Highlight your services directly to tens of thousands of job seekers, government officials, and professionals.
                </p>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
              <Card className="p-6 border-border/60 shadow-sm h-full card-hover bg-white/80 backdrop-blur">
                <div className="size-11 rounded-lg bg-india-green/10 flex items-center justify-center mb-4">
                  <QrCode className="h-5 w-5 text-india-green" />
                </div>
                <h3 className="font-bold text-navy mb-2">Smart Lead Capture</h3>
                <p className="text-sm text-muted-foreground">
                  Use our built-in QR scanner technology to instantly capture visitor details and generate high-quality leads.
                </p>
              </Card>
            </motion.div>
          </div>

        </div>
      </main>
      <SiteFooter />
    </>
  );
}
