import { Check, User, KeyRound, IdCard, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  current: number;
  total?: number;
}

export default function StepIndicator({ current, total = 4 }: StepIndicatorProps) {
  const items = [
    { id: 1, label: "Data Dasar", icon: User },
    { id: 2, label: "Akun", icon: KeyRound },
    { id: 3, label: "Profil", icon: IdCard },
    { id: 4, label: "Review", icon: ClipboardCheck },
  ];
  const percent = Math.max(0, Math.min(100, ((current - 1) / (total - 1)) * 100));
  return (
    <div className="space-y-4">
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all" style={{ width: `${percent}%` }} />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {items.map((item, idx) => {
          const active = current === item.id;
          const done = current > item.id;
          const Icon = item.icon;
          return (
            <div key={item.id} className={cn("flex items-center justify-center gap-2 px-2 py-2 rounded-xl border", active ? "border-primary bg-primary/10" : "border-border")}>
              {done ? <Check className="w-4 h-4 text-primary" /> : <Icon className={cn("w-4 h-4", active ? "text-primary" : "text-muted-foreground")} />}
              <span className={cn("text-xs font-medium", active ? "text-primary" : "text-muted-foreground")}>{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
