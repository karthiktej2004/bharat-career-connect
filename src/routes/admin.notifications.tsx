import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DashShell, PageHeader } from "@/components/DashShell";
import { adminNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Mail, Smartphone, BellRing, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Admin" }] }),
  component: Notifications,
});

function Notifications() {
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  
  // Form State
  const [channels, setChannels] = useState({ portal: true, sms: false, email: false });
  const [audience, setAudience] = useState("all_candidates");
  const [specificUserId, setSpecificUserId] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // Data State for Specific Selection
  const [candidates, setCandidates] = useState<any[]>([]);
  const [employers, setEmployers] = useState<any[]>([]);

  useEffect(() => {
    // Fetch users for the dropdowns
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users-list`)
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setCandidates(json.data.candidates);
          setEmployers(json.data.employers);
        }
      })
      .catch(() => toast.error("Failed to load user lists"))
      .finally(() => setFetchingUsers(false));
  }, []);

  const handleToggleChannel = (channel: 'portal' | 'sms' | 'email') => {
    setChannels(prev => ({ ...prev, [channel]: !prev[channel] }));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!channels.portal && !channels.sms && !channels.email) return toast.error("Select at least one delivery channel.");
    if (!subject.trim()) return toast.error("Subject is required.");
    if (!message.trim()) return toast.error("Message is required.");
    if (audience.includes('specific') && !specificUserId) return toast.error("Please select a specific user.");

    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/notifications/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channels: Object.keys(channels).filter(k => channels[k as keyof typeof channels]),
          audience,
          specificUserId: audience.includes('specific') ? specificUserId : null,
          subject,
          message
        })
      });

      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        setSubject("");
        setMessage("");
        setSpecificUserId("");
      } else {
        toast.error(json.message || "Failed to send broadcast.");
      }
    } catch (err) {
      toast.error("Network error while sending broadcast.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashShell role="admin" nav={adminNav}>
      <PageHeader 
        title="Notifications & Communication" 
        description="Broadcast targeted messages to candidates, employers, and exhibitors." 
      />
      
      <div className="max-w-3xl mx-auto mt-6">
        <Card className="p-6 border-border/60">
          <h2 className="font-display font-bold text-navy mb-6 text-lg">Compose Message</h2>
          
          <form onSubmit={handleSend} className="space-y-6">
            
            {/* CHANNELS */}
            <div className="space-y-2">
                <Label>Delivery Channels</Label>
                <div className="flex flex-wrap gap-6 p-4 rounded-lg border border-border/60 bg-slate-50">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <Checkbox checked={channels.portal} onCheckedChange={() => handleToggleChannel('portal')} />
                    <BellRing className="h-4 w-4 text-india-green" /> In-App Portal
                </label>
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer text-muted-foreground">
                    <Checkbox checked={channels.sms} onCheckedChange={() => handleToggleChannel('sms')} />
                    <Smartphone className="h-4 w-4" /> SMS (Queue)
                </label>
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer text-muted-foreground">
                    <Checkbox checked={channels.email} onCheckedChange={() => handleToggleChannel('email')} />
                    <Mail className="h-4 w-4" /> Email (Queue)
                </label>
                </div>
            </div>

            {/* AUDIENCE SELECTOR */}
            <div className="space-y-4">
                <div>
                    <Label>Target Audience</Label>
                    <Select value={audience} onValueChange={(val) => { setAudience(val); setSpecificUserId(""); }}>
                        <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select target audience" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all_candidates">All Registered Candidates</SelectItem>
                            <SelectItem value="all_employers">All Registered Employers</SelectItem>
                            <SelectItem value="all_exhibitors">All Exhibitors</SelectItem>
                            <SelectItem value="specific_candidate">Specific Candidate</SelectItem>
                            <SelectItem value="specific_employer">Specific Employer</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* DYNAMIC SPECIFIC USER SELECTOR */}
                {audience === "specific_candidate" && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                        <Label>Select Candidate</Label>
                        <Select value={specificUserId} onValueChange={setSpecificUserId} disabled={fetchingUsers}>
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder={fetchingUsers ? "Loading candidates..." : "Search candidate by name..."} />
                            </SelectTrigger>
                            <SelectContent>
                                {candidates.map(c => (
                                    <SelectItem key={c.id} value={c.id.toString()}>{c.name} ({c.id})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {audience === "specific_employer" && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                        <Label>Select Employer</Label>
                        <Select value={specificUserId} onValueChange={setSpecificUserId} disabled={fetchingUsers}>
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder={fetchingUsers ? "Loading employers..." : "Search employer by company name..."} />
                            </SelectTrigger>
                            <SelectContent>
                                {employers.map(e => (
                                    <SelectItem key={e.id} value={e.id.toString()}>{e.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            {/* MESSAGE CONTENT */}
            <div>
                <Label>Subject</Label>
                <Input 
                    className="mt-1" 
                    placeholder="e.g., Important Update for Job Fair" 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                />
            </div>
            <div>
                <Label>Message</Label>
                <Textarea 
                    rows={6} 
                    className="mt-1 resize-none" 
                    placeholder="Type your message here..." 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-saffron text-navy hover:bg-saffron/90 h-11 text-base">
                {loading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Send className="h-5 w-5 mr-2" />}
                Send Broadcast
            </Button>
          </form>
        </Card>
      </div>
    </DashShell>
  );
}
