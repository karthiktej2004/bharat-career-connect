import { createFileRoute } from "@tanstack/react-router";
import { DashShell, PageHeader } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Star, CheckCircle2, XCircle, Video, Inbox, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/feedback")({
  head: () => ({ meta: [{ title: "Feedback Moderation — Admin" }] }),
  component: FeedbackMod,
});

export interface AdminFeedbackItem {
  id: number;
  employerId: number;
  employerName: string;
  rating: number;
  candidateQuality?: string;
  eventOrganisation?: string;
  hiringEfficiency?: string;
  videoUrl?: string;
  status: "pending" | "published" | "rejected";
  createdAt: string;
}

function FeedbackMod() {
  const [feedbackList, setFeedbackList] = useState<AdminFeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<"pending" | "published" | "rejected">("pending");

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

  const fetchFeedback = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/api/admin/feedback`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setFeedbackList(json.data);
      } else {
        setFeedbackList([]);
      }
    } catch (error) {
      toast.error("Failed to load feedback from server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleStatusUpdate = async (id: number, newStatus: "published" | "rejected") => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/feedback/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();

      if (json.success) {
        toast.success(`Feedback marked as ${newStatus}`);
        setFeedbackList((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
      } else {
        toast.error(json.message || "Could not update status.");
      }
    } catch (error) {
      toast.error("Server connection error.");
    }
  };

  const filteredItems = feedbackList.filter((f) => f.status === tab);
  const writtenItems = filteredItems;
  const videoItems = filteredItems.filter((f) => Boolean(f.videoUrl));

  const counts = {
    pending: feedbackList.filter((f) => f.status === "pending").length,
    published: feedbackList.filter((f) => f.status === "published").length,
    rejected: feedbackList.filter((f) => f.status === "rejected").length,
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
          <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
          <TabsTrigger value="published">Published ({counts.published})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({counts.rejected})</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <Card className="p-12 border-border/60 flex flex-col items-center justify-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mb-2 text-saffron" />
          <p>Loading feedback queues...</p>
        </Card>
      ) : (
        <Tabs defaultValue="written">
          <TabsList>
            <TabsTrigger value="written">Written ({writtenItems.length})</TabsTrigger>
            <TabsTrigger value="video">Video ({videoItems.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="written" className="space-y-3 mt-4">
            {writtenItems.length === 0 && (
              <Card className="p-8 border-border/60 text-center text-muted-foreground">
                Nothing in this queue.
              </Card>
            )}
            {writtenItems.map((f) => (
              <Card key={f.id} className="p-5 border-border/60">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="font-display font-bold text-navy">{f.employerName}</p>
                      <Badge variant="outline">Employer</Badge>
                      <div className="flex">
                        {Array.from({ length: f.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-saffron text-saffron" />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">{f.createdAt}</span>
                    </div>
                    {f.candidateQuality && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        <b className="text-navy">Candidate quality:</b> {f.candidateQuality}
                      </p>
                    )}
                    {f.eventOrganisation && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        <b className="text-navy">Event organisation:</b> {f.eventOrganisation}
                      </p>
                    )}
                    {f.hiringEfficiency && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        <b className="text-navy">Hiring efficiency:</b> {f.hiringEfficiency}
                      </p>
                    )}
                  </div>
                  {f.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-india-green text-white hover:bg-india-green/90"
                        onClick={() => handleStatusUpdate(f.id, "published")}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Publish
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive"
                        onClick={() => handleStatusUpdate(f.id, "rejected")}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="video" className="grid md:grid-cols-2 gap-4 mt-4">
            {videoItems.length === 0 && (
              <Card className="p-8 border-border/60 text-center text-muted-foreground md:col-span-2">
                Nothing in this queue.
              </Card>
            )}
            {videoItems.map((v) => (
              <Card key={v.id} className="p-5 border-border/60">
                <div className="aspect-video rounded-lg gov-gradient flex items-center justify-center bg-navy/90 overflow-hidden relative">
                  {v.videoUrl ? (
                    <video src={v.videoUrl} controls className="w-full h-full object-cover" />
                  ) : (
                    <Video className="h-12 w-12 text-white/70" />
                  )}
                </div>
                <div className="mt-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">Testimonial</Badge>
                    <span className="text-xs text-muted-foreground">{v.createdAt}</span>
                  </div>
                  <p className="font-display font-bold text-navy mt-1">{v.employerName}</p>
                  {v.candidateQuality && (
                    <p className="text-sm text-muted-foreground mt-2">{v.candidateQuality}</p>
                  )}
                </div>
                {v.status === "pending" && (
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      className="bg-india-green text-white hover:bg-india-green/90"
                      onClick={() => handleStatusUpdate(v.id, "published")}
                    >
                      Publish
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive"
                      onClick={() => handleStatusUpdate(v.id, "rejected")}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      )}
    </DashShell>
  );
}

function MiniStat({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone: "saffron" | "green" | "red";
  icon: React.ReactNode;
}) {
  const cls =
    tone === "green"
      ? "text-india-green bg-india-green/10"
      : tone === "red"
      ? "text-destructive bg-destructive/10"
      : "text-saffron bg-saffron/10";
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
