import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { companions } from "@/data/companions";
import { CalendarDays, Users, CheckCircle2 } from "lucide-react";

function isAvailableToday(availability: string) {
  const day = new Date().getDay();
  const isWeekend = day === 0 || day === 6;
  const text = availability.toLowerCase();
  if (text.includes("fleksibel") || text.includes("jadwal fleksibel")) return true;
  if (text.includes("weekdays") && !isWeekend) return true;
  if (text.includes("weekend") && isWeekend) return true;
  if (text.includes("senin") && day === 1) return true;
  if (text.includes("selasa") && day === 2) return true;
  if (text.includes("rabu") && day === 3) return true;
  if (text.includes("kamis") && day === 4) return true;
  if (text.includes("jumat") && day === 5) return true;
  if (text.includes("sabtu") && day === 6) return true;
  if (text.includes("minggu") && day === 0) return true;
  return false;
}

function isWeekendAvailable(availability: string) {
  const text = availability.toLowerCase();
  return text.includes("weekend") || text.includes("sabtu") || text.includes("minggu");
}

export function AvailabilityInfoSection() {
  const totalAvailableToday = companions.filter((c) => isAvailableToday(c.availability)).length;
  const availableOnWeekend = companions.filter((c) => isWeekendAvailable(c.availability)).length;
  const fullyBooked = 0;

  const categories = [
    { label: "Coffee Date", count: companions.filter((c) => c.activities.some((a) => a.toLowerCase().includes("coffee") || a.toLowerCase().includes("cafe"))).length },
    { label: "Jalan Santai", count: companions.filter((c) => c.activities.some((a) => a.toLowerCase().includes("jalan") || a.toLowerCase().includes("city"))).length },
    { label: "Event / Pameran", count: companions.filter((c) => c.activities.some((a) => a.toLowerCase().includes("event") || a.toLowerCase().includes("exhibition"))).length },
  ];

  return (
    <div className="space-y-4">
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Info Ketersediaan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl border bg-card flex items-center gap-3">
              <CalendarDays className="w-6 h-6 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Available Today</p>
                <p className="text-xl font-bold">{totalAvailableToday}</p>
              </div>
            </div>
            <div className="p-4 rounded-xl border bg-card flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Available on Weekend</p>
                <p className="text-xl font-bold">{availableOnWeekend}</p>
              </div>
            </div>
            <div className="p-4 rounded-xl border bg-card flex items-center gap-3">
              <Users className="w-6 h-6 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Fully Booked</p>
                <p className="text-xl font-bold">{fullyBooked}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <div key={cat.label} className="p-4 rounded-xl border bg-card">
                <p className="text-sm text-muted-foreground">{cat.label}</p>
                <p className="text-lg font-semibold">{cat.count} tersedia</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
