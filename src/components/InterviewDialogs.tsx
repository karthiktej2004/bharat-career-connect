import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { addMessage, listMessagesFor, markThreadRead, type AppMessage } from "@/lib/mockStore";
import { MessageSquare, Send, User, Building2 } from "lucide-react";

export function MessageBoxDialog({
  open, onOpenChange, applicantId, applicantName, jobId, jobTitle, company, viewer,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  applicantId: string;
  applicantName: string;
  jobId: string;
  jobTitle: string;
  company: string;
  viewer: "employer" | "candidate";
}) {
  const [thread, setThread] = useState<AppMessage[]>([]);
  const [text, setText] = useState("");

  function reload() {
    setThread(listMessagesFor(applicantId, jobId));
  }
  useEffect(() => {
    if (!open) return;
    reload();
    markThreadRead(applicantId, jobId, viewer);
    const l = () => reload();
    window.addEventListener("bcc-messages", l);
    return () => window.removeEventListener("bcc-messages", l);
  }, [open, applicantId, jobId, viewer]);

  function send() {
    const t = text.trim();
    if (!t) return;
    addMessage({ applicantId, applicantName, jobId, jobTitle, company, from: viewer, text: t, kind: "chat" });
    setText("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><MessageSquare className="h-4 w-4" />Message box — {applicantName}</DialogTitle>
          <DialogDescription>{jobTitle} · {company}</DialogDescription>
        </DialogHeader>
        <div className="max-h-[45vh] overflow-y-auto space-y-2 border border-border/60 rounded-md p-3 bg-muted/20">
          {thread.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">No messages yet. Start the conversation.</p>
          )}
          {thread.map((m) => {
            const mine = m.from === viewer;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${mine ? "bg-saffron text-navy" : "bg-white border border-border"}`}>
                  <div className="flex items-center gap-1 text-[10px] opacity-70 mb-0.5">
                    {m.from === "employer" ? <Building2 className="h-3 w-3" /> : <User className="h-3 w-3" />}
                    {m.from === "employer" ? "Employer" : "Candidate"}
                    {m.kind && m.kind !== "chat" && <Badge variant="outline" className="ml-1 h-4 text-[10px]">{m.kind}</Badge>}
                    <span className="ml-1">· {new Date(m.at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-2 mt-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={viewer === "candidate" ? "Ask for a new slot, e.g. 'Can we reschedule to next Monday 3 PM?'" : "Type your message to the candidate…"}
            className="flex-1 min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <Button onClick={send} className="bg-navy text-white hover:bg-navy/90 self-end">
            <Send className="h-4 w-4 mr-1" />Send
          </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RejectWithReasonDialog({
  open, onOpenChange, applicantName, onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  applicantName: string;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  useEffect(() => { if (open) setReason(""); }, [open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reject {applicantName}</DialogTitle>
          <DialogDescription>Add a short description so the candidate knows why. It will be sent to them.</DialogDescription>
        </DialogHeader>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="e.g. Profile didn't match required experience for this role."
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            className="bg-red-600 text-white hover:bg-red-700"
            disabled={!reason.trim()}
            onClick={() => { onConfirm(reason.trim()); onOpenChange(false); }}
          >
            Reject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
