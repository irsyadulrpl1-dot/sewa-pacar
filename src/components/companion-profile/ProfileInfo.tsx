import { Card } from "@/components/ui/card";
import { User, MapPin, Globe, Sparkles } from "lucide-react";

interface ProfileInfoProps {
  about: string;
  age: number;
  city: string;
  serviceType?: string; // e.g. "Online & Offline"
  experience?: string; // e.g. "1 Tahun"
}

export function ProfileInfo({ about, age, city, serviceType = "Online & Offline", experience = "Baru Bergabung" }: ProfileInfoProps) {
  const items = [
    { label: "Umur", value: `${age} Tahun`, icon: User },
    { label: "Lokasi", value: city, icon: MapPin },
    { label: "Layanan", value: serviceType, icon: Globe },
    { label: "Pengalaman", value: experience, icon: Sparkles },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {items.map((item, i) => (
          <div key={i} className="p-4 rounded-xl bg-muted/30 border border-border/40">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <item.icon className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">{item.label}</span>
            </div>
            <p className="font-medium text-foreground">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Tentang Saya</h3>
        <p className="text-muted-foreground leading-relaxed">
          {about || "Belum ada deskripsi diri."}
        </p>
      </div>
    </div>
  );
}
