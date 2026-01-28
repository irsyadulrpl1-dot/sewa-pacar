import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import StepWrapper from "./StepWrapper";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, User, ImageDown } from "lucide-react";

export const stepOneSchema = z.object({
  full_name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().min(8, "No HP tidak valid").optional(),
  avatar_url: z.string().optional(),
});

interface Props {
  data: any;
  onChange: (p: any) => void;
  onNext: () => void;
}

export default function StepOne({ data, onChange, onNext }: Props) {
  const { toast } = useToast();
  const validate = () => {
    const res = stepOneSchema.safeParse(data);
    if (!res.success) {
      toast({ title: "Periksa kembali data", description: res.error.errors[0]?.message, variant: "destructive" });
      return false;
    }
    return true;
  };
  return (
    <StepWrapper keyId="step-1">
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="space-y-2">
          <Label>Nama Lengkap</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input className="pl-10 h-12" value={data.full_name || ""} onChange={(e) => onChange({ full_name: e.target.value })} placeholder="Masukkan nama lengkap" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input className="pl-10 h-12" type="email" value={data.email || ""} onChange={(e) => onChange({ email: e.target.value })} placeholder="email@example.com" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>No HP (Opsional)</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input className="pl-10 h-12" value={data.phone || ""} onChange={(e) => onChange({ phone: e.target.value })} placeholder="08xxxxxxxxxx" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Foto Profil (Opsional)</Label>
          <div className="relative">
            <ImageDown className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input className="pl-10 h-12" value={data.avatar_url || ""} onChange={(e) => onChange({ avatar_url: e.target.value })} placeholder="URL gambar" />
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button variant="gradient" className="rounded-xl" onClick={() => validate() && onNext()}>
          Lanjut
        </Button>
      </div>
    </StepWrapper>
  );
}
