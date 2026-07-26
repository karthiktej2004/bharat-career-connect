import { createFileRoute, Link } from "@tanstack/react-router";
import { DashShell, PageHeader } from "@/components/DashShell";
import { candidateNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/mockStore";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bookmark, BookmarkX, MapPin, IndianRupee, GraduationCap, ArrowRight, Loader2 } from "lucide-react";

export const Route = createFileRoute("/candidate/saved-jobs")({
  component: SavedJobsPage,
});

interface SavedJob {
  saved_id: number;
  status: string;
  updated_at: string;
  job_id: number;
  title: string;
  company_name: string;
  location: string;
  job_type: string;
  salary_range: string;
  qualification_required: string;
}

export function SavedJobsPage() {
  const session = getSession();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "https://bcc-backend-0cny.onrender.com";

  const fetchSavedJobs = async () => {
    if (!session?.id) return;
    try {
      setLoading(true);
      const res = await fetch(`${baseUrl}/api/candidate/${session.id}/saved-jobs`);
      const json = await res.json();
      if (json.success) {
        setSavedJobs(json.data || []);
      } else {
        toast.error("Failed to load saved jobs.");
      }
    } catch (err) {
      toast.error("Network error loading saved jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, [session?.id]);

  const handleRemoveSavedJob = async (savedId: number, jobId: number) => {
    if (!session?.id) return;
    setActionId(savedId);

    try {
      const res = await fetch(`${baseUrl}/api/candidate/saved-jobs/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: session.id, jobId }),
      });
      const json = await res.json();

      if (json.success) {
        toast.success(json.message || "Job removed from saved list.");
        setSavedJobs((prev) => prev.filter((item) => item.saved_id !== savedId));
      } else {
        toast.error(json.message || "Action failed.");
      }
    } catch (err) {
      toast.error("Failed to update saved job.");
    } finally {
      setActionId(null);
    }
  };

  const handleApply = async (jobId: number) => {
    if (!session?.id) return;
    try {
      const res = await fetch(`${baseUrl}/api/applications/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, candidateId: session.id }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Application submitted successfully!");
      } else {
        toast.error(json.message || "Already applied or submission error.");
      }
    } catch (err) {
      toast.error("Application failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <DashShell role="candidate" nav={candidateNav}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-navy" />
        </div>
      </DashShell>
    );
  }

  return (
    <DashShell role="candidate" nav={candidateNav}>
      <PageHeader title="Saved Jobs" description="Review your bookmarked opportunities and submit applications anytime." />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-navy flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-saffron fill-saffron" /> Bookmarked Positions
          </h2>
          <Badge variant="outline" className="text-navy font-semibold px-3 py-1">
            {savedJobs.length} {savedJobs.length === 1 ? "Job Saved" : "Jobs Saved"}
          </Badge>
        </div>

        {savedJobs.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-2 bg-white">
            <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <h3 className="text-lg font-semibold text-navy">No saved jobs yet</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-6">
              Click the bookmark icon on any job listing in the browse page to save it here.
            </p>
            <Button asChild className="bg-navy text-white hover:bg-navy/90">
              <Link to="/candidate/jobs">Browse Matching Jobs</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {savedJobs.map((item) => (
              <Card key={item.saved_id} className="p-5 shadow-sm border hover:border-navy/30 transition bg-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-navy">{item.title}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {item.job_type || "Full-time"}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-slate-700">{item.company_name}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-saffron" /> {item.location || "Remote / Various"}
                      </span>
                      <span className="flex items-center gap-1">
                        <IndianRupee className="h-3.5 w-3.5 text-india-green" /> {item.salary_range || "As per industry"}
                      </span>
                      <span className="flex items-center gap-1">
                        <GraduationCap className="h-3.5 w-3.5 text-navy" /> {item.qualification_required || "Any Qualification"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 border-t md:border-t-0 pt-3 md:pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive border-destructive/35 hover:bg-destructive/10"
                      disabled={actionId === item.saved_id}
                      onClick={() => handleRemoveSavedJob(item.saved_id, item.job_id)}
                    >
                      {actionId === item.saved_id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <BookmarkX className="h-4 w-4 mr-1" /> Unsave
                        </>
                      )}
                    </Button>

                    <Button
                      size="sm"
                      className="bg-navy hover:bg-navy/90 text-white"
                      onClick={() => handleApply(item.job_id)}
                    >
                      Apply Now <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashShell>
  );
}
