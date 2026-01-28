import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import StepWrapper from "./StepWrapper";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

export const stepReviewSchema = z.object({
  agreeTerms: z.boolean().refine((v) => v === true, "Anda harus menyetujui syarat & ketentuan"),
});

interface Props {
  data: any;
  onChange: (p: any) => void;
  onSubmit: () => void;
  onBack: () => void;
  loading?: boolean;
}

export default function StepReview({ data, onChange, onSubmit, onBack, loading }: Props) {
  const { toast } = useToast();
  const validate = () => {
    const res = stepReviewSchema.safeParse(data);
    if (!res.success) {
      toast({ title: "Konfirmasi syarat & ketentuan", description: res.error.errors[0]?.message, variant: "destructive" });
      return false;
    }
    return true;
  };
  return (
    <StepWrapper keyId="step-4">
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="space-y-2">
          <div className="font-semibold">Ringkasan</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-xl border border-border">
              <div className="font-medium">Data Dasar</div>
              <div>{data.full_name}</div>
              <div>{data.email}</div>
              <div>{data.phone || "-"}</div>
            </div>
            <div className="p-3 rounded-xl border border-border">
              <div className="font-medium">Akun</div>
              <div>{data.username}</div>
            </div>
            <div className="p-3 rounded-xl border border-border">
              <div className="font-medium">Profil</div>
              <div>{data.city}</div>
              <div>{data.gender}</div>
              <div>{data.role}</div>
            </div>
            <div className="p-3 rounded-xl border border-border">
              <div className="font-medium">Bio</div>
              <div className="text-muted-foreground">{data.bio || "-"}</div>
            </div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Checkbox id="agreeTerms" checked={data.agreeTerms || false} onCheckedChange={(c) => onChange({ agreeTerms: c === true })} className="mt-1" />
          <Label htmlFor="agreeTerms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
            Saya menyetujui Syarat & Ketentuan dan berusia 18+
          </Label>
        </div>
      </div>
      <div className="flex justify-between">
        <Button variant="outline" className="rounded-xl" onClick={onBack}>Edit</Button>
        <Button variant="gradient" className="rounded-xl" disabled={loading} onClick={() => validate() && onSubmit()}>
          {loading ? "Mengirim..." : "Buat Akun"}
        </Button>
      </div>
    </StepWrapper>
  );
}
