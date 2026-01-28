import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import StepWrapper from "./StepWrapper";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin } from "lucide-react";

export const stepThreeSchema = z.object({
  date_of_birth: z.string().min(1, "Tanggal lahir wajib"),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]),
  city: z.string().min(2, "Domisili wajib"),
  bio: z.string().max(500).optional(),
  role: z.enum(["renter", "companion"], { message: "Pilih peran terlebih dahulu" }),
});

interface Props {
  data: any;
  onChange: (p: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepThree({ data, onChange, onNext, onBack }: Props) {
  const { toast } = useToast();
  const validate = () => {
    const res = stepThreeSchema.safeParse(data);
    if (!res.success) {
      toast({ title: "Lengkapi data profil", description: res.error.errors[0]?.message, variant: "destructive" });
      return false;
    }
    return true;
  };
  return (
    <StepWrapper keyId="step-3">
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="space-y-2">
          <Label>Tanggal Lahir</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input className="pl-10 h-12" type="date" value={data.date_of_birth || ""} onChange={(e) => onChange({ date_of_birth: e.target.value })} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Gender</Label>
          <select
            className="w-full h-12 px-3 rounded-xl border border-input bg-background"
            value={data.gender || "prefer_not_to_say"}
            onChange={(e) => onChange({ gender: e.target.value })}
          >
            <option value="prefer_not_to_say">Pilih gender</option>
            <option value="male">Laki-laki</option>
            <option value="female">Perempuan</option>
            <option value="other">Lainnya</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>Domisili</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input className="pl-10 h-12" value={data.city || ""} onChange={(e) => onChange({ city: e.target.value })} placeholder="Jakarta, Bandung, dll" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Bio Singkat (Opsional)</Label>
          <Textarea className="min-h-[100px]" value={data.bio || ""} onChange={(e) => onChange({ bio: e.target.value })} placeholder="Ceritakan sedikit tentang dirimu..." />
        </div>
        <div className="space-y-2">
          <Label>Pilih Peran</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className={`p-3 rounded-xl border-2 text-left transition-all ${data.role === "renter" ? "border-primary bg-primary/5" : "border-border"}`}
              onClick={() => onChange({ role: "renter" })}
            >
              <span className="font-semibold">Renter</span>
              <span className="text-xs text-muted-foreground">Cari companion</span>
            </button>
            <button
              type="button"
              className={`p-3 rounded-xl border-2 text-left transition-all ${data.role === "companion" ? "border-primary bg-primary/5" : "border-border"}`}
              onClick={() => onChange({ role: "companion" })}
            >
              <span className="font-semibold">Companion</span>
              <span className="text-xs text-muted-foreground">Tawarkan layanan</span>
            </button>
          </div>
        </div>
      </div>
      <div className="flex justify-between">
        <Button variant="outline" className="rounded-xl" onClick={onBack}>Kembali</Button>
        <Button variant="gradient" className="rounded-xl" onClick={() => validate() && onNext()}>Lanjut</Button>
      </div>
    </StepWrapper>
  );
}
