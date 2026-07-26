import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScanLine, Camera, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
// Keeping the type import if you still use it elsewhere, but removing the mock function
import type { StallApplication } from "@/lib/mockStore"; 

export function AttendanceScanDialog({ application, open, onOpenChange, onSuccess }: {
  application: any | null; // Changed to 'any' to ensure eventId/employerId access doesn't throw strict type errors
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSuccess?: () => void;
}) {
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(codeToUse?: string) {
    if (!application) return;
    const c = (codeToUse ?? code).trim();
    
    if (!c) { 
      toast.error("Enter or scan the event code"); 
      return; 
    }
    
    setIsSubmitting(true);
    
    try {
      // 1. Bulletproof LocalStorage Check (looks for "user" or "auth_user")
      const authData = localStorage.getItem("user") || localStorage.getItem("auth_user") || "{}";
      const authUser = JSON.parse(authData);
      
      const role = authUser.role === "employer" ? "employer" : "candidate";
      const userId = authUser.id || authUser.unique_id || authUser.uniqueId;

      // 2. Extract Event ID
      const eventId = application.event_id || application.eventId || application.id;

      if (!eventId || !userId) {
        toast.error("Missing Event or User ID. Please log out and log back in.");
        setIsSubmitting(false);
        return;
      }

      // 3. Send Request
      const res = await fetch('https://bcc-backend-0cny.onrender.com/api/events/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: eventId,
          userId: userId,
          userType: role,
          code: c
        })
      });
      
      const json = await res.json();
      
      if (json.success) {
        toast.success("Attendance marked ✓ Your event workspace is now unlocked");
        setCode("");
        if (onSuccess) onSuccess(); 
        onOpenChange(false);
      } else {
        toast.error(json.message || "Could not verify code");
      }
    } catch (error) {
      toast.error("Network communication failure.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><ScanLine className="h-5 w-5 text-india-green" /> Mark attendance</DialogTitle>
          <DialogDescription>Scan the admin's event QR at the gate, or enter the 4-digit code shown on the scanner.</DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border-2 border-dashed border-india-green/40 bg-india-green/5 p-6 text-center">
          <Camera className="h-10 w-10 mx-auto text-india-green/70 mb-2" />
          <p className="text-xs text-muted-foreground mb-3">Camera preview (demo) — point at the admin QR</p>
          <Button
            size="sm"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => submit("1234")} // Hardcoded test OTP matching backend
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-1" />} 
            Simulate successful scan
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Or enter code manually</p>
          <Input 
            value={code} 
            onChange={(e) => setCode(e.target.value)} 
            placeholder="e.g. 1234" 
            className="font-mono" 
            disabled={isSubmitting} 
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
          <Button className="bg-india-green text-white hover:bg-india-green/90" onClick={() => submit()} disabled={isSubmitting}>
            {isSubmitting ? "Verifying..." : "Verify & mark attendance"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
