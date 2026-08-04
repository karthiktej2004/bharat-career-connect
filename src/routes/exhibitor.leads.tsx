import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DashShell, PageHeader, StatCard } from "@/components/DashShell";
import { exhibitorNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { getSession } from "@/lib/mockStore";
import { QrCode, Search, Download, Filter, Flame, ThermometerSun, Snowflake, Edit3, Loader2, Users } from "lucide-react";

export const Route = createFileRoute("/exhibitor/leads")({
  head: () => ({ meta: [{ title: "Visitor Leads — Exhibitor Panel" }] }),
  component: ExhibitorLeads,
});

function ExhibitorLeads() {
  const user = getSession();
  const [leads, setLeads] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  // Modals
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  
  // Actions State
  const [scanEventId, setScanEventId] = useState("");
  const [scanCandidateId, setScanCandidateId] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  
  const [editLead, setEditLead] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.id) fetchData();
  }, [user?.id]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [leadsRes, eventsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/exhibitor/${user?.id}/leads`),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/exhibitor/${user?.id}/approved-events`)
      ]);
      
      const leadsJson = await leadsRes.json();
      const eventsJson = await eventsRes.json();
      
      if (leadsJson.success) setLeads(leadsJson.data);
      if (eventsJson.success) {
        setEvents(eventsJson.data);
        if (eventsJson.data.length > 0) setScanEventId(eventsJson.data[0].id.toString());
      }
    } catch (error) {
      toast.error("Failed to fetch leads.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleScan = async () => {
    if (!scanEventId || !scanCandidateId) return toast.error("Event and Candidate ID required.");
    setIsScanning(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/exhibitor/${user?.id}/leads/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: scanEventId, candidate_id: scanCandidateId })
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        setLeads([json.data, ...leads]);
        setScanCandidateId("");
        setScanModalOpen(false);
      } else {
        toast.error(json.message);
      }
    } catch (error) {
      toast.error("Error capturing lead.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleUpdateLead = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/exhibitor/leads/${editLead.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_status: editLead.lead_status, notes: editLead.notes })
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Lead updated.");
        setLeads(leads.map(l => l.id === editLead.id ? { ...l, lead_status: editLead.lead_status, notes: editLead.notes } : l));
        setEditModalOpen(false);
      }
    } catch (error) {
      toast.error("Failed to update lead.");
    } finally {
      setIsSaving(false);
    }
  };

  // CSV Export Function for Marketers
  const exportToCSV = () => {
    if (filteredLeads.length === 0) return toast.error("No data to export.");
    const headers = ["Candidate ID,Name,Email,Phone,Skills,Event,Status,Notes,Scanned At"];
    const rows = filteredLeads.map(l => 
      `"${l.candidate_id}","${l.candidate_name}","${l.candidate_email}","${l.candidate_phone}","${l.candidate_skills}","${l.event_name}","${l.lead_status}","${l.notes || ''}","${new Date(l.scanned_at).toLocaleString()}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BCC_Leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Export downloaded.");
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.candidate_name.toLowerCase().includes(search.toLowerCase()) || l.candidate_skills?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || l.lead_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Hot': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><Flame className="h-3 w-3 mr-1" /> Hot Lead</Badge>;
      case 'Warm': return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100"><ThermometerSun className="h-3 w-3 mr-1" /> Warm Lead</Badge>;
      case 'Cold': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100"><Snowflake className="h-3 w-3 mr-1" /> Cold Lead</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashShell role="exhibitor" nav={exhibitorNav}>
      <PageHeader 
        title="Visitor Leads CRM" 
        description="Capture, categorize, and export candidate profiles scanned at your physical or virtual stalls." 
        action={
          <div className="flex gap-3">
            <Button variant="outline" onClick={exportToCSV} className="border-purple-200 text-purple-700 hover:bg-purple-50">
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </Button>
            <Button onClick={() => setScanModalOpen(true)} className="bg-purple-600 text-white hover:bg-purple-700 shadow-sm">
              <QrCode className="h-4 w-4 mr-2" /> Capture Lead
            </Button>
          </div>
        }
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Leads Captured" value={leads.length} icon={Users} accent="purple" />
        <StatCard label="Hot Leads" value={leads.filter(l => l.lead_status === 'Hot').length} icon={Flame} accent="saffron" />
        <StatCard label="Active Events" value={events.length} icon={QrCode} accent="india-green" />
      </div>

      <Card className="border-border/60">
        <div className="p-4 border-b border-border/60 bg-muted/20 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name or skills..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-white" />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Hot">Hot Leads</SelectItem>
                <SelectItem value="Warm">Warm Leads</SelectItem>
                <SelectItem value="Cold">Cold Leads</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-muted/10 hover:bg-muted/10">
              <TableHead className="font-bold text-navy">Candidate Details</TableHead>
              <TableHead className="font-bold text-navy">Skills / Profile</TableHead>
              <TableHead className="font-bold text-navy">Event Met At</TableHead>
              <TableHead className="font-bold text-navy">Lead Status</TableHead>
              <TableHead className="font-bold text-navy text-right">Notes & Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin text-purple-600 mx-auto" /></TableCell></TableRow>
            ) : filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <QrCode className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <h3 className="font-medium text-navy">No leads found</h3>
                  <p className="text-sm text-muted-foreground">Scan candidate badges at the event to capture their details here.</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>
                    <p className="font-semibold text-navy">{l.candidate_name}</p>
                    <p className="text-xs text-muted-foreground">{l.candidate_email}</p>
                    <p className="text-xs text-muted-foreground">{l.candidate_phone}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {l.candidate_skills?.split(',').map((skill: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-[10px] bg-slate-100 text-slate-600">{skill.trim()}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{l.event_name}</TableCell>
                  <TableCell>{getStatusBadge(l.lead_status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => { setEditLead(l); setEditModalOpen(true); }} className="text-purple-600 hover:bg-purple-50">
                      <Edit3 className="h-4 w-4 mr-2" /> Edit Notes
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* MANUAL QR SCANNER MODAL */}
      <Dialog open={scanModalOpen} onOpenChange={setScanModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-navy flex items-center gap-2"><QrCode className="h-5 w-5 text-purple-600" /> Capture Candidate Lead</DialogTitle>
            <DialogDescription>In a physical event, this would open your camera. For now, enter the candidate's ID manually.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Select Active Event</Label>
              <Select value={scanEventId} onValueChange={setScanEventId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select an event" /></SelectTrigger>
                <SelectContent>
                  {events.map(ev => <SelectItem key={ev.id} value={ev.id.toString()}>{ev.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Candidate ID (Simulated QR Data)</Label>
              <Input value={scanCandidateId} onChange={(e) => setScanCandidateId(e.target.value)} placeholder="e.g. BCC-UMP-CAN-123456" className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScanModalOpen(false)}>Cancel</Button>
            <Button onClick={handleScan} disabled={isScanning} className="bg-purple-600 text-white hover:bg-purple-700">
              {isScanning ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Capture Lead Data"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT LEAD MODAL */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-navy">Update Lead Details</DialogTitle>
          </DialogHeader>
          {editLead && (
            <div className="space-y-4 py-2">
              <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                <p className="font-semibold text-navy">{editLead.candidate_name}</p>
                <p className="text-xs text-muted-foreground">{editLead.candidate_email} • {editLead.candidate_phone}</p>
              </div>
              <div>
                <Label>Lead Qualification Status</Label>
                <Select value={editLead.lead_status} onValueChange={(val) => setEditLead({...editLead, lead_status: val})}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hot">Hot (Ready to Hire / Perfect Fit)</SelectItem>
                    <SelectItem value="Warm">Warm (Good Fit / Keep in pipeline)</SelectItem>
                    <SelectItem value="Cold">Cold (Not a fit / No further action)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Recruiter Notes</Label>
                <Textarea 
                  rows={4} 
                  value={editLead.notes || ""} 
                  onChange={(e) => setEditLead({...editLead, notes: e.target.value})} 
                  placeholder="Add internal notes about this candidate..." 
                  className="mt-1"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateLead} disabled={isSaving} className="bg-purple-600 text-white hover:bg-purple-700">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Save Updates"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </DashShell>
  );
}
