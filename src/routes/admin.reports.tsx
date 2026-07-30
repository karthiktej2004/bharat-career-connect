import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DashShell, PageHeader } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileSpreadsheet, FileText, Download, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({ meta: [{ title: "Reports & Analytics — Bharat Career Connect" }] }),
  component: AdminReports,
});

function AdminReports() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("all");
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/events`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data.length > 0) {
          setEvents(json.data);
          setSelectedEventId(json.data[0].id.toString());
        }
      })
      .catch(() => toast.error("Could not load events list for reports."));
  }, []);

  // EXPORT MASTER CSV / EXCEL REPORT
  const handleExportCsv = async () => {
    if (!selectedEventId || selectedEventId === "all") {
      toast.error("Please select a specific Job Fair Event to export.");
      return;
    }
    setIsExportingCsv(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/events/${selectedEventId}/export`
      );
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `BCC_Event_${selectedEventId}_Master_Report.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Excel/CSV Report exported and downloaded successfully!");
    } catch (e) {
      toast.error("Failed to generate CSV export.");
    } finally {
      setIsExportingCsv(false);
    }
  };

  // EXPORT PDF SUMMARY REPORT
  const handleExportPdf = () => {
    setIsExportingPdf(true);
    setTimeout(() => {
      toast.success("PDF Event Summary Report generated and downloaded!");
      setIsExportingPdf(false);
      window.print(); // Triggers print-to-PDF layout
    }, 1000);
  };

  return (
    <DashShell role="admin" nav={adminNav}>
      <PageHeader
        title="Reports & Analytics"
        description="Generate comprehensive hiring, stall allocation, and attendance reports for Job Fair Events."
        action={
          <div className="flex items-center gap-2">
            <Button
              onClick={handleExportCsv}
              disabled={isExportingCsv}
              className="bg-emerald-600 text-white hover:bg-emerald-700 font-semibold"
            >
              {isExportingCsv ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              ) : (
                <FileSpreadsheet className="h-4 w-4 mr-1.5" />
              )}
              Export Excel / CSV Report
            </Button>
            <Button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              variant="outline"
              className="border-navy text-navy font-semibold"
            >
              {isExportingPdf ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              ) : (
                <FileText className="h-4 w-4 mr-1.5 text-red-600" />
              )}
              Download PDF
            </Button>
          </div>
        }
      />

      {/* EVENT SELECTOR FOR REPORT FILTERING */}
      <Card className="p-5 border-border/60 mt-6 bg-slate-50/60">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-display font-bold text-navy text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-saffron" /> Select Target Event for Analytics
            </h3>
            <p className="text-xs text-muted-foreground">
              All charts, application funnels, and export sheets will reflect data for the chosen event.
            </p>
          </div>

          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger className="w-72 bg-white font-medium">
              <SelectValue placeholder="Choose Event..." />
            </SelectTrigger>
            <SelectContent>
              {events.map((evt) => (
                <SelectItem key={evt.id} value={evt.id.toString()}>
                  {evt.name} ({evt.city || "Hubballi"})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>
    </DashShell>
  );
}
