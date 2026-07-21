import { createFileRoute } from "@tanstack/react-router";
import { DashShell, PageHeader } from "@/components/DashShell";
import { candidateNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, MapPin, QrCode, Briefcase, Loader2, CheckCircle2, FileText, Check, Lock, Unlock, Clock, ScanLine, Smartphone } from "lucide-react";
import { getSession } from "@/lib/mockStore";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/candidate/events")({
  head: () => ({ meta: [{ title: "My Events — Candidate" }] }),
  component: Events,
});

// =========================================================
// 1. INLINED APPLY JOB DIALOG (FOR JOBS AT THE EVENT)
// =========================================================
function LiveApplyDialog({ job, onClose }: { job: any; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!job) return; 
    async function fetchRealProfile() {
      setIsLoading(true);
      const session = getSession();
      if (!session || !session.id) { toast.error("Please log in."); onClose(); return; }
      try {
        const res = await fetch(`https://bcc-backend-0cny.onrender.com/api/candidate/profile/${session.id}`);
        const json = await res.json();
        if (json.success) setProfile(json.data);
      } catch (err) {}
      setIsLoading(false);
    }
    fetchRealProfile();
    setStep(1); 
  }, [job]);

  const submitApplication = async () => {
    setIsSubmitting(true);
    const session = getSession();
    try {
      const res = await fetch("http://localhost:5000/api/applications/apply", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id, candidateId: session?.id, employerId: job.employer_id || 1 }),
      });
      const json = await res.json();
      if (json.success) { toast.success("Job Application submitted successfully!"); onClose(); } 
      else { toast.error(json.message); }
    } catch (err) { toast.error("Server connection failed."); }
    finally { setIsSubmitting(false); }
  };

  if (!job) return null;

  return (
    <Dialog open={!!job} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-white p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-slate-50/50">
          <DialogTitle className="text-xl font-display font-bold text-navy flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-saffron" /> Apply for {job.title}
          </DialogTitle>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
            <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {job.company_name}</span>
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>
            {job.stall_no && <span className="flex items-center gap-1 text-saffron font-bold">{job.stall_no}</span>}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-navy"><Loader2 className="h-8 w-8 animate-spin mb-4 text-saffron" /><p>Loading profile details...</p></div>
        ) : (
          <div className="p-6">
            <div className="flex items-center justify-between mb-8 relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-100 -z-10"></div>
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center bg-white px-2">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${step === s ? "border-saffron bg-saffron text-white" : step > s ? "border-india-green bg-india-green text-white" : "border-slate-200 bg-white text-slate-400"}`}>
                    {step > s ? <Check className="h-4 w-4" /> : s}
                  </div>
                </div>
              ))}
            </div>

            {step === 1 && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="text-lg font-bold text-navy">Contact information</h3>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div><Label>Full name</Label><Input disabled value={profile?.fullName || ""} className="mt-1 bg-slate-50 text-navy font-medium" /></div>
                  <div><Label>Email address</Label><Input disabled value={profile?.email || ""} className="mt-1 bg-slate-50 text-navy font-medium" /></div>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="text-lg font-bold text-navy">Resume / CV</h3>
                <div className="border border-border p-4 rounded-xl bg-slate-50 flex items-start gap-4 mt-4">
                  <div className="p-3 bg-white rounded-lg border shadow-sm text-saffron"><FileText className="h-6 w-6" /></div>
                  <div><p className="font-bold text-navy">{profile?.resumeFileName || "Profile_Resume.pdf"}</p></div>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="text-lg font-bold text-navy">Walk-in Screening</h3>
                <div className="bg-india-green/5 border border-india-green/20 p-4 rounded-xl mt-4">
                  <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-india-green" /><span className="text-sm font-medium text-navy">Verified physically present. Employer will receive application instantly.</span></div>
                </div>
              </div>
            )}
            {step === 4 && (
              <div className="space-y-4 animate-in fade-in text-center py-6">
                <h3 className="text-2xl font-display font-bold text-navy">Ready to apply!</h3>
                <p className="text-muted-foreground">Submit your application now and proceed to {job.stall_no}.</p>
              </div>
            )}
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
              {step > 1 ? <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button> : <Button variant="outline" onClick={onClose}>Cancel</Button>}
              {step < 4 ? <Button className="bg-saffron text-navy hover:bg-saffron/90 font-bold px-8" onClick={() => setStep(step + 1)}>Continue</Button> : <Button className="bg-india-green text-white font-bold px-8" disabled={isSubmitting} onClick={submitApplication}>{isSubmitting ? "Submitting..." : "Submit Application"}</Button>}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// =========================================================
// 2. EVENT APPLICATION DIALOG 
// =========================================================
function EventApplyDialog({ event, onClose, onSuccess }: { event: any; onClose: () => void; onSuccess: () => void }) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!event) return;
    async function fetchRealProfile() {
      setIsLoading(true);
      const session = getSession();
      if (session && session.id) {
        try {
          const res = await fetch(`http://localhost:5000/api/candidate/profile/${session.id}`);
          const json = await res.json();
          if (json.success) setProfile(json.data);
        } catch (err) {}
      }
      setIsLoading(false);
    }
    fetchRealProfile();
    setStep(1);
  }, [event]);

  const submitEventApplication = async () => {
    setIsSubmitting(true);
    const session = getSession();
    try {
      const res = await fetch("http://localhost:5000/api/events/apply", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: event.id, candidateId: session?.id })
      });
      const json = await res.json();
      if (json.success) {
        setStep(3); 
        onSuccess(); 
      } else {
        toast.error(json.message);
        onClose();
      }
    } catch (err) { toast.error("Server connection failed."); } 
    finally { setIsSubmitting(false); }
  };

  if (!event) return null;
  const eventTitle = event.title || event.name || "Untitled Event";

  return (
    <Dialog open={!!event} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl bg-white p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-slate-50/50">
          <DialogTitle className="text-xl font-display font-bold text-navy flex items-center gap-2">
            <Calendar className="h-5 w-5 text-saffron" /> Register for {eventTitle}
          </DialogTitle>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-navy"><Loader2 className="h-8 w-8 animate-spin mb-4 text-saffron" /><p>Loading profile details...</p></div>
        ) : (
          <div className="p-6">
            {step < 3 && (
              <div className="flex items-center justify-between mb-8 relative px-10">
                <div className="absolute left-10 top-1/2 -translate-y-1/2 w-[calc(100%-5rem)] h-0.5 bg-slate-100 -z-10"></div>
                {[1, 2].map((s) => (
                  <div key={s} className="flex flex-col items-center bg-white px-2">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${step === s ? "border-saffron bg-saffron text-white" : step > s ? "border-india-green bg-india-green text-white" : "border-slate-200 bg-white text-slate-400"}`}>
                      {step > s ? <Check className="h-4 w-4" /> : s}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="text-lg font-bold text-navy">Review Contact Details</h3>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div><Label>Full name</Label><Input disabled value={profile?.fullName || ""} className="mt-1 bg-slate-50 text-navy font-medium" /></div>
                  <div><Label>Email address</Label><Input disabled value={profile?.email || ""} className="mt-1 bg-slate-50 text-navy font-medium" /></div>
                  <div><Label>Phone number</Label><Input disabled value={profile?.phone || ""} className="mt-1 bg-slate-50 text-navy font-medium" /></div>
                  <div><Label>Location</Label><Input disabled value={`${profile?.district || ""}, ${profile?.state || ""}`} className="mt-1 bg-slate-50 text-navy font-medium" /></div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="text-lg font-bold text-navy">Event Registration Confirmation</h3>
                <div className="bg-india-green/5 border border-india-green/20 p-4 rounded-xl mt-4 space-y-3">
                  <p className="text-sm font-medium text-navy">By registering, your profile will be authorized to access this physical event.</p>
                  <p className="text-sm font-bold text-navy flex items-center gap-2"><MapPin className="h-4 w-4 text-india-green"/> Venue: {event.venue}</p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-in fade-in text-center py-8">
                <div className="mx-auto size-16 rounded-full bg-india-green/10 flex items-center justify-center mb-4"><CheckCircle2 className="h-10 w-10 text-india-green" /></div>
                <h3 className="text-2xl font-display font-bold text-navy">Successfully Registered!</h3>
                <p className="text-muted-foreground mt-2">At the venue gate, scan the Admin's QR code on your phone to mark your attendance and unlock live jobs.</p>
              </div>
            )}

            <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
              {step === 1 ? <Button variant="outline" onClick={onClose}>Cancel</Button> : step === 2 ? <Button variant="outline" onClick={() => setStep(1)}>Back</Button> : <div/>}
              {step === 1 ? (
                <Button className="bg-saffron text-navy hover:bg-saffron/90 font-bold px-8" onClick={() => setStep(2)}>Continue</Button>
              ) : step === 2 ? (
                <Button className="bg-india-green text-white hover:bg-india-green/90 font-bold px-8" disabled={isSubmitting} onClick={submitEventApplication}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null} {isSubmitting ? "Registering..." : "Submit Registration"}
                </Button>
              ) : (
                <Button className="bg-navy text-white hover:bg-navy/90 font-bold px-8 w-full" onClick={onClose}>Close</Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// =========================================================
// 3. NEW: SCAN VENUE ADMIN QR MODAL (OTP FLOW)
// =========================================================
function VenueScanDialog({ event, passId, onSuccess, trigger }: { event: any, passId: string, onSuccess: () => void, trigger: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Reset state when opened
  useEffect(() => { if (isOpen) { setStep(1); setEmail(""); setPhone(""); setOtp(""); } }, [isOpen]);

  const handleVerifyOTP = async () => {
    if (!otp) { toast.error("Please enter the OTP."); return; }
    setIsVerifying(true);
    try {
      // Re-using your working attendance API by passing the passId silently!
      const res = await fetch("http://localhost:5000/api/events/attendance", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ passId })
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Attendance verified! Jobs are now unlocked.");
        setIsOpen(false);
        onSuccess();
      } else { toast.error(json.message); }
    } catch (err) { toast.error("Network error marking attendance."); }
    finally { setIsVerifying(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white p-0 overflow-hidden">
        
        <div className="px-6 py-4 border-b border-border bg-slate-50/50">
          <DialogTitle className="text-xl font-display font-bold text-navy flex items-center gap-2">
            <ScanLine className="h-5 w-5 text-saffron" /> Venue Check-In
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs">Scanning Admin QR for: {event.title || event.name}</DialogDescription>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="text-center animate-in fade-in space-y-6">
              <div className="mx-auto size-32 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 flex items-center justify-center relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-india-green/50 animate-[scan_2s_ease-in-out_infinite]"></div>
                 <ScanLine className="h-12 w-12 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-navy">Point your camera at the Admin's Venue QR Code.</p>
              <Button className="w-full bg-slate-800 text-white" onClick={() => { toast("QR Detected!"); setStep(2); }}>
                 (Simulate) QR Code Scanned
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in slide-in-from-right-4">
              <h3 className="text-lg font-bold text-navy">Verify Identity</h3>
              <div className="space-y-3">
                <div>
                  <Label>I am registering as a</Label>
                  <Select defaultValue="candidate">
                    <SelectTrigger className="mt-1 bg-slate-50"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="candidate">Candidate</SelectItem><SelectItem value="employer">Employer</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Email Address</Label><Input placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 bg-slate-50" /></div>
                <div><Label>Phone Number</Label><Input placeholder="Enter your phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 bg-slate-50" /></div>
              </div>
              <Button className="w-full bg-saffron text-navy hover:bg-saffron/90 font-bold mt-4" onClick={() => { if(!email || !phone) toast.error("Fill all fields"); else setStep(3); }}>
                Get OTP
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 text-center">
              <div className="mx-auto size-12 bg-saffron/10 text-saffron rounded-full flex items-center justify-center mb-4"><Smartphone className="h-6 w-6"/></div>
              <h3 className="text-lg font-bold text-navy">Enter Verification Code</h3>
              <p className="text-xs text-muted-foreground">An OTP has been sent to your email and phone number.</p>
              <div className="pt-2 pb-4">
                <Input placeholder="Enter 4-digit OTP (e.g., 1234)" className="text-center tracking-widest font-mono text-lg py-6 bg-slate-50" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} />
              </div>
              <Button className="w-full bg-india-green text-white hover:bg-india-green/90 font-bold" disabled={isVerifying} onClick={handleVerifyOTP}>
                {isVerifying ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Mark as Attended
              </Button>
              <Button variant="ghost" className="w-full mt-2 text-xs text-muted-foreground" onClick={() => setStep(2)}>Back</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// =========================================================
// 4. THE MAIN EVENTS PAGE
// =========================================================
function Events() {
  const user = typeof window !== "undefined" ? getSession() : null;
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [viewingEvent, setViewingEvent] = useState<any | null>(null);
  const [eventJobs, setEventJobs] = useState<any[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [applyingJob, setApplyingJob] = useState<any | null>(null);
  const [applyingEvent, setApplyingEvent] = useState<any | null>(null);

  const fetchEvents = async () => {
    if (!user || !user.id) return;
    try {
      const res = await fetch(`http://localhost:5000/api/candidate/${user.id}/events`);
      const json = await res.json();
      if (json.success) setEvents(json.data);
    } catch (err) {} 
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleViewJobs = async (e: any) => {
    setViewingEvent(e);
    setIsLoadingJobs(true);
    try {
      const res = await fetch(`http://localhost:5000/api/events/${e.id}/jobs`);
      const json = await res.json();
      if (json.success) setEventJobs(json.data);
    } catch (err) {} 
    finally { setIsLoadingJobs(false); }
  };

  return (
    <DashShell role="candidate" nav={candidateNav}>
      <PageHeader title="My Events" description="Register for events, scan the Admin QR at the venue, and unlock walk-in jobs." />
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-saffron mb-2" /><p className="text-navy font-medium">Loading events...</p></div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground border rounded-xl bg-white"><p className="text-lg font-medium text-navy">No events available right now.</p></div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {events.map((e) => {
            const isRegistered = !!e.entry_pass_id;
            const isAttended = e.attendance_status === 'Attended';
            const isHold = e.status === 'Hold';

            const eventTitle = e.title || e.name || e.event_name || "Untitled Event";
            const eventDate = e.event_date || e.date || e.start_date || new Date();
            const eventVenue = e.venue || e.location || "Venue TBA";
            const startTime = e.start_time || "09:00 AM";
            const endTime = e.end_time || "05:00 PM";

            return (
              <Card key={e.id} className="p-6 border-border/60 bg-white shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-display font-bold text-navy text-lg">{eventTitle}</h3>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {new Date(eventDate).toLocaleDateString("en-IN", { dateStyle: "long" })}</span>
                        <span className="inline-flex items-center gap-1.5 border-l pl-2 border-border"><Clock className="h-3.5 w-3.5" /> {startTime} - {endTime}</span>
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1"><MapPin className="h-4 w-4" />{eventVenue}</p>
                    </div>
                    <Badge className={e.status === 'Live' ? "bg-india-green text-white" : e.status === 'Hold' ? "bg-red-500 text-white" : "bg-saffron text-navy"}>{e.status}</Badge>
                  </div>

                  {isRegistered ? (
                    isAttended ? (
                      <div className="mt-4 rounded-xl border border-india-green/40 bg-india-green/5 p-4 text-center">
                        <div className="mx-auto size-10 rounded-full bg-india-green/20 flex items-center justify-center mb-2">
                          <CheckCircle2 className="h-5 w-5 text-india-green" />
                        </div>
                        <p className="text-sm font-bold text-navy mb-1">Attendance Verified</p>
                        <p className="text-xs text-muted-foreground">You have successfully checked in to this physical event.</p>
                      </div>
                    ) : (
                      <div className="mt-4 rounded-xl border border-saffron/40 bg-saffron/5 p-4 text-center">
                        <p className="text-sm font-bold text-navy mb-1">Registration Confirmed</p>
                        <p className="text-xs text-muted-foreground mb-4">Scan the Admin's QR code at the venue entrance to mark your attendance.</p>
                        <VenueScanDialog event={e} passId={e.entry_pass_id} onSuccess={fetchEvents} trigger={<Button className="w-full bg-slate-800 text-white hover:bg-slate-900 shadow-sm"><ScanLine className="h-4 w-4 mr-2" /> Scan Admin QR Code</Button>} />
                      </div>
                    )
                  ) : (
                    <div className="mt-4 p-4 rounded-xl bg-slate-50 border text-center">
                      <p className="text-sm text-navy font-medium mb-3">You are not registered for this event yet.</p>
                      {isHold ? (
                        <Button disabled className="w-full bg-slate-200 text-slate-500">Event on Hold - Wait for Confirmation</Button>
                      ) : (
                        <Button onClick={() => setApplyingEvent(e)} className="w-full bg-saffron text-navy hover:bg-saffron/90 font-bold">Apply for this Event (Free)</Button>
                      )}
                    </div>
                  )}
                </div>

                {isRegistered && (
                  <div className="mt-6">
                    {isAttended ? (
                      <Button onClick={() => handleViewJobs(e)} className="w-full bg-navy text-white hover:bg-navy/90 shadow-sm"><Unlock className="h-4 w-4 mr-2" /> View Jobs at this Event</Button>
                    ) : (
                      <Button disabled className="w-full bg-slate-100 text-slate-400 border border-slate-200"><Lock className="h-4 w-4 mr-2" /> Unlock event jobs</Button>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!viewingEvent} onOpenChange={(o) => !o && setViewingEvent(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-saffron" /> Jobs at {viewingEvent?.title || viewingEvent?.name}</DialogTitle>
            <DialogDescription>These roles are exclusive to this event. Apply directly here to walk-in.</DialogDescription>
          </DialogHeader>
          {isLoadingJobs ? (
            <div className="py-10 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-saffron" /></div>
          ) : eventJobs.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground"><Briefcase className="h-10 w-10 mx-auto mb-3 opacity-40" />No jobs posted for this event yet.</div>
          ) : (
            <div className="space-y-3 mt-2">
              {eventJobs.map((j) => (
                <Card key={j.id} className="p-4 border-border/60 bg-slate-50">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-display font-bold text-navy">{j.title}</h4>
                        <Badge variant="outline" className="bg-white">{j.job_type}</Badge>
                        {j.stall_no && <Badge className="bg-saffron/15 text-saffron font-bold">{j.stall_no}</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 font-medium">{j.company_name} · {j.location}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">{(j.skills_required || []).map((s: string) => <span key={s} className="text-[11px] bg-white border px-2 py-0.5 rounded text-navy">{s}</span>)}</div>
                      <p className="text-xs text-muted-foreground mt-2">{j.qualification_required} · {j.experience_required} · {j.salary_range}</p>
                    </div>
                    <Button size="sm" onClick={() => setApplyingJob(j)} className="bg-navy text-white hover:bg-navy/90 shrink-0">Apply</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <LiveApplyDialog job={applyingJob} onClose={() => setApplyingJob(null)} />
      <EventApplyDialog event={applyingEvent} onClose={() => setApplyingEvent(null)} onSuccess={fetchEvents} />
    </DashShell>
  );
}
