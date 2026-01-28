import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import StepWrapper from "./StepWrapper";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, UserCircle, Lock, Gauge } from "lucide-react";
import { useState, useMemo } from "react";

export const stepTwoSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter").regex(/^[a-zA-Z0-9_]+$/, "Hanya huruf, angka, underscore"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: "Password tidak cocok", path: ["confirmPassword"] });

function strength(pw: string) {
  let s = 0;
  if (pw.length >= 6) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

interface Props {
  data: any;
  onChange: (p: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepTwo({ data, onChange, onNext, onBack }: Props) {
  const { toast } = useToast();
  const [show, setShow] = useState(false);
  const meter = useMemo(() => strength(data.password || ""), [data.password]);
  const validate = () => {
    const res = stepTwoSchema.safeParse(data);
    if (!res.success) {
      toast({ title: "Periksa data akun", description: res.error.errors[0]?.message, variant: "destructive" });
      return false;
    }
    return true;
  };
  return (
    <StepWrapper keyId="step-2">
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="space-y-2">
          <Label>Username</Label>
          <div className="relative">
            <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input className="pl-10 h-12" value={data.username || ""} onChange={(e) => onChange({ username: e.target.value })} placeholder="username_kamu" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input className="pl-10 pr-10 h-12" type={show ? "text" : "password"} value={data.password || ""} onChange={(e) => onChange({ password: e.target.value })} placeholder="••••••••" />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShow(!show)}>
              {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div className={`h-full transition-all ${meter >= 1 ? "bg-red-400" : "bg-transparent"}`} style={{ width: `${(meter / 4) * 100}%` }} />
            </div>
            <span className="text-xs text-muted-foreground">{["Lemah","Cukup","Baik","Kuat"][Math.max(0, meter-1)] || "Lemah"}</span>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Konfirmasi Password</Label>
          <Input className="h-12" type={show ? "text" : "password"} value={data.confirmPassword || ""} onChange={(e) => onChange({ confirmPassword: e.target.value })} placeholder="••••••••" />
        </div>
      </div>
      <div className="flex justify-between">
        <Button variant="outline" className="rounded-xl" onClick={onBack}>Kembali</Button>
        <Button variant="gradient" className="rounded-xl" onClick={() => validate() && onNext()}>Lanjut</Button>
      </div>
    </StepWrapper>
  );
}
