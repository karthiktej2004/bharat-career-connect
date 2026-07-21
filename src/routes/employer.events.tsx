import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { DashShell, PageHeader } from "@/components/DashShell";
import { employerNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar as CalIcon, Users, QrCode, Store, AlertTriangle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSession } from "@/lib/mockStore";
import { toast } from "sonner";

export const Route = createFileRoute("/employer/events")({
  head: () => ({ meta: [{ title: "Job Fairs — Bharat Career Connect" }] }),
  component: JobFairsPage,
});

function JobFairsPage() {
  return (
    <DashShell role="employer" nav={employerNav}>
      <JobFairsBody />
    </DashShell>
  );
}

export function JobFairsBody() {
  const user = getSession();
  const employerId = user?.id;

  const [events, setEvents] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Booking Dialog State
  const [bookingEvent, setBookingEvent] = useState<any | null>(null);
  const [roles, setRoles] = useState("");
  const [vacancies, setVacancies] = useState("5");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // QR Scanner State
  const [scanningEvent, setScanningEvent] = useState<any | null>(null);
  const [qrCode, setQrCode] = useState("");

  const fetchData = useCallback(async () => {
    if (!employerId) return;
    setIsLoading(true);
    try {
      const [eventsRes, appsRes] = await Promise.all([
        fetch(`https://bcc-backend-0cny.onrender.com/api/employer/events`),
        fetch(`https://bcc-backend-0cny.onrender.com/api/employer/${employerId}/applications`)
      ]);
      const eventsJson = await eventsRes.json();
      const appsJson = await appsRes.json();
      
      if (eventsJson.success) setEvents(eventsJson.data);
      if (appsJson.success) setApplications(appsJson.data);
    } catch (error) {
      toast.error("Failed to load events.");
    } finally {
      setIsLoading(false);
    }
  }, [employerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ====================================================================
  // RAZORPAY MOCK INTEGRATION
  // ====================================================================
  const handlePaymentAndBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roles || !vacancies) return toast.error("Please fill all details");
    
    setIsProcessingPayment(true);
    
    // MOCK RAZORPAY DELAY (Replace this with real Razorpay window later)
    setTimeout(async () => {
      const mockPaymentId = `pay_${Math.random().toString(36).substr(2, 9)}`;
      
      try {
        const res = await fetch("https://bcc-backend-0cny.onrender.com/api/employer/apply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employerId,
            eventId: bookingEvent.id,
            rolesToHire: roles,
            candidatesNeeded: vacancies,
            paymentId: mockPaymentId
          })
        });

        const json = await res.json();
        if (json.success) {
          toast.success("Payment Successful! Stall booked and pending admin approval.");
          setBookingEvent(null);
          fetchData(); 
        } else {
          toast.error("Booking failed on server.");
        }
      } catch (error) {
        toast.error("Server connection failed.");
      } finally {
        setIsProcessingPayment(false);
      }
    }, 1500); 
  };

  // ====================================================================
  // QR ATTENDANCE
  // ====================================================================
  const handleMarkAttendance = async () => {
    if (!qrCode) return toast.error("Enter the QR Code from the gate.");
    try {
      const res = await fetch("https://bcc-backend-0cny.onrender.com/api/employer/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employerId, qrString: qrCode })
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        setScanningEvent(null);
        setQrCode("");
      } else {
        toast.error(json.message);
      }
    } catch (error) {
      toast.error("Failed to mark attendance.");
    }
  };

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-saffron" /></div>;
  }

  return (
    <>
      <PageHeader
        title="Job Fair Participation"
        description="Apply for a stall, wait for admin approval, mark attendance at the venue, then open your event workspace."
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {events.map((event) => {
          const application = applications.find(a => a.event_id === event.id);
          const isHold = event.status === 'hold';

          return (
            <Card key={event.id} className="overflow-hidden border-border/60 flex flex-col">
              {/* TOP HEADER: Dark Blue Gradient */}
              <div className="h-32 bg-gradient-to-b from-navy to-navy/70 relative p-4 flex flex-col items-center justify-center text-white/20">
                <Store className="h-12 w-12" />
                <div className="absolute top-4 right-4 flex gap-2">
                  <Badge className="bg-white text-navy font-bold">{event.event_type || 'PHYSICAL'}</Badge>
                </div>
                {/* Status Badges for Applied Events */}
                {application && application.status === 'pending' && (
                  <div className="absolute top-4 left-4"><Badge className="bg-saffron text-navy font-bold">Pending Approval</Badge></div>
                )}
                {application && application.status === 'approved' && (
                  <div className="absolute top-4 left-4"><Badge className="bg-saffron text-navy font-bold">Stall Approved</Badge></div>
                )}
                {application && application.status === 'rejected' && (
                  <div className="absolute top-4 left-4"><Badge className="bg-red-500 text-white font-bold">Application Rejected</Badge></div>
                )}
              </div>

              {/* BOTTOM CONTENT */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-display font-bold text-navy text-xl mb-3">{event.name}</h3>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CalIcon className="h-4 w-4 mr-2" />
                    {new Date(event.event_date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    {event.venue_address || event.city || "Venue TBD"}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-2" />
                    {event.employer_capacity} total stalls capacity
                  </div>
                </div>

                <div className="mt-auto">
                  {/* STATE 1: NOT APPLIED YET */}
                  {!application && !isHold && (
                    <Button className="w-full bg-saffron text-navy hover:bg-saffron/90 font-bold" onClick={() => setBookingEvent(event)}>
                      <Store className="h-4 w-4 mr-2" /> Book Stall — ₹{event.stall_price || "0.00"}
                    </Button>
                  )}

                  {!application && isHold && (
                    <Button disabled className="w-full bg-muted text-muted-foreground font-bold">
                      Registrations Temporarily Paused
                    </Button>
                  )}

                  {/* STATE 2: ALREADY APPLIED & EVENT ON HOLD (The Refund Warning) */}
                  {application && isHold && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-xs flex items-start gap-2 mb-4">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <p><b>Event on hold.</b> Please wait until confirmation. If the event is cancelled by the admin, your amount will be refunded entirely.</p>
                    </div>
                  )}

                  {/* STATE 3: APPROVED STALL UI */}
                  {application && application.status === 'approved' && !isHold && (
                    <div className="space-y-4">
                      <div className="bg-india-green/10 border border-india-green/20 rounded-md p-3 grid grid-cols-2 text-center">
                        <div className="border-r border-india-green/20">
                          <p className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">Allocated Stall</p>
                          <p className="font-display font-bold text-navy text-lg">{application.stallNo || "TBD"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">Hall / Block</p>
                          <p className="font-display font-bold text-india-green text-lg">{application.hall || "TBD"}</p>
                        </div>
                      </div>

                      {event.google_maps_link && (
                        <Button variant="outline" className="w-full" onClick={() => window.open(event.google_maps_link, '_blank')}>
                          <MapPin className="h-4 w-4 mr-2" /> View Map
                        </Button>
                      )}

                      <div className="bg-orange-50 border border-orange-200 p-3 rounded-md text-xs flex items-start gap-2 text-orange-800">
                        <QrCode className="h-5 w-5 shrink-0 mt-0.5 text-orange-600" />
                        <p>At the venue gate, scan the Event QR on your phone. Once marked present by the admin team, this card unlocks your live Candidate Interviews workspace.</p>
                      </div>

                      <Button className="w-full bg-navy text-white hover:bg-navy/90" onClick={() => setScanningEvent(event)}>
                        <QrCode className="h-4 w-4 mr-2" /> Mark Attendance
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* RAZORPAY / BOOKING DIALOG */}
      <Dialog open={!!bookingEvent} onOpenChange={(open) => !open && setBookingEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Stall — {bookingEvent?.name}</DialogTitle>
            <DialogDescription>Please provide your hiring requirements to complete your registration.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePaymentAndBook} className="space-y-4">
            <div>
              <Label>Roles Hiring For</Label>
              <Input required value={roles} onChange={(e) => setRoles(e.target.value)} placeholder="e.g. Software Engineer, Sales Exec" className="mt-1" />
            </div>
            <div>
              <Label>Approx. Vacancies</Label>
              <Input type="number" required min="1" value={vacancies} onChange={(e) => setVacancies(e.target.value)} className="mt-1" />
            </div>

            <div className="bg-muted p-3 rounded-md mt-4">
              <div className="flex justify-between text-sm font-bold text-navy">
                <span>Total Amount:</span>
                <span>₹{bookingEvent?.stall_price || "0.00"}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Payment powered securely by Razorpay.</p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setBookingEvent(null)} disabled={isProcessingPayment}>Cancel</Button>
              <Button type="submit" disabled={isProcessingPayment} className="bg-saffron text-navy hover:bg-saffron/90">
                {isProcessingPayment ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing Razorpay...</> : `Pay ₹${bookingEvent?.stall_price || "0.00"} & Book`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* QR ATTENDANCE DIALOG */}
      <Dialog open={!!scanningEvent} onOpenChange={(open) => !open && setScanningEvent(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Mark Attendance</DialogTitle>
            <DialogDescription>Ask the admin at the gate for the Event QR code string to unlock your workspace.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Gate QR String</Label>
              <Input value={qrCode} onChange={(e) => setQrCode(e.target.value)} placeholder="e.g. GATE_1A2B3C" className="mt-1 font-mono uppercase" />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setScanningEvent(null)}>Cancel</Button>
            <Button onClick={handleMarkAttendance} className="bg-india-green text-white">Unlock Workspace</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
