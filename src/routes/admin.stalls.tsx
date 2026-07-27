import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function AddBlockModal({ eventId, onClose, onSuccess }: { eventId: number; onClose: () => void; onSuccess: () => void }) {
  const [kind, setKind] = useState("Building");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      toast.error("Please fill in both Name and Code.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`https://bcc-backend-0cny.onrender.com/api/admin/events/${eventId}/venue/blocks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, name: name.trim(), code: code.trim() })
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Venue block created successfully!");
        onSuccess();
        onClose();
      } else {
        toast.error(json.message || "Failed to create block.");
      }
    } catch (err) {
      console.error("Error creating block:", err);
      toast.error("Server connection error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleCreateBlock} className="space-y-4 p-4 bg-white rounded-xl shadow-lg border border-border">
      <div>
        <h3 className="font-bold text-navy text-lg">Add Block</h3>
        <p className="text-xs text-muted-foreground">Pick the type of container. You can add rooms and stalls inside after creating it.</p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-navy block mb-1">Type</label>
          <select 
            className="w-full border border-border rounded-lg px-3 py-2 bg-white text-navy text-sm font-medium"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
          >
            <option value="Building">Building</option>
            <option value="Hall">Hall</option>
            <option value="Ground">Ground</option>
            <option value="Block">Block</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-navy block mb-1">Name *</label>
          <input 
            type="text" 
            placeholder="e.g. Main Exhibition Hall"
            className="w-full border border-border rounded-lg px-3 py-2 text-sm text-navy"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-navy block mb-1">Code *</label>
          <input 
            type="text" 
            placeholder="e.g. HALL-A"
            className="w-full border border-border rounded-lg px-3 py-2 text-sm text-navy uppercase"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-saffron text-navy hover:bg-saffron/90 font-bold">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Create
        </Button>
      </div>
    </form>
  );
}
