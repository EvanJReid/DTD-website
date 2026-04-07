import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Briefcase, User, Building2, Calendar, MapPin } from "lucide-react";
import type { CoopEntry } from "@/lib/api/types";

export type CoopFormData = Omit<CoopEntry, 'id' | 'addedAt' | 'addedBy'>;

interface AddCoopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CoopFormData) => void;
}

export function AddCoopModal({ isOpen, onClose, onSubmit }: AddCoopModalProps) {
  const [formData, setFormData] = useState<CoopFormData>({
    brotherName: "",
    company: "",
    position: "",
    semester: "",
    status: "current",
    location: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.brotherName.trim() || !formData.company.trim() || !formData.position.trim() || !formData.semester) return;
    onSubmit({ ...formData, location: formData.location?.trim() || undefined, notes: formData.notes?.trim() || undefined });
    setFormData({ brotherName: "", company: "", position: "", semester: "", status: "current", location: "", notes: "" });
    onClose();
  };

  const currentYear = new Date().getFullYear();
  const semesters: string[] = [];
  for (let year = currentYear + 1; year >= currentYear - 3; year--) {
    semesters.push(`Spring ${year}`, `Summer ${year}`, `Fall ${year}`);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Add Co-op Experience
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="brotherName" className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />Brother's Name
            </Label>
            <Input id="brotherName" placeholder="John Smith" value={formData.brotherName}
              onChange={(e) => setFormData({ ...formData, brotherName: e.target.value })} required maxLength={100} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />Company
            </Label>
            <Input id="company" placeholder="Amazon, Google, etc." value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })} required maxLength={100} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />Position
            </Label>
            <Input id="position" placeholder="Software Engineer Intern" value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })} required maxLength={150} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />Location (optional)
            </Label>
            <Input id="location" placeholder="San Francisco, CA" value={formData.location ?? ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })} maxLength={100} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="semester" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />Semester
              </Label>
              <Select value={formData.semester} onValueChange={(v) => setFormData({ ...formData, semester: v })}>
                <SelectTrigger id="semester"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {semesters.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(v: 'current' | 'past') => setFormData({ ...formData, status: v })}>
                <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500" />Current
                    </span>
                  </SelectItem>
                  <SelectItem value="past">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground" />Past
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea id="notes" placeholder="Team, tech stack, tips for applying..." value={formData.notes ?? ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} maxLength={500} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={!formData.semester}>Add Co-op</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
