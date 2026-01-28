import { Badge } from "@/components/ui/badge";
import { CalendarClock } from "lucide-react";

interface ScheduleInfoProps {
  availability: string;
}

export function ScheduleInfo({ availability }: ScheduleInfoProps) {
  // Mock parsing or display the string. 
  // If the string is like "Senin - Jumat, 10:00 - 20:00", we can display it directly.
  
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <CalendarClock className="w-5 h-5 text-primary" />
        Jadwal & Ketersediaan
      </h3>
      
      <div className="flex flex-wrap gap-2">
        {availability ? (
          <Badge variant="outline" className="text-base py-2 px-4 font-normal bg-background border-border/60">
            {availability}
          </Badge>
        ) : (
          <Badge variant="outline" className="text-base py-2 px-4 font-normal bg-background border-border/60 text-muted-foreground">
            Tanyakan via Chat
          </Badge>
        )}
      </div>
    </div>
  );
}
