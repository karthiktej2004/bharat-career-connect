import { createFileRoute } from "@tanstack/react-router";
import { DashShell, PageHeader } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Star, CheckCircle2, XCircle, Video, Inbox } from "lucide-react";
import { useEffect, useState } from "react";
import {
  listEmployerFeedback, reviewEmployerFeedback, type EmployerFeedback,
  listEmployerTestimonials, reviewEmployerTestimonial, type EmployerTestimonial,
} from "@/lib/mockStore";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/feedback")({
  head: () => ({ meta: [{ title: "Feedback Moderation — Admin" }] }),
  component: FeedbackMod,
});

function FeedbackMod() {
  const [fb, setFb] = useState<EmployerFeedback[]>([]);
  const [vt, setVt] = useState<EmployerTestimonial[]>([]);
  const [tab, setTab] = useState<"pending" | "published" | "rejected">("pending");

  useEffect(() => {
    const sync = () => { setFb(listEmployerFeedback()); setVt(listEmployerTestimonials()); };
    sync();
    window.addEventListener("bcc-employer-feedback", sync);
    window.addEventListener("bcc-employer-testimonials", sync);
    return () => {
      window.removeEventListener("bcc-employer-feedback", sync);
      window.removeEventListener("bcc-employer-testimonials", sync);
    };
  }, []);

  const filteredFb = fb.filter((f) => f.status === tab);
  const filteredVt = vt.filter((v) => v.status === tab);
  const counts = {
    pending: fb.filter((f) => f.status === "pending").length + vt.filter((v) => v.status === "pending").length,
    published: fb.filter((f) => f.status === "published").length + vt.filter((v) => v.status === "published").length,
    rejected: fb.filter((f) => f.status === "rejected").length + vt.filter((v) => v.status === "rejected").length,
  };

  return (
    <DashShell role="admin" nav={adminNav}>
      <PageHeader
        title="Feedback & Video Testimonials"
        description="Publish or reject employer-submitted written feedback and video testimonials. Nothing goes live on the public site until you approve it."
      />

      <div className="grid gap-3 sm:grid-cols-3 mb-6">
        <MiniStat label="Pending" value={counts.pending} tone="saffron" icon={<Inbox className="h-4 w-4" />} />
        <MiniStat label="Published" value={counts.published} tone="green" icon={<CheckCircle2 className="h-4 w-4" />} />
        <MiniStat label="Rejected" value={counts.rejected} tone="red" icon={<XCircle className="h-4 w-4" />} />
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="mb-4">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
      </Tabs>

      <Tabs defaultValue="written">
        <TabsList>
          <TabsTrigger value="written">Written ({filteredFb.length})</TabsTrigger>
          <TabsTrigger value="video">Video ({filteredVt.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="written" className="space-y-3 mt-4">
          {filteredFb.length === 0 && <Card className="p-8 border-border/60 text-center text-muted-foreground">Nothing in this queue.</Card>}
          {filteredFb.map((f) => (
            <Card key={f.id} className="p-5 border-border/60">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="font-display font-bold text-navy">{f.employerName}</p>
                    <Badge variant="outline">Employer</Badge>
                    <div className="flex">{Array.from({ length: f.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-saffron text-saffron" />)}</div>
                    <span className="text-xs text-muted-foreground">{f.createdAt}</span>
                  </div>
                  {f.candidateQuality && <p className="mt-2 text-sm text-muted-foreground"><b className="text-navy">Candidate quality:</b> {f.candidateQuality}</p>}
                  {f.eventOrganisation && <p className="mt-1 text-sm text-muted-foreground"><b className="text-navy">Event organisation:</b> {f.eventOrganisation}</p>}
                  {f.hiringEfficiency && <p className="mt-1 text-sm text-muted-foreground"><b className="text-navy">Hiring efficiency:</b> {f.hiringEfficiency}</p>}
                </div>
                {f.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-india-green text-white hover:bg-india-green/90" onClick={() => { reviewEmployerFeedback(f.id, "published"); toast.success("Feedback published"); }}>
                      <CheckCircle2 className="h-4 w-4 mr-1" />Publish
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive" onClick={() => { reviewEmployerFeedback(f.id, "rejected", "Did not meet publication guidelines"); toast.success("Feedback rejected"); }}>
                      <XCircle className="h-4 w-4 mr-1" />Reject
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="video" className="grid md:grid-cols-2 gap-4 mt-4">
          {filteredVt.length === 0 && <Card className="p-8 border-border/60 text-center text-muted-foreground md:col-span-2">Nothing in this queue.</Card>}
          {filteredVt.map((v) => (
            <Card key={v.id} className="p-5 border-border/60">
              <div className="aspect-video rounded-lg gov-gradient flex items-center justify-center"><Video className="h-12 w-12 text-white/70" /></div>
              <div className="mt-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">{v.topic}</Badge>
                  <span className="text-xs text-muted-foreground">{v.createdAt}</span>
                </div>
                <p className="font-display font-bold text-navy mt-1">{v.title}</p>
                <p className="text-xs text-muted-foreground">{v.employerName}{v.videoName ? ` · ${v.videoName}` : ""}</p>
                <p className="text-sm text-muted-foreground mt-2">{v.summary}</p>
              </div>
              {v.status === "pending" && (
                <div className="flex gap-2 mt-3">
                  <Button size="sm" className="bg-india-green text-white hover:bg-india-green/90" onClick={() => { reviewEmployerTestimonial(v.id, "published"); toast.success("Testimonial published"); }}>Publish</Button>
                  <Button size="sm" variant="outline" className="text-destructive" onClick={() => { reviewEmployerTestimonial(v.id, "rejected", "Did not meet publication guidelines"); toast.success("Testimonial rejected"); }}>Reject</Button>
                </div>
              )}
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </DashShell>
  );
}

function MiniStat({ label, value, tone, icon }: { label: string; value: number; tone: "saffron" | "green" | "red"; icon: React.ReactNode }) {
  const cls = tone === "green" ? "text-india-green bg-india-green/10" : tone === "red" ? "text-destructive bg-destructive/10" : "text-saffron bg-saffron/10";
  return (
    <Card className="p-4 border-border/60 flex items-center gap-3">
      <div className={`size-9 rounded-md flex items-center justify-center ${cls}`}>{icon}</div>
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="font-display font-bold text-navy text-xl">{value}</p>
      </div>
    </Card>
  );
}
