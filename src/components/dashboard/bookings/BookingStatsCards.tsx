import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Wallet, TrendingUp } from "lucide-react";
import { BookingStats } from "@/hooks/useCompanionBookings";

interface BookingStatsCardsProps {
  stats: BookingStats;
  loading: boolean;
}

export function BookingStatsCards({ stats, loading }: BookingStatsCardsProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);

  const cards = [
    {
      label: "Booking Hari Ini",
      value: stats.totalToday,
      icon: Calendar,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Booking Minggu Ini",
      value: stats.totalWeek,
      icon: TrendingUp,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: "Estimasi Pendapatan",
      value: formatCurrency(stats.revenueEstimate),
      icon: Wallet,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "Rata-rata Durasi",
      value: `${stats.avgDuration.toFixed(1)} Jam`,
      icon: Clock,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
              {loading ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                <h3 className="text-xl md:text-2xl font-bold text-foreground">
                  {card.value}
                </h3>
              )}
            </div>
            <div className={`p-3 rounded-xl ${card.bg}`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
