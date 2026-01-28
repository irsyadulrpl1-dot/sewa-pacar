import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

interface ServiceDetailsProps {
  hourlyRate: number;
  minDuration?: number;
  packages: { name: string; duration: string; price: number }[];
  notes?: string;
}

export function ServiceDetails({ hourlyRate, minDuration = 1, packages, notes }: ServiceDetailsProps) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <Card className="p-6 border-border/40 shadow-sm">
      <h3 className="text-lg font-semibold text-foreground mb-4">Detail Layanan</h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center py-2 border-b border-border/40">
          <span className="text-muted-foreground">Harga per jam</span>
          <span className="font-medium">{formatPrice(hourlyRate)}</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-border/40">
          <span className="text-muted-foreground">Minimal Durasi</span>
          <span className="font-medium">{minDuration} Jam</span>
        </div>

        {packages.length > 0 && (
          <div className="pt-2">
            <span className="text-sm text-muted-foreground block mb-3">Paket Hemat</span>
            <div className="space-y-2">
              {packages.map((pkg, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm">{pkg.name} ({pkg.duration})</span>
                  </div>
                  <span className="font-bold text-primary text-sm">{formatPrice(pkg.price)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {notes && (
          <div className="pt-2">
            <span className="text-sm text-muted-foreground block mb-2">Catatan Tambahan</span>
            <p className="text-sm bg-muted/50 p-3 rounded-lg border border-border/40 italic text-muted-foreground">
              {notes}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
