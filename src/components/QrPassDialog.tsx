import { useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { Download, ShieldCheck } from "lucide-react";
import { TricolorBar } from "./Brand";

interface Props {
  passId: string;
  eventTitle: string;
  eventDate?: string;
  venue?: string;
  candidateName?: string;
  trigger: ReactNode;
}

export function QrPassDialog({ passId, eventTitle, eventDate, venue, candidateName, trigger }: Props) {
  const [open, setOpen] = useState(false);
  // The QR encodes a URL the staff scanner can open directly on their phone
  const scanUrl = typeof window !== "undefined"
    ? `${window.location.origin}/attend/${passId}`
    : `/attend/${passId}`;

  function download() {
    const svg = document.getElementById(`qr-${passId}`);
    if (!svg) return;
    const serializer = new XMLSerializer();
    const src = serializer.serializeToString(svg);
    const blob = new Blob([src], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${passId}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <TricolorBar />
        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="text-navy font-display">Udyoga Mela Entry Pass</DialogTitle>
            <DialogDescription>Show this QR at the venue gate. Staff will scan to mark entry.</DialogDescription>
          </DialogHeader>
          <div className="mt-4 rounded-2xl border-2 border-saffron/40 bg-saffron/5 p-6 text-center">
            <div className="inline-block bg-white p-3 rounded-xl shadow-soft">
              <QRCodeSVG id={`qr-${passId}`} value={scanUrl} size={200} bgColor="#ffffff" fgColor="#0B2A5B" level="H" />
            </div>
            <p className="mt-3 font-mono text-sm font-bold text-navy">{passId}</p>
            {candidateName && <p className="text-sm text-navy font-semibold mt-1">{candidateName}</p>}
            <p className="text-sm text-navy mt-2">{eventTitle}</p>
            {eventDate && <p className="text-xs text-muted-foreground mt-0.5">{eventDate}{venue ? ` · ${venue}` : ""}</p>}
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-india-green" />
            Single-use · Time-stamped · Linked to your Aadhaar-verified profile
          </div>
          <Button onClick={download} className="w-full mt-4 bg-navy text-white hover:bg-navy/90">
            <Download className="h-4 w-4 mr-1" /> Download Pass
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
