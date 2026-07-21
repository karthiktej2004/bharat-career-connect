import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScanLine, Camera, CheckCircle2 } from "lucide-react";
import { markStallAttendance, type StallApplication } from "@/lib/mockStore";
import { toast } from "sonner";

export function AttendanceScanDialog({ application, open, onOpenChange, onSuccess }: {
  application: StallApplication | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSuccess?: () => void;
}) {
  const [code, setCode] = useState("");

  function submit(codeToUse?: string) {
    if (!application) return;
    const c = (codeToUse ?? code).trim();
    if (!c) { toast.error("Enter or scan the event code"); return; }
    const res = markStallAttendance(application.id, c);
    if (!res.ok) { toast.error(res.reason ?? "Could not verify code"); return; }
    toast.success("Attendance marked ✓ Your event workspace is now unlocked");
    setCode("");
    onSuccess?.();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><ScanLine className="h-5 w-5 text-india-green" /> Mark attendance</DialogTitle>
          <DialogDescription>Scan the admin's event QR at the gate, or enter the 6-digit code shown on the scanner.</DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border-2 border-dashed border-india-green/40 bg-india-green/5 p-6 text-center">
          <Camera className="h-10 w-10 mx-auto text-india-green/70 mb-2" />
          <p className="text-xs text-muted-foreground mb-3">Camera preview (demo) — point at the admin QR</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => application?.attendanceCode && submit(application.attendanceCode)}
          >
            <CheckCircle2 className="h-4 w-4 mr-1" /> Simulate successful scan
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Or enter code manually</p>
          <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. HUB-9241" className="font-mono" />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-india-green text-white hover:bg-india-green/90" onClick={() => submit()}>Verify & mark attendance</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
